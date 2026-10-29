# Por que a trilha está nesta ordem

Este documento justifica a posição de cada milestone e de cada problema fora da sua seção original do CSES. Os dados estão em `data/roadmap.ts`; a integridade (400/400 problemas, cada um exatamente uma vez) é checada por `npm run validate`.

Fonte dos problemas: https://cses.fi/problemset/, extraída em 2026-10-29 (`data/cses-problems.json`). Referências de capítulo: CPH de 2018 (https://cses.fi/book/book.pdf).

---

## Princípios

1. **A ordem segue os pré-requisitos de conceito, não as seções do CSES.** Um problema só aparece depois do módulo que ensina a técnica dele. Quando um problema de "Sorting and Searching" pede BIT ou ordered_set, ele espera o milestone de range queries.
2. **As seções Additional, Counting e Advanced Graph ficam espalhadas pela trilha.** Elas não têm tema próprio: entram no primeiro milestone em que a técnica já foi vista, muitas vezes como problema reservado de checkpoint, porque o título delas não entrega o tema.
3. **Os milestones são pequenos: 33 em 5 fases.** Você sugeriu 15–25. Com 400 problemas, isso daria 16–27 problemas por milestone, e o checkpoint (o treino de identificar a técnica) ficaria raro demais. Preferi milestones de ~12 problemas, agrupados em 5 fases que fazem o papel da estrutura macro. Se quiser menos, as fusões naturais estão no fim deste documento.
4. **Checkpoint Cego misto.**
   - Cada milestone reserva de 0 a 3 problemas **inéditos**. Eles só aparecem no checkpoint, contam como slots normais da trilha e têm títulos que não entregam a técnica.
   - Além deles, 1 a 3 problemas **de revisão**, já resolvidos em milestones anteriores.
   - O total fica entre 3 e 5. Milestones muito especializados (Árvores III, Interativos, Counting, Boss final) têm só revisão: lá não sobra problema inédito que não entregue o tema pelo título, e o Boss final já é cego por natureza.
5. **A dificuldade (1–5) é relativa ao CSES inteiro.** Usei como sinal o número público de quem resolveu (snapshot no JSON) mais meu julgamento sobre a técnica. Distribuição: 13 com nível 1, 58 com nível 2, 108 com nível 3, 147 com nível 4 e 74 com nível 5.
6. **32 problemas estão marcados com `uncertain: true`.** São problemas recentes (ids 3xxx) ou de construção/contagem pesada, e minha classificação de técnica para eles é um palpite educado. Vou confirmar cada um antes de escrever as dicas e corrigir a posição se for preciso. A lista está no fim.

---

## Fase 1 — Fundamentos e técnicas de lista

### 1. Fundamentos: implementação e matemática de bolso (CPH 1–2)
É onde tudo começa: ler limites, estimar complexidade, `long long`, módulo. Contém os Introductory "diretos", sem backtracking.
- **3419 Mex Grid Construction** fica aqui porque n ≤ 100 permite simular direto. O padrão xor fica para o checkpoint seguinte.
- **3399 Raab Game I** e **3311 Grid Coloring I** são casework/greedy local, sem estrutura de dados.
- **Reservado: 3215 Bouncing Ball Steps** (Additional II). É simulação por aritmética modular: a bola volta ao início a cada 2(n−1) passos em cada eixo. Ótimo para treinar "não simule 10^18 passos".

### 2. Busca completa, recursão e backtracking (CPH 5)
Gray Code, Hanoi, Creating Strings, Apple Division, Queens e Grid Path Description formam o bloco de busca completa.
- **1628 Meet in the Middle** (Advanced Techniques) entra aqui porque o CPH trata meet in the middle no mesmo capítulo 5 (5.5). Ele só precisa de enumeração de subconjuntos e ordenação/contagem, nada de estruturas avançadas.
- **Reservado: 1157 Mex Grid Queries** (Additional II). A técnica é "gere casos pequenos por força bruta, ache o padrão" (o valor é (y−1) xor (x−1)). É o treino de identificação mais honesto possível depois de 3419.

