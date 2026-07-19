# 💰 FinFlow

O seu gerenciador financeiro pessoal, simples e eficiente — feito para ser usado **em conjunto** (você e mais alguém, na mesma conta).

## 🚀 Como Iniciar

**1. Instale as dependências:**

```bash
npm install
```

**2. Configure as variáveis de ambiente.** Crie um arquivo `.env.local` na raiz:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
```

> **Onde achar esses valores:** no painel do Supabase, clique em **Connect** (topo da página) → aba **App Frameworks** → **Next.js**. Ele mostra as duas linhas prontas para copiar.
> Alternativa: **Project Settings → API** (use a chave `anon` / `public` — **nunca** a `service_role`).
>
> Se o projeto já está na Vercel, dá para baixar tudo de uma vez: `npx vercel link && npx vercel env pull .env.local`

**3. Prepare o banco** (veja [Configuração do Banco](#-configuração-do-banco) abaixo).

**4. Rode o servidor:**

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

> 💡 Quer só dar uma olhada sem configurar nada? Rode `npm run dev` e clique em **"Entrar como Visitante"** na tela de login — funciona 100% offline, sem Supabase.

---

## 🏗️ Arquitetura do Projeto

### 1. 🧠 O Cérebro e a Cara (Frontend + Backend)

- **Tecnologia**: [Next.js 16](https://nextjs.org) (App Router) + [React 19](https://react.dev)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Por que?**: É a linguagem padrão do mercado. O TypeScript é vital para apps financeiros porque bloqueia erros "bobos" (como tentar somar texto com número).
- **Onde vive a lógica**: No próprio Next.js. Ele une o site (Front) e a lógica (Back), simplificando arquivos e configurações.

### 2. 🎨 A Maquiagem (Estilo e Design)

- **Tecnologia**: [Tailwind CSS v4](https://tailwindcss.com/) + [Shadcn/UI](https://ui.shadcn.com/) + [Recharts](https://recharts.org/) para os gráficos
- **Direção visual**: clean minimalista (estilo Linear/Mercury) — bastante respiro, bordas sutis, sombras suaves, e **azul confiança** como cor de marca.
- **Design tokens**: tudo vive em [`app/globals.css`](app/globals.css) como CSS variables. Isso inclui tokens **semânticos de finanças** — `--income` (entrada, verde) e `--expense` (saída, vermelho).

> ⚠️ Ao criar UI nova, **use os tokens** (`bg-background`, `text-muted-foreground`, `text-income`, `text-expense`) em vez de cores fixas tipo `zinc-500` ou `emerald-600`. É o que mantém o tema claro/escuro coerente.

### 3. 💾 A Memória (Banco de Dados e Login)

- **Tecnologia**: [Supabase](https://supabase.com/)
- **Banco de Dados**: PostgreSQL. O mais robusto e seguro do mundo open-source. Perfeito para lidar com dinheiro.
- **Autenticação**: O próprio Supabase gerencia o login. Segurança e criptografia já vêm prontas.
- **Estratégia**: **conta conjunta** — cada pessoa tem seu próprio login, mas todas enxergam as mesmas transações, e cada lançamento fica marcado com quem fez.
- **Modo Visitante**: dá para testar sem login, usando LocalStorage como armazenamento temporário.

### 4. 🏠 A Casa (Hospedagem/Deploy)

- **Plataforma**: [Vercel](https://vercel.com/)
- **Conexão**: Conecta direto no seu código. Salvou no computador → Atualiza no site em 1 minuto.
- **Importante**: as variáveis de ambiente precisam estar cadastradas na Vercel (Settings → Environment Variables), senão o build quebra.

---

## 🗄️ Configuração do Banco

Os scripts SQL ficam em [`supabase/`](supabase/) e devem ser colados no **SQL Editor** do Supabase.

| Arquivo | O que faz | Quando rodar |
| --- | --- | --- |
| [`schema.sql`](supabase/schema.sql) | Cria a tabela `transactions` + RLS básica | Projeto novo, do zero |
| [`migrations/001_conta_conjunta.sql`](supabase/migrations/001_conta_conjunta.sql) | Cria `profiles`, `households`, `household_members`, migra a RLS e faz backfill | Uma vez, depois do schema |
| [`migrations/002_adicionar_membro.sql`](supabase/migrations/002_adicionar_membro.sql) | Adiciona uma pessoa à conta conjunta | Toda vez que entrar alguém novo |

Os scripts são **idempotentes e aditivos** — podem rodar mais de uma vez sem apagar dados.

### Modelo de dados

```
auth.users ──1:1── profiles          (espelho público: nome + email)
                       │
households ──*── household_members ──┘   (quem participa de qual conta)
     │
     └──*── transactions              (household_id = a conta, user_id = quem lançou)
