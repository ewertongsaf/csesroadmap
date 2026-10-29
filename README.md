# CSES Roadmap

Site pessoal de estudos de programação competitiva. Os 400 problemas do [CSES Problem Set](https://cses.fi/problemset/) estão numa trilha linear, ordenada por pré-requisito de conceito, com 33 milestones, módulos teóricos em PT-BR (baseados no [Competitive Programmer's Handbook](https://cses.fi/book/book.pdf)), dicas em níveis e Checkpoints Cegos.

Os enunciados **não** são copiados (CC BY-NC-SA): o site só linka para o CSES.

## Rodando localmente

Requer Node ≥ 22.23.4 (o Astro 7 exige; recomendo o 24, veja `.nvmrc`).

```bash
npm install
```

```bash
npm run dev
```

Abre em http://localhost:4321.

| Script | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | valida `data/` e gera o site estático em `dist/` |
| `npm run preview` | serve o `dist/` |
| `npm run validate` | checa a integridade da trilha (cada problema exatamente uma vez, módulos, dicas) |
| `npm run roadmap:summary` | lista fases e milestones com contagens |
| `npm test` | testes de unidade (próximo problema, streak, import) |
| `npm run check` | checagem de tipos (`astro check`) |
| `npm run parse-cses -- <arquivo.html>` | regenera `data/cses-problems.json` a partir do HTML de cses.fi/problemset |

## Deploy na Vercel

1. Em https://vercel.com/new, importe o repositório `ewertongsaf/csesroadmap`.
2. A Vercel detecta Astro sozinha (build `npm run build`, saída `dist`). Não precisa mudar nada.
3. A versão do Node vem de `engines` no `package.json` (≥ 22.23.4).
4. A branch de produção é a `main`. Cada push em outra branch gera um preview.

O site é 100% estático, sem variáveis de ambiente.

## Onde está cada coisa

```
data/
  cses-problems.json   # gerado: id, título, seção (não editar à mão)
  roadmap.ts           # a trilha: fases -> milestones -> problemas e checkpoints
  modules.ts           # registro dos módulos teóricos (status planned/written)
  concepts.ts          # vocabulário de tags
  hints/<milestone>.yaml   # dicas e armadilhas por problema
  checklist.ts, template.cpp
content/modules/<slug>.mdx # texto dos módulos
docs/roadmap-rationale.md  # por que cada coisa está onde está
src/                       # site (Astro + ilhas React)
```

Reordenar ou adicionar um problema = editar `data/roadmap.ts` e rodar `npm run validate`.

## Progresso

O progresso fica no `localStorage` do navegador. Em **Progresso** dá para exportar/importar um JSON, para trocar de máquina sem perder nada. A persistência passa por um `ProgressAdapter` (`src/lib/progress/types.ts`), então a sincronização (Supabase, Vercel KV…) entra como outro adapter, sem mexer no resto.