### 3. Ordenação, greedy e busca binária (CPH 3, 6)
Você já viu busca binária na USACO, então juntei ordenação, greedy e busca binária na resposta num milestone só.
- **1743 String Reorder** (Introductory) está aqui, e não no milestone 1, porque é greedy com verificação de viabilidade (a letra mais frequente não pode sobrar). Precisa da mentalidade de "escolho o menor possível que ainda deixa solução".
- **3151 Bubble Sort Rounds I** (Additional I) se resolve com ordenação estável e a distância que cada elemento precisa andar para a esquerda.
- **2422 Multiplication Table** (Additional I) é um exemplo clássico de busca binária na resposta com contagem em O(n).
- **Reservado: 1087 Shortest Subsequence** (Additional I): greedy de blocos com as 4 letras.

### 4. Estruturas da STL: set, multiset, map e priority_queue (CPH 4)
**Troquei a ordem do seu esqueleto: a STL vem antes de two pointers.** Metade dos problemas de two pointers/sliding window do CSES usa `map`/`multiset` dentro da janela (Playlist, Distinct Values, Sliding Window Median/Mode). Ensinar a janela antes da estrutura obrigaria a ensinar as duas coisas de uma vez. ordered_set fica para o milestone 13, junto com BIT, porque resolve os mesmos problemas (k-ésimo, contagem de menores).
- **Reservados:**
  - **1161 Stick Divisions**: é Huffman com priority_queue, mas o enunciado fala em "dividir"; pensar ao contrário (juntar) é a sacada.
  - **2426 Programmers and Artists**: ordenar por x−y e usar priority_queue para os melhores prefixo/sufixo.

### 5. Two pointers, sweep por eventos e contribuição (CPH 8.1, 30)
- **Reservado: 3150 Distinct Values Sum** (Additional I). É a técnica de contribuição pura: cada posição conta para os subarrays em que é a primeira ocorrência do seu valor.

### 6. Pilha monotônica, deque e sliding window (CPH 8.2, 8.3)
Junta a seção Sliding Window do CSES (exceto Inversions e Advertisement, que precisam de BIT/estruturas pesadas) com os problemas de pilha monotônica.
- **1645 Nearest Smaller Values** (Sorting and Searching) é a introdução canônica de pilha monotônica.
- **1142 Advertisement** e **1147 Maximum Building I** (Additional I) são "maior retângulo no histograma", primeiro direto e depois por linha de um grid.
- **Reservado: 3414 Filled Subgrid Count II** (Counting). Contar retângulos monocromáticos é o mesmo histograma, só que somando contribuições. O título não entrega a pilha.
- **Fica para depois:**
  - **3223 Sliding Window Inversions** → milestone 13 (precisa de BIT).
  - **3227 Sliding Window Advertisement** → Boss final (técnica incerta, nível 5).

### 7. Prefix sums e range queries estáticas (CPH 2.4, 9.1)
Ficam aqui as range queries estáticas da seção Range Queries (Static Sum/Min, Xor, Forest Queries) e os problemas de Sorting and Searching que são prefix sums disfarçados:
- **1643 Maximum Subarray Sum** (Kadane / prefixo mínimo);
- **1661 Subarray Sums II** e **1662 Subarray Divisibility** (prefixo + hashmap);
- **1644 Maximum Subarray Sum II** (prefixo + mínimo numa janela, que já foi visto no milestone 6).

E três Additional:
- **2186 Special Substrings**: prefixo de contagens normalizado como chave de `map`.
- **3361 Two Array Average**: busca binária na média λ e maximizar Σ(a_i − λ) por prefixo.
- **Reservado: 1189 Food Division**: problema circular que vira "mediana dos prefixos".

E um de Geometry:
- **Reservado: 3411 All Manhattan Distances**. Apesar da seção, é só separar x e y, ordenar e somar com prefixo. É um ótimo checkpoint cego, porque o título assusta mais do que deveria.

---

## Fase 2 — DP e grafos

### 8. DP I: estados, contagem e mochila (CPH 7.1, 7.4)
A sequência clássica: Dice → Minimizing Coins → Coin Combinations I/II (a ordem dos laços!) → Removing Digits → Book Shop → Money Sums → Two Sets II → Array Description.
- **Reservados:**
  - **3302 Subsets with Fixed Average**: subtrair a média de cada elemento e contar subconjuntos de soma 0 com mochila.
  - **3190 Distinct Values Splits**: DP + two pointers + prefixo do DP.

