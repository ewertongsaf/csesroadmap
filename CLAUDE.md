# CSES Roadmap: contexto para o Claude

Site **pessoal** de estudos de programação competitiva do Ewerton (ITA, prepara a OBI Sênior, programa em C++). Interface e conteúdo em **português do Brasil**; termos técnicos consagrados ficam em inglês (segment tree, two pointers…).

## Decisões fixas

- **Conteúdo de problemas: só o CSES.** Os 400 problemas vêm de `data/cses-problems.json` (extraído de cses.fi/problemset em 2026-10-29 por `scripts/parse-cses.mjs`). Nunca invente ids/títulos; se o CSES mudar, rode o parser de novo.
- **Nunca copie enunciados** (CC BY-NC-SA). Só linke `https://cses.fi/problemset/task/<id>`.
- **Todo link externo em módulos/dicas precisa ser verificado (fetch) antes.** Link quebrado é pior que nenhum.
- **Teoria principal: CPH de 2018** (cses.fi/book/book.pdf, 30 capítulos). Cite capítulo/seção. Para temas que o CPH não cobre (KMP, suffix array, FFT, CHT, HLD, centroid, xor basis, SOS, interativos, construção…), use cp-algorithms / USACO Guide e preencha `basedOn` em `data/modules.ts`.
- **Trilha:** 33 milestones em 5 fases (aprovado pelo usuário). A ordem é por pré-requisito de conceito, não pela seção do CSES. A justificativa de cada posição está em `docs/roadmap-rationale.md`; mantenha esse documento em dia ao mover problemas.
- **Checkpoint Cego misto:** `checkpoint.reserved` = inéditos que só aparecem ali (contam como slots da trilha); `checkpoint.review` = já vistos antes. Total entre 3 e 5.
- **"Já domino" começa vazio:** o usuário marca sozinho. Não pré-marque nada.
- **Hidden Integer (3112)** fica no milestone 3, de propósito, para apresentar o formato interativo cedo.
- **Qualidade > quantidade.** Os módulos são escritos em lotes por milestone; os 3 primeiros com qualidade máxima para o usuário validar o estilo antes de escalar.

## Estrutura de um módulo (content/modules/<slug>.mdx)

1. Motivação: problema concreto em que a força bruta não passa, com a complexidade explicada.
2. Ideia central em linguagem simples, depois formalizada. Fórmulas em KaTeX, cada uma seguida de uma linha explicando os símbolos.
3. Visualização interativa quando ajudar (componente React com "próximo passo").
4. Código C++ da técnica **genérica** (nunca a solução do problema do CSES), comentado, usando o template de `data/template.cpp`, com complexidade de tempo e memória.
5. Armadilhas comuns.
6. Referências: CPH (número e nome do capítulo) + links verificados (USACO Guide, cp-algorithms, Codeforces EDU, vídeos bons).
7. Mini-quiz de 2–4 perguntas conceituais.

Ao escrever um módulo, mude `status` para `'written'` em `data/modules.ts`.

## Dicas (data/hints/<milestone>.yaml)

1 a 3 dicas por problema, da observação à ideia do algoritmo. **Nada de código da solução.** O usuário aprende tentando com empurrões. `pitfalls` = armadilhas específicas daquele problema. Problemas com `uncertain: true` no roadmap: confirme a técnica antes de escrever as dicas e corrija a posição/tags se preciso.

## Stack e comandos

- Astro 7 (estático) + MDX + ilhas React 19 + Tailwind 4 + Shiki + KaTeX (processador `unified` com remark-math/rehype-katex). Node ≥ 22.23.4.
- `npm run validate` (roda no prebuild), `npm test`, `npm run check`, `npm run build`.
- Progresso: `src/lib/progress/` (nanostores + `ProgressAdapter`; localStorage hoje, sync na fase 2). As ilhas leem com `useProgress()`, que devolve o estado vazio até o mount para evitar hydration mismatch. Não use `useStore($progress)` direto em componente hidratado.
- Git: o trabalho vai para a branch `dev`; a `main` é a produção da Vercel.
