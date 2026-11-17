# Padrão de qualidade das aulas

Extraído das 14 aulas dos milestones 8–13 (`dp-introducao` … `ordered-set`), escritas e validadas antes da troca de modelo. Vale para toda aula nova. Complementa os princípios didáticos do `CLAUDE.md`, que continuam valendo.

Meça uma aula com:

```bash
python3 scripts/lesson-metrics.py <slug>
```

Sem argumentos, o script imprime as 14 aulas de referência, com média e mínimo.

## 1. Números mínimos

Medidos nas 14 aulas de referência. Uma aula nova abaixo do mínimo de alguma coluna precisa de um motivo.

| Medida | Média de referência | Mínimo exigido |
|---|---|---|
| Palavras de texto (fora código e quiz) | 2 760 | 2 000 |
| Seções `##` | 9,7 | 7 |
| Tabelas | 7,6 | 5 |
| `<Callout type="tente">` | 2,1 | 2 (máximo 3) |
| Visualizações interativas | 1,2 | 1 |
| Blocos C++ com `main` | 2,2 | 2 (versão didática + contest) |
| Perguntas do quiz | 6 | 5 |
| Perguntas do quiz com `code` (simular) | 2,4 | **3** (metade; as aulas `dijkstra` e `mst` ficaram abaixo, não as imite) |
| Armadilhas | 7,5 | 6 |
| Contraexemplos com saída errada concreta | 4,9 | 2 |
| Maior parágrafo (palavras) | 81 | máximo 100 |

## 2. Esqueleto

As seções seguem esta ordem. Os nomes entre aspas são fixos, porque o script e o leitor os procuram.

1. **"Motivação: …"** com um título concreto ("o posto mais barato do trecho", não "range minimum"). Contém:
   - o problema em bloco de citação (`>`), com o formato dos eventos;
   - uma tabela de eventos de 6–11 linhas com a resposta de cada pergunta em **negrito**;
   - a conta que mostra por que a força bruta não passa (ex.: "$2 \cdot 10^5$ perguntas × $2 \cdot 10^5$ passos = $4 \cdot 10^{10}$. Não passa.");
   - quando houver alternativas conhecidas, uma tabela "estrutura × operação" mostrando que cada uma falha em algo;
   - uma frase dizendo o que falta, que a aula vai construir.
2. **"A ideia: …"** com uma analogia ou um caso à mão (campeonato, blocos, representante) **antes** de qualquer definição. A definição vem em negrito na primeira aparição do termo.
3. Uma seção por operação ou conceito, cada uma com: exemplo à mão, tabela de traço, trecho curto de código só da função nova, uma linha sobre custo.
4. **"O exemplo completo, passo a passo"** (ou a visualização dentro da seção da operação principal): tabela de todos os eventos da motivação, depois a visualização.
5. Seção de contraexemplos ("Três cuidados…", "Trocar a operação", "Quando $n$ não é…"): cada condição necessária com um caso pequeno e **a saída errada que ele produz**.
6. Usos derivados (1–2 disfarces comuns da técnica nos problemas do milestone), sem resolver nenhum problema do CSES.
7. **"Código: o problema … completo"**: programa didático, entrada, saída, frase "São as N perguntas da tabela…", tempo e memória em lista.
8. **"### O mesmo código no formato de contest"**, seguido de 1–3 frases explicando cada sintaxe nova.
9. **"Armadilhas comuns"**: lista `- **Erro curto.** Consequência e correção.`
10. `<details class="para-depois">` com 3–6 parágrafos curtos, cada um começando com um título em negrito.
11. **"Referências"**: CPH em negrito com capítulo, seção e nome em itálico, mais 2–3 links verificados com uma frase cada.
12. **"Mini-quiz"**.

## 3. O exemplo condutor

- **Um exemplo só atravessa a aula toda**: o mesmo vetor e os mesmos eventos da motivação aparecem nos traços, na visualização, na entrada do programa e em pelo menos uma pergunta do quiz.
- Tamanho: 5–8 elementos. Valores de um dígito sempre que possível.
- O exemplo é **escolhido** para exercitar todos os casos: pelo menos uma pergunta que cai num caso trivial (o nó inteiro está dentro) e uma que obriga o caso difícil (cruza o meio, empate, ninguém serve).
- Os números das tabelas saem de `drafts/tests/<slug>/demos.cpp`. Nenhum número é escrito de cabeça, inclusive os do quiz e os das respostas dos callouts.

## 4. Escrita