### 9. DP I-b: grids, strings e LIS (CPH 7.2, 7.3, 7.5)
- **2229 Permutation Inversions** (Counting) é DP de inserção com prefix sums para tirar um fator n. É a mesma ideia de "acelerar a transição" vista aqui.
- **Reservados:**
  - **3413 Filled Subgrid Count I** (Counting): o DP do "maior quadrado terminando em (i,j)" somado.
  - **3404 Permutation Subsequence** (Additional I): LCS de permutações vira LIS. É o tipo de redução que um checkpoint cego deve treinar.

### 10. Grafos I: DFS, BFS, componentes e grids (CPH 11, 12)
- **3217 Knight Moves Grid** (Introductory) é uma BFS num grid. Fica aqui porque sem BFS não há como resolvê-lo de forma limpa.
- **1707 Graph Girth** (Advanced Graph): BFS a partir de cada vértice, com n ≤ 2500.
- **3303 Nearest Shops** (Advanced Graph): BFS multi-fonte guardando as duas fontes mais próximas.
- **Reservados:**
  - **1670 Swap Game** (Additional I): BFS no grafo de 9! estados.
  - **3357 Fixed Length Walk Queries** (Advanced Graph): BFS no grafo (vértice, paridade).

### 11. Grafos II: caminhos mínimos, DAGs e ordenação topológica (CPH 13, 16.1–16.2)
- **1757 Course Schedule II** (Advanced Graph): topo sort no grafo reverso com max-heap. É a pegadinha clássica de "lexicograficamente menor".
- **3158 Bus Companies** (Advanced Graph): Dijkstra com um nó virtual por empresa.
- **1203 Visiting Cities** (Advanced Graph): DAG de caminhos mínimos + contagem de caminhos.
- **Reservados:**
  - **1756 Acyclic Graph Edges** (Advanced Graph): a resposta é orientar a → b se a < b. É o checkpoint "não complique".
  - **3213 Water Containers Moves** (Additional I): Dijkstra sobre estados (a, b) com custo = água movida.

### 12. DSU e árvore geradora mínima (CPH 15)
- **2101 New Roads Queries** (Advanced Techniques) fica aqui com a solução de "floresta do DSU". Com union by size a profundidade é O(log n), então dá para subir na floresta guardando o tempo de cada união, sem binary lifting.
- **3111 Transfer Speeds Sum** e **3407 MST Edge Check** (Advanced Graph) são Kruskal com contagem / com grupos de mesmo peso.
- **Reservados:**
  - **1677 Network Breakdown**: DSU processando as remoções ao contrário.
  - **3294 Subarray Sum Constraints** (Additional I): restrições de soma viram arestas entre prefixos (DSU com pesos).
- **Fica para depois:** **3408 MST Edge Set Check** → milestone 29 (precisa de DSU com rollback). **3409 MST Edge Cost** → milestone 16 (precisa de máximo em caminho com binary lifting).

---

## Fase 3 — Estruturas de dados e árvores

### 13. Range queries dinâmicas I: BIT e segment tree (CPH 9.2–9.4)
Aqui chegam os problemas de Sorting and Searching que dependem de BIT/ordered_set:
- **2163 Josephus Problem II**: k-ésimo vivo.
- **2168 Nested Ranges Check** e **2169 Nested Ranges Count**: ordenar + contar com BIT/ordered_set.

E mais:
- **3223 Sliding Window Inversions** (Sliding Window): inversões com BIT, incrementais.
- **1748 Increasing Subsequence II** (DP): DP de contagem acelerada com BIT.
- **Reservados:**
  - **1747 Pyramid Array**: greedy "menor primeiro, para a ponta mais barata" com BIT.
  - **1162 Sorting Methods**: quatro métricas numa permutação (inversões, ciclos, LIS, sufixo ordenado).

