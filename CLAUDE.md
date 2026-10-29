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

### Princípios didáticos (feedback do usuário sobre os primeiros módulos)

O leitor está vendo a técnica **pela primeira vez**: sabe C++ básico (laços, vetores, funções) e a notação O(·), nada além.

1. **Concreto → abstrato.** Toda ideia aparece primeiro num exemplo minúsculo resolvido à mão (n = 3, vetor de 6–8 elementos); só depois vem a fórmula ou a notação. Nunca formalize (recorrência, invariante, notação de bits) antes do exemplo.
2. **Traço no texto.** Para cada algoritmo, uma tabela passo a passo (estado em cada chamada/iteração) que funcione sem JavaScript. A visualização complementa, não substitui. Gere os números dos traços com código, nunca de cabeça.
3. **Feche o problema motivador.** A aula termina com um programa COMPLETO que resolve exatamente o problema da motivação, com entrada e saída de exemplo e por que a saída é aquela.
4. **Um conceito novo por vez.** Primeira versão do código com `for` normal, sem macros. Depois, "o mesmo código no formato de contest" com o template. Explique numa linha toda sintaxe fora do básico na primeira aparição (lambda `[&]`, `template <class F>`, iteradores, `prev`, `*max_element`).
5. **Pausas ativas.** 2–3 `<Callout type="tente">` por aula: a pergunta no corpo e a resposta dentro de `<details><summary>Ver resposta</summary> … </details>`.
6. **Contraexemplo.** Para cada condição necessária (desfazer o estado, monotonicidade, sentinela), mostre um caso pequeno em que ela falha e a saída errada resultante.
7. **Essencial vs. avançado.** O que um iniciante não vai encontrar na primeira semana vai para `<details class="para-depois">` no fim.
8. **Quiz que exige execução.** Pelo menos metade das perguntas pede para simular código (use o campo `code` do `Quiz`).
9. **Cada bloco de código com `main` é testado:** compila com `-Wall -Wextra -Wshadow`, reproduz a saída de exemplo do texto e passa num teste de estresse contra força bruta.

Cuidado com MDX: `{` e `<` em texto corrido são interpretados como JSX. Use `$\{1, 2\}$` ou crase.

Os módulos `busca-completa` e `busca-binaria` são a referência de estilo (reescritos com esses princípios). Ao escrever um módulo, mude `status` para `'written'` em `data/modules.ts`.

## Dicas (data/hints/<milestone>.yaml)

1 a 3 dicas por problema, da observação à ideia do algoritmo. **Nada de código da solução.** O usuário aprende tentando com empurrões. `pitfalls` = armadilhas específicas daquele problema. Problemas com `uncertain: true` no roadmap: confirme a técnica antes de escrever as dicas e corrija a posição/tags se preciso.

## Stack e comandos

- Astro 7 (estático) + MDX + ilhas React 19 + Tailwind 4 + Shiki + KaTeX (processador `unified` com remark-math/rehype-katex). Node ≥ 22.23.4.
- `npm run validate` (roda no prebuild), `npm test`, `npm run check`, `npm run build`, `npm run check-links` (com `NODE_USE_ENV_PROXY=1` em sessões com proxy). O código C++ dos módulos deve compilar com `-Wall -Wextra -Wshadow` e ser testado contra força bruta antes de publicar.
- Links verificados até agora: usaco.guide, cp-algorithms.com, YouTube (via oEmbed). codeforces.com estava bloqueado na sessão de 2026-10-29, então nenhum link do Codeforces EDU entrou ainda.
- Progresso: `src/lib/progress/` (nanostores + `ProgressAdapter`; localStorage hoje, sync na fase 2). As ilhas leem com `useProgress()`, que devolve o estado vazio até o mount para evitar hydration mismatch. Não use `useStore($progress)` direto em componente hidratado.
- Git: o trabalho vai para a branch `dev`; a `main` é a produção da Vercel.
