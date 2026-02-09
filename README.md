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

---

## 🔒 Segurança e Open Source

Como o código é aberto para aprendizado, a segurança funciona assim:

> **O Código (Público)** 🔓
> A "receita do bolo" fica no GitHub. Todos veem como o site é feito.

> **As Chaves (Privadas)** 🗝️
> As senhas de acesso ao banco ("variáveis de ambiente") ficam escondidas apenas na Vercel.

---

## 📚 Saiba Mais

Para aprender mais sobre as tecnologias usadas:

- [Documentação Next.js](https://nextjs.org/docs)
- [Aprenda Next.js](https://nextjs.org/learn)