### 14. Segment tree II: nós compostos, offline e lazy (CPH 28, 18.4)
- **Reservados:**
  - **1188 Bit Inversions** (Additional I): nó com prefixo/sufixo/melhor sequência.
  - **2425 Stack Weights** (Additional I): mínimo/máximo de prefixos numa segment tree.
  - **3314 Mountain Range** (DP): DP em ordem crescente de altura com máximo em intervalo. Nenhum dos três títulos entrega a segment tree.
- **Fica para depois:**
  - **2416 Increasing Array Queries** → milestone 16 (a solução offline usa saltos para o próximo maior).
  - **2184 Missing Coin Sum Queries** → Boss final (nível 5).

### 15. Árvores I: DFS, diâmetro, DP em árvore e rerooting (CPH 14)
O seu esqueleto colocava "DP em árvore" na DP II. Antecipei a parte básica (Tree Matching, Tree Distances II com rerooting) para cá, porque ela é o uso natural de DFS em árvore. Advanced Graph contribui com os problemas de árvore que só precisam de DFS:
- **1702 Tree Traversals**: recursão sobre intervalos de pré-ordem/in-ordem.
- **1134 Prüfer Code**: decodificação com min-heap.
- **1700 Tree Isomorphism I** e **1701 Tree Isomorphism II**: hash canônico de árvore; a versão II reenraíza no centroide, visto em 2079.
- **1752 Creating Offices**: greedy pelos mais profundos.
- **Reservado: 1704 Network Renovation**: parear folhas na ordem de DFS.

### 16. Árvores II: binary lifting, LCA, Euler tour e grafos funcionais (CPH 16.3–16.4, 18)
- **1750 Planets Queries I**, **1751 Planets Cycles** e **1160 Planets Queries II** (Graph Algorithms) são grafos funcionais. O CPH trata *successor graphs* em 16.3–16.4, e o binary lifting é a mesma ferramenta das Company Queries. Por isso ficam juntos aqui, e não na Grafos I.
- **1664 Movie Festival Queries** (Range Queries): binary lifting sobre "próximo filme compatível".
- **3409 MST Edge Cost** e **3114 Tree Coin Collecting I** (Advanced Graph): máximo/mínimo em caminho com lifting.
- **2416 Increasing Array Queries** (Range Queries): offline + saltos para o próximo maior.
- **Reservados:**
  - **1191 Cyclic Array** (Additional I): saltos de "até onde vai o próximo bloco".
  - **3304 Visible Buildings Queries** (Range Queries): "próximo maior" + lifting.

### 17. Árvores III: small-to-large, HLD e centroid decomposition
Esses temas são opcionais para a OBI, mas aparecem no CSES. **3149 Tree Coin Collecting II** (Advanced Graph) entra aqui como Steiner tree/virtual tree com ordem de DFS + LCA. O checkpoint é só de revisão (veja os princípios).

---

## Fase 4 — DP avançada, matemática, bits e construção

### 18. DP II: intervalo, bitmask, dígitos e grupos abertos
- **1690 Hamiltonian Flights** (Graph Algorithms) é DP em bitmask pura. Fica aqui e não no milestone de Euler/Hamilton porque a técnica é a DP.
- **1159 Book Shop II** (Additional II): mochila limitada com binary splitting.
- **1149 Distinct Subsequences** (String Algorithms): DP de contagem ("subtrair a última ocorrência"), sem algoritmo de string.
- **2176 Counting Bishops** (Counting): DP por diagonais, separando as cores.
- **1665 Coding Company** (Additional II): o exemplo canônico de DP de "grupos abertos".
- **Reservados:**
  - **1086 Writing Numbers**: busca binária na resposta + contar dígitos.
  - **3308 Graph Coloring** (Advanced Graph): número cromático com n ≤ 16 via DP sobre subconjuntos independentes.
  - **1706 School Excursion** (Additional II): DSU + mochila limitada nos tamanhos das componentes. Saiu do milestone 12 porque precisa da mochila limitada vista aqui.
- **Fica para depois:**
  - **1080 Empty String** → milestone 20 (DP em intervalo com binomiais).
  - **1075 Counting Permutations** → Counting avançado.

