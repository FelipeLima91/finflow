# 💰 FinFlow

O seu gerenciador financeiro pessoal, simples e eficiente.

## 🚀 Como Iniciar

Primeiro, Instalar:

```bash
npm install
```

Depois, rode o servidor de desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

## 🏗️ Arquitetura do Projeto

### 1. 🧠 O Cérebro e a Cara (Frontend + Backend)

- **Tecnologia**: [Next.js](https://nextjs.org) (versão mais recente)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Por que?**: É a linguagem padrão do mercado. O TypeScript é vital para apps financeiros porque bloqueia erros "bobos" (como tentar somar texto com número).
- **Onde vive a lógica**: No próprio Next.js. Ele une o site (Front) e a lógica (Back), simplificando arquivos e configurações.

### 2. 🎨 A Maquiagem (Estilo e Design)

- **Tecnologia**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/UI](https://ui.shadcn.com/)
- **Como funciona**: Em vez de desenhar botões do zero, usamos o Shadcn que já entrega componentes elegantes (estilo Apple/Google) prontos para copiar e colar.

### 3. 💾 A Memória (Banco de Dados e Login)

- **Tecnologia**: [Supabase](https://supabase.com/)
- **Banco de Dados**: PostgreSQL. O mais robusto e seguro do mundo open-source. Perfeito para lidar com dinheiro.
- **Autenticação**: O próprio Supabase gerencia o login. Segurança e criptografia já vêm prontas.
- **Estratégia**: Um único usuário para a família inteira acessar.
- **Modo Visitante**: Também é possível testar o app sem login, usando LocalStorage como armazenamento temporário.

### 4. 🏠 A Casa (Hospedagem/Deploy)

- **Plataforma**: [Vercel](https://vercel.com/)
- **Conexão**: Conecta direto no seu código. Salvou no computador -> Atualiza no site em 1 minuto.

---

### 🗄️ Supabase (Banco de Dados)

- **Custo**: R$ 0,00 (Plano Free)
- **Limite**: 500MB de dados.
- **Na prática**: Texto de gastos ocupa bytes. Levaria anos lançando milhares de gastos por dia para encher.

### ⚡ Funcionalidades com Supabase

O app utiliza o poder do Supabase para gerenciar todas as transações em tempo real:

1.  **Inserção de Dados (`Insert`)**:
    - Ao preencher o formulário, os dados são enviados diretamente para a tabela `transactions`.
    - Suporte a tipos: Texto (Descrição), Moeda (Valor), Categoria e Data.

2.  **Exclusão Segura (`Delete`)**:
    - Implementamos um **Modo de Edição** ativado pelo ícone de lápis.
    - Ao clicar na lixeira, um modal de confirmação aparece para evitar cliques acidentais.
    - A exclusão é refletida instantaneamente no banco de dados.

3.  **Leitura (`Select`)**:
    - Ao abrir o app, buscamos as últimas transações automaticamente.
    - O saldo e os cards de resumo são calculados com base nesses dados vivos.

4.  **Edição (`Update`)**:
    - Ao ativar o Modo de Edição (lápis), ícones adicionais aparecem.
    - É possível alterar descrição, valor e data diretamente na tabela.
    - As alterações são salvas clicando no ícone de confirmação.

### 🔀 Camada de Abstração (TransactionService)

Para suportar o Modo Visitante, o app usa uma **camada de serviço** que abstrai o armazenamento:

| Serviço                      | Armazena em           | Quando é usado      |
| ---------------------------- | --------------------- | ------------------- |
| `SupabaseTransactionService` | PostgreSQL (Supabase) | Usuário autenticado |
| `LocalTransactionService`    | `localStorage`        | Modo Visitante      |

A página principal (`page.tsx`) não sabe qual backend está usando — ela apenas chama `service.create()`, `service.getAll()`, etc.

---

## ✨ Funcionalidades do App

### 📝 Adicionar Transação

Preencha o formulário na esquerda com:

- **Descrição**: O que você comprou/recebeu.
- **Valor**: O valor da transação.
- **Categoria**: Classifique para organizar (Alimentação, Casa, Lazer, etc).
- **Tipo**: Entrada (+) ou Saída (-).

### ✏️ Editar e Excluir Transação

1.  Na lista de movimentações, clique no **ícone de lápis** no cabeçalho.
2.  Dois ícones aparecerão em cada linha: **Lápis (Editar)** e **Lixeira (Excluir)**.
3.  **Para Editar**: Clique no lápis da linha, altere os dados nos campos e clique no "Check" para salvar.
4.  **Para Excluir**: Clique na lixeira e confirme a ação no modal.

### 👤 Modo Visitante

É possível testar o app **sem criar conta**:

1. Na tela de login, clique em **"Entrar como Visitante"**.
2. Use o app normalmente — crie, edite e exclua transações.
3. Os dados ficam salvos apenas **neste navegador** (LocalStorage).
4. Um banner amarelo indica que você está em modo temporário.
5. Os dados **expiram automaticamente após 24 horas** ou ao clicar em "Sair".

---

## 🔒 Segurança e Open Source

Como o código é aberto para aprendizado, a segurança funciona assim:

> **O Código (Público)** 🔓
> A "receita do bolo" fica no GitHub. Todos veem como o site é feito.

> **As Chaves (Privadas)** 🗝️
> As senhas de acesso ao banco ("variáveis de ambiente") ficam escondidas apenas na Vercel.

---

## 🛠️ Configuração para Desenvolvedores (Clone)

Se você clonou este repositório e quer rodar o projeto com seu próprio banco de dados:

### 1. Configurando o Supabase (Padrão)

O projeto vem configurado para usar o Supabase. Siga os passos:

1.  Crie um projeto no [Supabase](https://supabase.com/).
2.  Crie um arquivo `.env.local` na raiz do projeto com suas credenciais:

```bash
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

3.  No painel do Supabase (SQL Editor), rode o seguinte script para criar a tabela:

```sql
create table transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  description text not null,
  amount numeric not null,
  type text check (type in ('income', 'expense')) not null,
  category text not null,
  date timestamp with time zone not null
);

-- Habilitar segurança (RLS)
alter table transactions enable row level security;

-- Política: Usuários só acessam seus próprios dados
create policy "Users can CRUD their own rows"
on transactions for all
using (auth.uid() = user_id);
```

### 2. Usando Firebase ou Outros

Graças à arquitetura limpa (Service Pattern) em `services/transactionService.ts`, você pode trocar o Supabase por Firebase, AWS Amplify ou até uma API própria.

1.  Crie uma nova implementação da interface `TransactionService`.
2.  No arquivo `app/page.tsx`, troque o `SupabaseTransactionService` pela sua nova implementação.

---

## 📚 Saiba Mais

Para aprender mais sobre as tecnologias usadas:

- [Documentação Next.js](https://nextjs.org/docs)
- [Aprenda Next.js](https://nextjs.org/learn)
