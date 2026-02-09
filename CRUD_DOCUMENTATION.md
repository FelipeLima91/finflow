# 📚 Documentação CRUD - FinFlow

Esta documentação explica **passo a passo** como o sistema de CRUD (Create, Read, Update, Delete) funciona no projeto FinFlow, uma aplicação de controle financeiro pessoal. O sistema suporta dois modos: **Usuário Autenticado** (Supabase) e **Modo Visitante** (LocalStorage).

---

## 🏗️ Visão Geral da Arquitetura

O FinFlow utiliza as seguintes tecnologias:

| Tecnologia     | Função                                                          |
| -------------- | --------------------------------------------------------------- |
| **Next.js 14** | Framework React com App Router                                  |
| **TypeScript** | Tipagem estática                                                |
| **Supabase**   | Backend-as-a-Service (banco de dados PostgreSQL + autenticação) |
| **Shadcn/UI**  | Biblioteca de componentes                                       |

### Estrutura de Arquivos Relevantes

```
finflow/
├── app/
│   ├── page.tsx                 # 🎯 Página principal (orquestra o CRUD)
│   └── login/
│       └── page.tsx             # 🔐 Tela de login + botão Visitante
├── components/
│   ├── header.tsx               # 🏷️ Cabeçalho (exibe usuário/visitante)
│   ├── new-transaction-form.tsx # ✏️ Formulário de criação
│   └── transaction-list.tsx     # 📋 Listagem + edição + exclusão
├── services/
│   └── transactionService.ts   # 🔀 Camada de abstração (Supabase ou LocalStorage)
├── lib/
│   └── supabase.ts             # 🔌 Conexão com banco de dados
└── types/
    └── index.ts                # 📝 Definição do modelo Transaction
```

---

## 📝 1. MODELO DE DADOS (Types)

> **Arquivo:** `types/index.ts`

O primeiro passo é definir **como uma transação se parece**. Usamos TypeScript para criar uma interface:

```typescript
export interface Transaction {
  id: string; // ID único (gerado pelo Supabase)
  description: string; // Ex: "Mercado", "Salário"
  amount: number; // Valor em reais (ex: 150.50)
  type: "income" | "expense"; // Entrada ou Saída
  category: string; // Ex: "Alimentação", "Transporte"
  date: string; // Data em formato ISO
}
```

### 💡 Por que isso é importante?

- Garante que todos os dados tenham a mesma estrutura
- Evita erros de digitação (autocomplete no VSCode)
- Facilita a manutenção do código

---

## 🔌 2. CONEXÃO COM O BANCO (Supabase Client)

> **Arquivo:** `lib/supabase.ts`

A conexão com o Supabase é configurada uma única vez e exportada para uso em toda a aplicação:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### 💡 Conceitos Importantes:

- **`process.env`**: Variáveis de ambiente (nunca exponha credenciais no código!)
- **`createClient`**: Cria a instância do cliente Supabase
- **`export`**: Permite importar esse cliente em qualquer arquivo

---

## 🔀 2.5. CAMADA DE SERVIÇO (TransactionService)

> **Arquivo:** `services/transactionService.ts`

Para suportar o **Modo Visitante**, criamos uma abstração que permite que a página principal funcione da mesma forma independente de onde os dados são salvos:

```typescript
export interface TransactionService {
  getAll: () => Promise<Transaction[]>;
  create: (data: Omit<Transaction, "id">) => Promise<void>;
  update: (id: string, data: Partial<Transaction>) => Promise<void>;
  delete: (id: string) => Promise<void>;
}
```

### Duas implementações:

| Implementação                | Armazena em               | Quando é usada      |
| ---------------------------- | ------------------------- | ------------------- |
| `SupabaseTransactionService` | PostgreSQL (Supabase)     | Usuário autenticado |
| `LocalTransactionService`    | localStorage do navegador | Modo Visitante      |

### `LocalTransactionService` — Detalhes:

- **Simula delay de rede** (300ms) para uma experiência realista
- **Expiração automática** de 24 horas — após esse período os dados são apagados
- Usa `crypto.randomUUID()` para gerar IDs compatíveis com a interface

### 💡 Por que essa abstração?

A `page.tsx` não sabe se está falando com o Supabase ou o LocalStorage. Ela apenas chama `service.create()`, `service.getAll()`, etc. Isso é o **Padrão Strategy** na prática:

```typescript
// Em page.tsx — a mesma lógica funciona para ambos os modos
const [service, setService] = useState<TransactionService | null>(null);

// No useEffect, decide qual serviço usar:
if (guestMode) {
  setService(LocalTransactionService); // LocalStorage
} else {
  setService(SupabaseTransactionService); // Supabase
}
```