### 19. Matemática I: aritmética modular, primos e divisores (CPH 21)
- **3214 Water Containers Queries** (Additional I) é Bézout: possível ⇔ x ≤ max(a,b) e mdc(a,b) | x. Fica reservado porque a sacada de MDC está escondida num problema de baldes.
- **3398 Permutation Rounds**, também reservado: MMC dos ciclos módulo p, via fatoração (não dá para calcular o MMC "de verdade").

### 20. Matemática II: combinatória e inclusão-exclusão (CPH 22)
Os problemas de Counting com fórmula fechada vêm para cá:
- **2228 Counting Sequences**: sobrejeções por inclusão-exclusão.
- **1080 Empty String**: DP em intervalo com binomiais para intercalar.
- **3157 Collecting Numbers Distribution**: números eulerianos.

E os reservados:
- **3161 GCD Subsets** (Additional II): contar múltiplos e subtrair de cima para baixo.
- **1078 Grid Paths II** (Counting): binomiais + inclusão-exclusão sobre armadilhas ordenadas.

### 21. Matemática III: matrizes, probabilidade e jogos (CPH 23–25)
- **Reservados:**
  - **3169 Counting LCM Arrays** (Additional I): fatorar k e resolver uma recorrência por primo com matriz 2×2.
  - **2208 Another Game**: o padrão de paridade aparece com força bruta em casos pequenos.

### 22. Bitwise: truques, trie binária, base xor e SOS DP
O seu esqueleto juntava Bitwise e Construction. Separei porque Construction exige uma "mentalidade" (casos pequenos, invariantes) que merece módulo e checkpoint próprios.
- **3233 All Subarray Xors** saiu daqui e foi para Técnicas avançadas, porque é convolução xor (Walsh-Hadamard).
- **Reservado: 3193 Square Subsets** (Additional I): vetores de paridade dos expoentes primos em GF(2), resposta 2^(n−posto). É a mesma base xor, com 669 bits.

### 23. Construction: inventar a resposta
- **2430 Binary Subsequences** (Additional II) e **2427 Letter Pair Move Game** (Additional I) são construções puras.
- **Reservados:**
  - **3175 Beautiful Permutation II**: greedy lexicográfico.
  - **1698 Swap Round Sorting**: ciclos da permutação, a resposta é ≤ 2 rodadas.

---

## Fase 5 — Strings, grafos avançados, geometria e técnicas

### 24–25. Strings (CPH 26 + cp-algorithms)
Dividi em "lineares" (hashing, KMP, Z, trie, Manacher) e "estruturas de sufixo" (suffix array, LCP, Aho-Corasick), porque a segunda metade é bem mais pesada. **1149 Distinct Subsequences** saiu para a DP II (veja acima). **2186 Special Substrings** ficou no milestone 7 (é prefixo + hashmap).

### 26. Grafos avançados I: SCC, 2-SAT, pontes e articulações (CPH 17)
- Os problemas SCC/2-SAT da seção Graph Algorithms vêm para cá: **1682**, **1683**, **1686** e **1684 Giant Pizza**.
- Necessary Roads/Cities (**2076**, **2077**, Advanced Techniques) são pontes/articulações e ficam aqui também.
- **Reservados:**
  - **3312 Grid Coloring II** (Additional II): com 3 letras, cada célula tem exatamente 2 opções, o que vira 2-SAT.
  - **2179 Even Outdegree Edges**: árvore de DFS e orientar de baixo para cima.

### 27. Grafos avançados II: Euler, Hamilton, fluxo e matching (CPH 19, 20)
- **2078 Eulerian Subgraphs** (Advanced Techniques) dá 2^(m−n+c) pelo espaço de ciclos. Fica aqui pela teoria de Euler.
- Os problemas de custo mínimo (**2121**, **2129**, **2130** de Advanced Techniques e **2131 Grid Puzzle II** de Additional II) vêm para cá junto com fluxo.
- **Reservados:**
  - **1709 Coin Grid**: teorema de König.
  - **2432 Grid Puzzle I**: fluxo bipartido com capacidades.

