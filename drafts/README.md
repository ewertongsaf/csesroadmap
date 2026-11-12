# Rascunhos de aulas

Aulas em preparação, fora do site: nada aqui é renderizado nem entra no build.

- `modules/<slug>.mdx`: o texto da aula. Quando estiver pronto, vai para `content/modules/` e o módulo
  passa a `status: 'written'` em `data/modules.ts`.
- `tests/<slug>/`: os programas C++ da aula e um `stress.sh` que compila com `-Wall -Wextra -Wshadow`,
  confere o exemplo do texto e compara com força bruta. Os números das tabelas do texto saem de `demos.cpp`.
