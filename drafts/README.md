# Rascunhos de aulas

Material de apoio das aulas, fora do site: nada aqui é renderizado nem entra no build.

- `tests/<slug>/`: os programas C++ de cada aula e um `stress.sh` que compila com `-Wall -Wextra -Wshadow`,
  confere os exemplos do texto e compara com força bruta. Os números das tabelas do texto saem de `demos.cpp`.
  Rode o script antes de mexer nos exemplos de uma aula.
- `modules/<slug>.mdx` (quando existir): aula ainda em preparação. Pronta, ela vai para `content/modules/`
  e o módulo passa a `status: 'written'` em `data/modules.ts`.

Aulas com testes aqui: `dp-introducao`, `dp-mochila`, `dp-grid-strings`, `lis`, `grafos-dfs`, `bfs`.
