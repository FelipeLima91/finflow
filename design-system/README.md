# FinFlow — Design System

Bundle de preview do design system do FinFlow, pronto para publicar no **Claude Design** (claude.ai) via `/design-sync`.

## Direção visual

- **Estilo:** clean minimalista (Linear / Mercury) — muito espaço em branco, bordas sutis, sombras suaves.
- **Marca:** azul confiança (`--primary`).
- **Neutros:** escala *slate* (frios), que combinam com o azul.
- **Finanças:** tokens semânticos `--income` (verde / entrada) e `--expense` (vermelho / saída).
- **Tipografia:** Geist Sans, headings com `letter-spacing: -0.02em`, números com `tabular-nums`.

A fonte de verdade dos tokens é [`app/globals.css`](../app/globals.css). Os cards `.html` desta pasta
espelham esses valores (em OKLCH) para renderizar no painel de Design Systems do claude.ai.

## Cards (`@dsCard`)

Cada arquivo HTML começa com um marcador `<!-- @dsCard group="..." name="..." -->`, lido pelo
`/design-sync` para montar o índice de cards no painel.

| Arquivo | Grupo | Conteúdo |
|---|---|---|
| `foundations/colors.html` | Foundations | Tokens de cor (marca, neutros, finanças, gráficos) |
| `foundations/typography.html` | Foundations | Escala tipográfica e pesos |
| `components/buttons.html` | Components | Variantes e tamanhos de botão |
| `components/inputs.html` | Components | Inputs, select, label e foco |
| `components/cards.html` | Components | Card / superfície |
| `components/badges.html` | Components | Pills e valores de finanças |
| `components/summary-cards.html` | Patterns | Cards de resumo (entradas/saídas/saldo) |
| `components/table.html` | Patterns | Tabela de movimentações |

## Como publicar no Claude Design

No terminal, dentro da raiz do projeto:

```bash
claude
/design-sync
```

O `/design-sync` vai:
1. Conectar na sua conta **claude.ai** (na 1ª vez, pede para autorizar o acesso "design-system").
2. Deixar você **escolher um projeto** de Design System existente ou **criar um novo**.
3. Mostrar o **plano** (quais arquivos serão enviados) para você aprovar.
4. Fazer o upload dos cards.

Ao terminar, o design system aparece em **Design systems** no claude.ai, visível para você e sua organização.