---

## 📖 3. READ (Leitura de Dados)

> **Arquivo:** `app/page.tsx`

### Função `fetchTransacoes`

Agora a leitura passa pelo serviço dinâmico:

```typescript
async function fetchTransacoes(svc: TransactionService) {
  const data = await svc.getAll(); // Funciona com Supabase ou LocalStorage
  setTransacoes(data || []);
}
```

### 🔍 Entendendo Passo a Passo:

1. **`supabase.from("transactions")`** → Seleciona a tabela "transactions"
2. **`.select("*")`** → Busca todas as colunas (poderia ser `.select("id, description")`)
3. **`.order("date", { ascending: false })`** → Ordena por data decrescente
4. **`setTransacoes(data || [])`** → Armazena os dados no state do React

### 💡 Quando é Chamada?

- Ao carregar a página (`useEffect`)
- Após criar uma nova transação
- Após excluir uma transação

---

## ✏️ 4. CREATE (Criação de Dados)

> **Arquivos:** `app/page.tsx` + `components/new-transaction-form.tsx`

### 4.1 Formulário de Criação

O componente `NewTransactionForm` coleta os dados do usuário:

```typescript
// Estados para armazenar os valores do formulário
const [amount, setAmount] = React.useState("");
const [category, setCategory] = React.useState("");
const [description, setDescription] = React.useState("");
const [type, setType] = React.useState<"entrada" | "saida">("saida");
```

### 4.2 Preparação dos Dados

Ao clicar em "Adicionar", os dados são formatados:

```typescript
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault(); // Impede o reload da página

  // Converte "R$ 1.200,50" → 1200.50
  const numericAmount = Number(amount.replace(/\D/g, "")) / 100;

  // Chama a função do componente pai
  await onSave({
    description,
    amount: numericAmount,
    category,
    type: type === "entrada" ? "income" : "expense",
    date: new Date().toISOString(),
  });

  // Limpa o formulário
  setDescription("");
  setAmount("");
  setCategory("");
}
```

### 4.3 Salvando (via Service)

A função `handleSalvar` no `page.tsx` agora usa o serviço dinâmico:

```typescript
async function handleSalvar(dadosDoFormulario: any) {
  if (!service) return;

  try {
    await service.create(dadosDoFormulario); // Supabase ou LocalStorage
    await fetchTransacoes(service); // Recarrega a lista
  } catch (error) {
    console.error(error);
    alert("Erro ao salvar");
  }
}
```

### 🔍 Fluxo Completo do CREATE:

```
┌─────────────────────┐
│ Usuário preenche    │
│ o formulário        │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ handleSubmit()      │
│ formata os dados    │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ onSave() chama      │
│ handleSalvar()      │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ supabase.insert()   │
│ salva no banco      │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ fetchTransacoes()   │
│ atualiza a lista    │
└─────────────────────┘
```

---

## 🗑️ 5. DELETE (Exclusão de Dados)

> **Arquivos:** `app/page.tsx` + `components/transaction-list.tsx`

### 5.1 Função de Exclusão

```typescript
async function handleExcluir(id: string) {
  if (!service) return;
  await service.delete(id); // Funciona com Supabase ou LocalStorage
  fetchTransacoes(service); // Recarrega a lista
}
```

### 5.2 Confirmação de Exclusão

O `TransactionList` usa um modal de confirmação (AlertDialog):

```typescript
// Estado para controlar qual item será excluído
const [deleteId, setDeleteId] = useState<string | null>(null);

// Abre o modal de confirmação
const confirmDelete = (id: string) => {
  setDeleteId(id);
};

// Executa a exclusão após confirmação
const handleDelete = async () => {
  if (deleteId) {
    await onDelete(deleteId); // Chama handleExcluir do pai
    setDeleteId(null); // Fecha o modal
  }
};
```

### 5.3 Interface do Modal