- Frases curtas, voz ativa, segunda pessoa ("Olhe o filho da esquerda"). Português do Brasil; termos consagrados em inglês.
- Cada fórmula em `$$` é seguida de uma linha que nomeia os símbolos.
- Conceito novo aparece em **negrito** uma vez, na definição.
- Nada de "simplesmente", "obviamente", "é fácil ver".
- Toda sintaxe de C++ fora do básico é explicada numa linha na primeira vez (já explicadas em aulas anteriores podem ser lembradas com meia frase).
- Ao comparar com aula anterior, diga o nome dela ("o mesmo truque da aula de Fenwick tree").

## 5. Callouts "tente"

- 2 ou 3 por aula, logo depois do conceito que exercitam, nunca no fim.
- A pergunta pede uma **execução**: "quais nós a consulta visita?", "quanto vale `bit[6]` depois de…". Não "o que você acha de…".
- A resposta em `<details>` mostra o caminho, não só o número, e termina com uma observação que vai além ("Repare que a consulta nem chegou às folhas.").

## 6. Quiz

- 6 perguntas, 4 opções cada.
- Pelo menos 3 com `code`, pedindo para simular o trecho num estado dado.
- Os distratores são **erros reais**: o resultado de esquecer o `-1`, de não refazer o nó na volta, de usar o neutro errado. O `why` nomeia o erro que leva a cada distrator importante.
- A resposta certa varia de posição: use pelo menos três posições diferentes entre as 6 perguntas (nas aulas de referência ela ficou quase sempre na opção 1; não repita isso).

## 7. Visualização interativa

Toda aula tem pelo menos uma, em `src/components/mdx/viz/<Nome>Viz.tsx`. Anatomia comum das 14 visualizações de referência:

1. **`simulate()` puro**, chamado em `useMemo`, que roda o algoritmo de verdade sobre o exemplo da aula e grava uma lista de passos (`Ev[]`) com uma cópia do estado. Nada de estados escritos à mão.
2. **Fila de operações** no topo: chips em `font-mono text-xs`, a atual com `border-accent bg-accent/20`, as passadas apagadas (`text-faint`).
3. **Desenho em SVG** com `viewBox` fixo, dentro de `overflow-x-auto` e com `min-w-[400–520px]`, para não estourar a tela do celular.
4. **Cores só por tokens** (`var(--c-accent)`, `--c-try`, `--c-ok`, `--c-muted`, `--c-line`, `--c-surface-2`, `--c-fg`), para funcionar nos dois temas. Laranja = o que está acontecendo agora; azul = resultado usado/alterado; verde = resposta; tracejado = descartado. Setas com `markerUnits="userSpaceOnUse"`.
5. **Legenda** em `text-xs text-faint` explicando cada cor e cada sigla.
6. **Texto do passo** em `min-h-16`/`min-h-20` (o layout não pula), com a conta do passo escrita por extenso ("menor entre 9 e 7 é 7 (era 2)"); fica verde (`text-ok`) quando o passo fecha uma resposta.
7. **`StepControls`** + `VizFrame` com `onKey` (setas do teclado).
8. 15–40 passos. Cada passo muda uma coisa só.
   Quando a aula gira em torno de uma função que combina dois estados (`junta`, relaxar uma aresta, unir dois grupos), mostre abaixo do desenho um painel **A | B | resultado** com os campos de cada um, como em `SegNodeViz`. Nos passos sem combinação, o painel mostra o estado do elemento atual, para o layout não ficar com buracos.
9. Conferência: `viz2.cjs <slug>` (Playwright) percorre todos os passos em desktop e celular sem erro de console e sem rolagem horizontal; um screenshot é olhado de verdade antes do commit.

## 8. Testes (`drafts/tests/<slug>/`)

- `<programa>.cpp` (a versão didática, idêntica à do texto), `<programa>_contest.cpp`, `brute.cpp`, `demos.cpp`, `stress.sh`.
- `stress.sh` compila com `-Wall -Wextra -Wshadow`, confere a saída do exemplo do texto (e imprime "EXEMPLO DO TEXTO FALHOU" se não bater), roda 500 casos aleatórios contra a força bruta, roda um caso no tamanho máximo e no fim chama `demos`.
- Código que aparece no texto e não tem `main` (funções soltas, variantes) é coberto pelo `demos.cpp`.

## 9. Depois de escrever: comparação

Ao terminar uma aula:

1. Rode `python3 scripts/lesson-metrics.py <slug>` e compare com a média de referência.
2. Leia lado a lado com a aula de referência mais parecida (a anterior do mesmo assunto) e anote as diferenças de tom, de tamanho dos traços e de densidade.
3. Corrija o que ficou abaixo do padrão antes do commit, e registre no relatório ao usuário o que ficou diferente e por quê.