```

**Por que `profiles` existe?** O navegador não consegue ler `auth.users` direto (schema protegido). O `profiles` espelha os dados públicos e é o que permite mostrar **quem lançou** cada transação. Ele é preenchido sozinho por um trigger no cadastro.

### 👥 Adicionando alguém à conta conjunta

Não existe tela de cadastro no app (proposital — ninguém se cadastra sozinho e cai nas suas finanças). São 2 passos:

**1.** No Supabase: **Authentication → Users → Add user → Create new user**. Preencha email + senha e marque **"Auto Confirm User"**.

**2.** Rode o [`002_adicionar_membro.sql`](supabase/migrations/002_adicionar_membro.sql) trocando os emails pelos reais.

> ⚠️ **Só criar o usuário não basta.** Sem o passo 2 a pessoa loga e vê a tela vazia — a RLS libera acesso por *participação na household*, não por *ter conta*. Isso é proposital.

### 🔐 Como a segurança funciona (RLS)

Toda a proteção está no banco, não no código do app:

- `transactions` só é visível para quem é membro da mesma `household`
- `household_id` e `user_id` têm **DEFAULT no banco** (`current_household_id()` e `auth.uid()`), então ninguém consegue forjar autoria pelo front
- A função `current_household_id()` é `SECURITY DEFINER` — isso evita a recursão infinita de RLS, uma pegadinha clássica do Supabase

---

## ⚡ Como o app conversa com o banco

1. **Inserção (`Insert`)** — o formulário envia descrição, valor, categoria, tipo e **data** para `transactions`. A autoria e a household são preenchidas pelo próprio banco.
2. **Leitura (`Select`)** — busca as transações da household já com o **perfil do autor embutido** (via a FK `transactions_author_fkey`).
3. **Edição (`Update`)** — altera os campos; a autoria original é preservada (não muda só porque outra pessoa editou).
4. **Exclusão (`Delete`)** — remove a linha, com modal de confirmação antes.

Os erros do Supabase são **sempre reportados** (console + alerta) — nada de falha silenciosa.

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

No formulário da esquerda:

- **Tipo**: escolha entre as abas **Saída** e **Entrada** (sem dropdown).
- **Descrição**: o que você comprou/recebeu.
- **Valor**: formatado como moeda automaticamente enquanto digita.
- **Data**: vem preenchida com hoje, mas dá para **lançar retroativo** (comprou sábado, registrou segunda).
- **Categoria**: busca com autocomplete — e se não achar, dá para **criar uma nova** na hora.

### 📅 Filtro de Período

A barra no topo (`Tudo · Julho/26 · Junho/26 · ...`) é montada a partir dos meses que **têm transação**, e controla ao mesmo tempo os cards, a lista e o resumo por pessoa.

### 📊 Cards de Resumo

**Entradas**, **Saídas** e **Saldo** do período selecionado. Cada um mostra:

- Comparativo com o **mês anterior** (com a cor certa — saída subindo é ruim, entrada subindo é bom)
- Barra de proporção
- No saldo: a **taxa de poupança** ("guardou 27,6%")

Clicando em qualquer card, abre um relatório com gráficos de pizza (por categoria) e barras (por dia).

### 👥 Quem Lançou

Cada linha da tabela termina com um **círculo colorido** com as iniciais de quem registrou. A cor é determinística — a mesma pessoa sempre tem a mesma. Passe o mouse para ver nome e email.

Abaixo do formulário, o bloco **"Por pessoa"** mostra quanto cada um lançou no período. *(Só aparece quando há 2+ pessoas.)*

### ✏️ Editar e Excluir Transação

1. Na lista, clique no **ícone de lápis do cabeçalho** para ativar o modo de edição.
2. Um lápis aparece em cada linha — clique nele.
3. Abre um **modal** com os campos editáveis (descrição, valor, categoria, data).
4. **Salvar** confirma as alterações; **Excluir** abre uma confirmação antes de apagar.

### 📈 Relatórios

O botão **"Relatórios"** no cabeçalho leva para `/dashboard`, com gráficos de gastos por categoria e por dia.

### 👤 Modo Visitante

É possível testar o app **sem criar conta**:

1. Na tela de login, clique em **"Entrar como Visitante"**.
2. Use o app normalmente — crie, edite e exclua transações.
3. Os dados ficam salvos apenas **neste navegador** (LocalStorage).
4. Um banner amarelo indica que você está em modo temporário.
5. Os dados **expiram automaticamente após 24 horas** ou ao clicar em "Sair".

---

## 🎨 Design System

O projeto tem um design system versionado em [`design-system/`](design-system/README.md): cards HTML de preview dos tokens (cores, tipografia) e componentes (botões, inputs, cards, tabela).

Para publicar no **Claude Design** (claude.ai), rode na raiz do projeto:

```bash
claude
/design-sync
```

Ele conecta na sua conta, deixa escolher/criar um projeto de Design System e sobe os cards. Detalhes em [`design-system/README.md`](design-system/README.md).

---

## 🔒 Segurança e Open Source

Como o código é aberto para aprendizado, a segurança funciona assim:

> **O Código (Público)** 🔓
> A "receita do bolo" fica no GitHub. Todos veem como o site é feito.

> **As Chaves (Privadas)** 🗝️
> As variáveis de ambiente ficam no `.env.local` (que está no `.gitignore`) e na Vercel — nunca no repositório.

> **Os Dados (Protegidos)** 🛡️
> Mesmo com a chave `anon` pública, o Row Level Security do Postgres garante que ninguém veja transações de uma household da qual não participa.

---

## 🛠️ Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Sobe o build de produção |
| `npm run lint` | Checagem de código |

---

## 🐛 Problemas Comuns

**`supabaseUrl is required` no build**
Falta o `.env.local`. Veja o passo 2 de [Como Iniciar](#-como-iniciar).

**`net::ERR_NAME_NOT_RESOLVED` ao carregar**
O projeto Supabase está pausado ou foi apagado. Projetos do plano free pausam após ~1 semana sem uso e o subdomínio sai do DNS. Entre no painel e clique em **Restore**.

**`Could not find a relationship between 'transactions' and 'profiles'`**
A migration `001_conta_conjunta.sql` não rodou. Rode e, se persistir, force o refresh do cache com `notify pgrst, 'reload schema';`

**Login funciona mas a tela fica vazia**
O usuário não foi adicionado a nenhuma household. Rode o `002_adicionar_membro.sql`.

---

## 📚 Saiba Mais

- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação Supabase](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