```tsx
<AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
      <AlertDialogDescription>
        Essa ação não pode ser desfeita.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## 🔄 6. UPDATE (Atualização de Dados)

> **Arquivos:** `app/page.tsx` + `components/transaction-list.tsx`

### 6.1 Função de Atualização (Backend)

Em `app/page.tsx`, a função `handleUpdate` usa o serviço dinâmico:

```typescript
async function handleUpdate(id: string, transaction: Partial<Transaction>) {
  if (!service) return;

  try {
    await service.update(id, transaction); // Supabase ou LocalStorage
    await fetchTransacoes(service); // Atualiza a tela
  } catch (error) {
    console.error(error);
    alert("Erro ao atualizar a transação");
  }
}
```

### 6.2 Edição na Interface (Frontend)

No componente `TransactionList`, implementamos a **Edição Inline** (direto na tabela):

1.  **Estado Local:** O componente sabe qual linha está sendo editada (`editingId`).
2.  **Renderização Condicional:**
    - Se a linha **NÃO** está em edição: Mostra texto apenas.
    - Se a linha **ESTÁ** em edição: Mostra Inputs (`<input>`).
3.  **Botões de Ação:**
    - _Modo Leitura_: Botão Lápis (✏️) inicia a edição.
    - _Modo Edição_: Botão Salvar (✅) chama `handleUpdate` e Botão Cancelar (❌) descarta mudanças.

```typescript
// Exemplo simplificado da lógica no TransactionList
{editingId === transaction.id ? (
  // Mostra Inputs e Botão Salvar
  <>
    <Input value={editForm.description} ... />
    <Button onClick={saveEditing}>Salvar</Button>
  </>
) : (
  // Mostra Texto e Botão Editar
  <>
    <span>{transaction.description}</span>
    <Button onClick={() => startEditing(transaction)}>Editar</Button>
  </>
)}
```

---

## 🎯 7. RESUMO DAS OPERAÇÕES

| Operação   | Via Service        | Arquivo                        |
| ---------- | ------------------ | ------------------------------ |
| **CREATE** | `service.create()` | `page.tsx` → `handleSalvar`    |
| **READ**   | `service.getAll()` | `page.tsx` → `fetchTransacoes` |
| **UPDATE** | `service.update()` | `page.tsx` → `handleUpdate`    |
| **DELETE** | `service.delete()` | `page.tsx` → `handleExcluir`   |

---

## 📊 8. DIAGRAMA DE COMPONENTES

```
┌──────────────────────────────────────────────────────────────┐
│                        page.tsx                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Estados:                                             │    │
│  │   - transacoes: Transaction[]                        │    │
│  │   - service: TransactionService                      │    │
│  │   - isGuest: boolean                                 │    │
│  │                                                      │    │
│  │ Funções CRUD (via service):                          │    │
│  │   - fetchTransacoes()  → service.getAll()            │    │
│  │   - handleSalvar()     → service.create()            │    │
│  │   - handleUpdate()     → service.update()            │    │
│  │   - handleExcluir()    → service.delete()            │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                 │
│            ┌───────────────┼───────────────┐                │
│            ▼               ▼               ▼                │
│  ┌─────────────────┐ ┌──────────────┐ ┌────────────────┐   │
│  │ SummaryCards    │ │ NewTransaction│ │ TransactionList│   │
│  │ (visualização)  │ │ Form (CREATE)│ │ (CRUD completo)│   │
│  └─────────────────┘ └──────────────┘ └────────────────┘   │
└──────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
          ┌─────────────────┐ ┌─────────────────┐
          │    Supabase     │ │  LocalStorage   │
          │  (Autenticado)  │ │   (Visitante)   │
          └─────────────────┘ └─────────────────┘
```

---

## 👤 9. MODO VISITANTE

O app permite que novos usuários **testem a interface sem criar conta**.

### Como Funciona:

1. Na tela de login, o usuário clica em **"Entrar como Visitante"**
2. `localStorage.setItem("isGuest", "true")` marca a sessão
3. A `page.tsx` detecta o guest mode e usa `LocalTransactionService`
4. Um **banner amarelo** informa que os dados são temporários
5. O Header exibe **"Olá, Visitante"** em vez do email

### Expiração e Limpeza:

| Cenário              | O que acontece                                                                 |
| -------------------- | ------------------------------------------------------------------------------ |
| Usuário clica "Sair" | Remove `isGuest`, `finflow_guest_transactions` e `finflow_guest_session_start` |
| 24 horas se passam   | `LocalTransactionService.getAll()` detecta e limpa automaticamente             |

### Chaves no LocalStorage:

| Chave                         | Propósito                                             |
| ----------------------------- | ----------------------------------------------------- |
| `isGuest`                     | Flag indicando modo visitante ativo                   |
| `finflow_guest_transactions`  | Array JSON com as transações do visitante             |
| `finflow_guest_session_start` | Timestamp de início da sessão (para expiração de 24h) |

---

## 🚀 10. Próximos Passos de Estudo

1. **Autenticação:** Veja como o Supabase Auth protege as rotas
2. **Validação:** Adicione validação de formulários com Zod ou React Hook Form
3. **Paginação:** Adicione paginação para listas grandes
4. **Filtros:** Implemente filtros por data, categoria, etc.

---

> 💡 **Dica:** Para testar as queries do Supabase, use o SQL Editor no dashboard do Supabase!
