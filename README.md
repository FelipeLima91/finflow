# 💰 FinFlow

O seu gerenciador financeiro pessoal, simples e eficiente.

## 🚀 Como Iniciar

Primeiro, rode o servidor de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

## 🏗️ Arquitetura do Projeto

### 1. 🧠 O Cérebro e a Cara (Frontend + Backend)

_Aqui é onde a mágica acontece: o que você vê na tela e as regras matemáticas._

- **Tecnologia**: [Next.js](https://nextjs.org) (versão mais recente)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Por que?**: É a linguagem padrão do mercado. O TypeScript é vital para apps financeiros porque bloqueia erros "bobos" (como tentar somar texto com número).
- **Onde vive a lógica**: No próprio Next.js. Ele une o site (Front) e a lógica (Back), simplificando arquivos e configurações.

### 2. 🎨 A Maquiagem (Estilo e Design)

_Garante que fique bonito e profissional sem precisar de um designer._

- **Tecnologia**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/UI](https://ui.shadcn.com/)
- **Como funciona**: Em vez de desenhar botões do zero, usamos o Shadcn que já entrega componentes elegantes (estilo Apple/Google) prontos para copiar e colar.

### 3. 💾 A Memória (Banco de Dados e Login)

_Onde os dados ficam guardados para não sumirem._

- **Tecnologia**: [Supabase](https://supabase.com/)
- **Banco de Dados**: PostgreSQL. O mais robusto e seguro do mundo open-source. Perfeito para lidar com dinheiro.
- **Autenticação**: O próprio Supabase gerencia o login. Segurança e criptografia já vêm prontas.
- **Estratégia**: Um único usuário para a família inteira acessar.

### 4. 🏠 A Casa (Hospedagem/Deploy)

_Onde o site mora para você acessar 24h por dia._

- **Plataforma**: [Vercel](https://vercel.com/)
- **Conexão**: Conecta direto no seu código. Salvou no computador -> Atualiza no site em 1 minuto.

---

## 💸 Custo Zero Garantido

Muitas empresas oferecem planos gratuitos ("Hobby Tier") para desenvolvedores. Para o uso familiar, é virtualmente impossível estourar esses limites.

### ⚡ Vercel (Hospedagem)

- **Custo**: R$ 0,00 (Projetos não comerciais)
- **Limite**: Altíssimo. Só sairia do ar com milhões de acessos simultâneos.

### 🗄️ Supabase (Banco de Dados)

- **Custo**: R$ 0,00 (Plano Free)
- **Limite**: 500MB de dados.
- **Na prática**: Texto de gastos ocupa bytes. Levaria anos lançando milhares de gastos por dia para encher.

### 🐙 GitHub (Código)

- **Custo**: R$ 0,00 (Repositórios públicos ou privados)

---

## 🔒 Segurança e Open Source

Como o código é aberto para aprendizado, a segurança funciona assim:

> **O Código (Público)** 🔓
> A "receita do bolo" fica no GitHub. Todos veem como o site é feito.

> **As Chaves (Privadas)** 🗝️
> As senhas de acesso ao banco ("variáveis de ambiente") ficam escondidas apenas na Vercel.

**Resultado**: Se alguém baixar seu código, terá um site "oco". Ninguém consegue ver seus dados financeiros sem as chaves privadas.

---

## 📚 Saiba Mais

Para aprender mais sobre as tecnologias usadas:

- [Documentação Next.js](https://nextjs.org/docs)
- [Aprenda Next.js](https://nextjs.org/learn)
