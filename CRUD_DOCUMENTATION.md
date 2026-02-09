# 📚 Documentação CRUD - FinFlow

Esta documentação explica **passo a passo** como o sistema de CRUD (Create, Read, Update, Delete) funciona no projeto FinFlow, uma aplicação de controle financeiro pessoal.

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
│   └── page.tsx              # 🎯 Página principal (orquestra o CRUD)
├── components/
│   ├── new-transaction-form.tsx  # ✏️ Formulário de criação
│   └── transaction-list.tsx      # 📋 Listagem + exclusão
├── lib/
│   └── supabase.ts           # 🔌 Conexão com banco de dados
└── types/
    └── index.ts              # 📝 Definição do modelo Transaction
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

## 📖 3. READ (Leitura de Dados)

> **Arquivo:** `app/page.tsx`

### Função `fetchTransacoes`

```typescript
async function fetchTransacoes() {
  const { data } = await supabase
    .from("transactions") // Seleciona a tabela
    .select("*") // Pega todas as colunas
    .order("date", { ascending: false }); // Ordena por data (mais recente primeiro)

  setTransacoes(data || []); // Atualiza o estado React
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

### 4.3 Salvando no Banco

A função `handleSalvar` no `page.tsx` faz a inserção:

```typescript
async function handleSalvar(dadosDoFormulario: any) {
  // Pega o usuário logado
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Insere no banco
  const { error } = await supabase.from("transactions").insert({
    ...dadosDoFormulario, // Descrição, valor, categoria, etc.
    user_id: user.id, // Vincula ao usuário
  });

  if (error) {
    console.error(error);
    alert("Erro ao salvar");
  } else {
    await fetchTransacoes(); // Recarrega a lista
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
  await supabase
    .from("transactions")
    .delete() // Operação DELETE
    .eq("id", id); // WHERE id = ?

  fetchTransacoes(); // Recarrega a lista
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

Em `app/page.tsx`, adicionamos a função `handleUpdate` que se comunica com o Supabase:

```typescript
async function handleUpdate(id: string, transaction: Partial<Transaction>) {
  const { error } = await supabase
    .from("transactions")
    .update(transaction) // Dados novos
    .eq("id", id); // Qual linha atualizar

  if (!error) {
    await fetchTransacoes(); // Atualiza a tela
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

| Operação   | Método Supabase | Arquivo                        |
| ---------- | --------------- | ------------------------------ |
| **CREATE** | `.insert()`     | `page.tsx` → `handleSalvar`    |
| **READ**   | `.select()`     | `page.tsx` → `fetchTransacoes` |
| **UPDATE** | `.update()`     | `page.tsx` → `handleUpdate`    |
| **DELETE** | `.delete()`     | `page.tsx` → `handleExcluir`   |

---

## 📊 8. DIAGRAMA DE COMPONENTES

```
┌──────────────────────────────────────────────────────────────┐
│                        page.tsx                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Estados:                                             │    │
│  │   - transacoes: Transaction[]                        │    │
│  │                                                      │    │
│  │ Funções CRUD:                                        │    │
│  │   - fetchTransacoes()  → READ                        │    │
│  │   - handleSalvar()     → CREATE                      │    │
│  │   - handleExcluir()    → DELETE                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                 │
│            ┌───────────────┼───────────────┐                │
│            ▼               ▼               ▼                │
│  ┌─────────────────┐ ┌──────────────┐ ┌────────────────┐   │
│  │ SummaryCards    │ │ NewTransaction│ │ TransactionList│   │
│  │ (visualização)  │ │ Form (CREATE)│ │ (READ/DELETE)  │   │
│  └─────────────────┘ └──────────────┘ └────────────────┘   │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │    Supabase     │
                    │   (PostgreSQL)  │
                    └─────────────────┘
```

---

## 🚀 Próximos Passos de Estudo

1. **Autenticação:** Veja como o Supabase Auth protege as rotas
2. **Validação:** Adicione validação de formulários com Zod ou React Hook Form
3. **Edição:** Implemente a funcionalidade de UPDATE
4. **Paginação:** Adicione paginação para listas grandes
5. **Filtros:** Implemente filtros por data, categoria, etc.

---

> 💡 **Dica:** Para testar as queries do Supabase, use o SQL Editor no dashboard do Supabase!