### 28. Geometria e sweep line (CPH 29, 30)
- **3306 Nearest Campsites I** e **3307 Nearest Campsites II** (Additional I) são vizinho mais próximo em Manhattan: sweep por quadrante com BIT.
- **3301 Maximum Average Subarrays** (Additional I) é fecho convexo inferior dos prefixos.
- **Fica para depois:** os quatro problemas de retas da seção Geometry (**3427–3430**) vão para a DP III, porque Li Chao é a técnica de CHT.

### 29. Técnicas avançadas: bitset, treap, FFT e conectividade offline (CPH 27 + cp-algorithms)
- **3233 All Subarray Xors** (Bitwise) é convolução xor dos prefixos.
- **3408 MST Edge Set Check** (Advanced Graph) usa DSU com rollback por grupo de peso.
- **Reservados:**
  - **2115 Bit Substrings** (Additional II): contagem por número de uns é uma convolução.
  - **2075 Reversal Sorting** (Additional II): n reversões em O(n log n) com treap implícita.

### 30. DP III: CHT, Li Chao, D&C e Knuth
Você não listou esse tema, mas a seção Advanced Techniques tem Monster Game I/II, Subarray Squares, Houses and Schools e Knuth Division, que são exatamente isso. Os quatro problemas de retas da Geometry entram aqui pelo motivo do milestone 28. **Reservado: 3427 Line Segments Trace I.**

### 31. Problemas interativos
Ficou no fim, como você pediu. Vale saber que **3112 Hidden Integer** é só busca binária: se quiser se acostumar cedo com o formato (flush!), dá para movê-lo para o milestone 3 sem quebrar nada.

### 32. Counting avançado
É o que sobrou da seção Counting depois de distribuir os problemas com fórmula fechada (milestone 20), os de DP (milestones 9 e 18) e os de pilha (milestone 6). Tem muitos `uncertain`.

### 33. Boss final: Additional Problems restantes
São os Additional que exigem técnicas finas: slope trick (**2132**), greedy com arrependimento (**3402**), busca em fila de prioridade (**3108**, **3109**). Também ficam aqui os que eu não soube encaixar com segurança. O checkpoint é só de revisão, porque o milestone inteiro já é "sem tema".

---

## Problemas com classificação incerta (`uncertain: true`)

Antes de escrever as dicas destes, vou confirmar a técnica (editoriais/USACO Guide) e corrigir a posição se for preciso:

| Milestone | Problemas |
|---|---|
| Árvores III | 3149 |
| Matemática I | 3355 |
| Bitwise | 3195 |
| Construction | 3422, 2430, 3424, 2423, 2418, 2427 |
| Grafos avançados II | 3358 |
| Técnicas avançadas | 3360, 3408 |
| Interativos | 3140 |
| Counting avançado | 2429, 3400, 3232, 2415, 3415, 3416, 3417, 3418 |
| Boss final | 3109, 3425, 2184, 3152, 3218, 3216, 2180, 2174, 3401, 3227, 2402 |

---

## Desvios do seu esqueleto, em resumo

1. A STL vem **antes** de two pointers/sliding window (milestone 4 antes do 5).
2. Tem **33 milestones** em vez de 15–25, agrupados em 5 fases.
3. DP em árvore básica e rerooting estão em **Árvores I**, não em DP II.
4. Bitwise e Construction estão **separados**.
5. Criei **DP III** (CHT/Li Chao/D&C/Knuth), que não estava no esqueleto.
6. Grafos funcionais (Planets*) estão em **Árvores II**, junto com binary lifting.

## Pontos para você decidir

- **Fusões possíveis se quiser menos milestones:**
  - 5 + 6 (two pointers + sliding window);
  - 8 + 9 (DP I);
  - 24 + 25 (strings);
  - 22 + 23 (bitwise + construction, como no seu esqueleto);
  - 17 → dissolver em 16 e 29.

  Com todas elas, ficam 28.
- **Hidden Integer cedo** (no milestone 3) ou junto com os interativos?
- **Como os seus milestones "já domino" da USACO entram:** pelo seu histórico (Bronze completo, Silver até grafos/BFS e busca binária), os candidatos são 1, 3, 4, 5, 7 e 10. O 2 e o 6 talvez valham fazer mesmo assim, pelos problemas novos de pilha/sliding window. O 8 e o 9 (DP) são a fronteira natural de onde você parou.
