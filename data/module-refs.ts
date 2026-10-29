// Referências externas dos módulos que ainda não têm aula escrita (status 'planned').
// Todo link aqui foi verificado por fetch (scripts/check-links.ts também varre este arquivo).
// Links que começam com "/" são internos (outra aula do site).

export interface Ref {
  label: string;
  url: string;
}

const U = (path: string, title: string): Ref => ({ label: `USACO Guide — ${title}`, url: `https://usaco.guide/${path}` });
const C = (path: string, title: string): Ref => ({ label: `cp-algorithms — ${title}`, url: `https://cp-algorithms.com/${path}` });

export const moduleRefs: Record<string, Ref[]> = {
  // Fase 2
  'dp-introducao': [U('gold/intro-dp', 'Introduction to DP'), C('dynamic_programming/intro-to-dp.html', 'Introduction to Dynamic Programming')],
  'dp-mochila': [U('gold/knapsack', 'Knapsack DP'), C('dynamic_programming/knapsack.html', 'Knapsack Problem')],
  'dp-grid-strings': [U('gold/paths-grids', 'Paths on Grids'), U('gold/intro-dp', 'Introduction to DP')],
  lis: [U('gold/lis', 'Longest Increasing Subsequence'), C('sequences/longest_increasing_subsequence.html', 'Longest increasing subsequence')],
  'grafos-dfs': [
    U('bronze/intro-graphs', 'Introduction to Graphs'),
    U('silver/graph-traversal', 'Graph Traversal'),
    U('silver/flood-fill', 'Flood Fill'),
    C('graph/depth-first-search.html', 'Depth First Search'),
    C('graph/finding-cycle.html', 'Finding a cycle'),
  ],
  bfs: [U('gold/bfs', 'Shortest Paths with Unweighted Edges'), C('graph/breadth-first-search.html', 'Breadth First Search'), C('graph/01_bfs.html', '0-1 BFS')],
  dijkstra: [U('gold/shortest-paths', 'Shortest Paths with Non-Negative Edge Weights'), C('graph/dijkstra.html', 'Dijkstra'), C('graph/dijkstra_sparse.html', 'Dijkstra on sparse graphs')],
  'bellman-ford-floyd': [
    C('graph/bellman_ford.html', 'Bellman-Ford'),
    C('graph/finding-negative-cycle-in-graph.html', 'Finding a Negative Cycle'),
    C('graph/all-pair-shortest-path-floyd-warshall.html', 'Floyd-Warshall'),
  ],
  'dag-toposort': [U('gold/toposort', 'Topological Sort'), C('graph/topological-sort.html', 'Topological Sorting')],
  dsu: [U('gold/dsu', 'Disjoint Set Union'), C('data_structures/disjoint_set_union.html', 'Disjoint Set Union')],
  mst: [U('gold/mst', 'Minimum Spanning Trees'), C('graph/mst_kruskal_with_dsu.html', 'Kruskal with DSU')],

  // Fase 3
  fenwick: [U('gold/PURS', 'Point Update Range Sum'), C('data_structures/fenwick.html', 'Fenwick Tree')],
  'segment-tree': [U('gold/PURS', 'Point Update Range Sum'), C('data_structures/segment_tree.html', 'Segment Tree')],
  'ordered-set': [U('gold/PURS', 'Point Update Range Sum (inclui indexed set)')],
  'segtree-nos-compostos': [U('plat/seg-ext', 'More Applications of Segment Tree'), C('data_structures/segment_tree.html', 'Segment Tree')],
  'queries-offline': [U('gold/PURS', 'Point Update Range Sum (problemas offline)'), C('data_structures/fenwick.html', 'Fenwick Tree')],
  'lazy-propagation': [U('plat/RURQ', 'Range Update Range Query'), C('data_structures/segment_tree.html', 'Segment Tree (lazy e persistente)')],
  'arvores-basico': [U('silver/intro-tree', 'Introduction to Tree Algorithms'), C('graph/depth-first-search.html', 'Depth First Search')],
  'dp-em-arvore': [U('gold/dp-trees', 'DP on Trees - Introduction'), U('gold/all-roots', 'DP on Trees - Solving For All Roots')],
  'binary-lifting-lca': [U('plat/binary-jump', 'Binary Jumping'), C('graph/lca_binary_lifting.html', 'LCA - Binary Lifting'), C('graph/lca.html', 'LCA')],
  'grafos-funcionais': [U('silver/func-graphs', 'Introduction to Functional Graphs'), U('plat/binary-jump', 'Binary Jumping')],
  'euler-tour': [U('gold/tree-euler', 'Euler Tour Technique')],
  'small-to-large': [U('plat/merging', 'Small-To-Large Merging')],
  hld: [U('plat/hld', 'Heavy-Light Decomposition'), C('graph/hld.html', 'Heavy-light decomposition')],
  'centroid-decomposition': [U('plat/centroid', 'Centroid Decomposition')],

  // Fase 4
  'dp-intervalo': [U('gold/dp-ranges', 'Range DP')],
  'dp-bitmask': [U('gold/dp-bitmasks', 'Bitmask DP'), C('dynamic_programming/profile-dynamics.html', 'DP on Broken Profile')],
  'dp-digitos': [U('gold/digit-dp', 'Digit DP')],
  'aritmetica-modular': [U('gold/modular', 'Modular Arithmetic'), C('algebra/binary-exp.html', 'Binary Exponentiation'), C('algebra/module-inverse.html', 'Modular Inverse')],
  'primos-divisores': [
    U('gold/divisibility', 'Divisibility'),
    C('algebra/sieve-of-eratosthenes.html', 'Sieve of Eratosthenes'),
    C('algebra/divisors.html', 'Number of divisors / sum of divisors'),
    C('algebra/euclid-algorithm.html', 'Euclidean algorithm'),
    C('algebra/factorization.html', 'Integer factorization'),
  ],
  binomiais: [U('gold/combo', 'Combinatorics'), C('combinatorics/binomial-coefficients.html', 'Binomial Coefficients')],
  'inclusao-exclusao': [U('plat/PIE', 'Inclusion-Exclusion Principle'), C('combinatorics/inclusion-exclusion.html', 'The Inclusion-Exclusion Principle'), C('algebra/phi-function.html', "Euler's totient function")],
  'catalan-burnside': [C('combinatorics/catalan-numbers.html', 'Catalan Numbers'), C('combinatorics/burnside.html', "Burnside's lemma")],
  matrizes: [U('plat/matrix-expo', 'Matrix Exponentiation'), C('algebra/fibonacci-numbers.html', 'Fibonacci Numbers'), C('linear_algebra/linear-system-gauss.html', 'Gauss & System of Linear Equations')],
  probabilidade: [U('gold/combo', 'Combinatorics (base para contar casos)')],
  'teoria-dos-jogos': [U('adv/game-theory', 'Game Theory'), C('game_theory/sprague-grundy-nim.html', 'Sprague-Grundy theorem. Nim'), C('game_theory/games_on_graphs.html', 'Games on arbitrary graphs')],
  'truques-de-bits': [U('silver/intro-bitwise', 'Intro to Bitwise Operators'), C('algebra/bit-manipulation.html', 'Bit manipulation')],
  'xor-basis-trie': [U('adv/xor-basis', 'XOR Basis')],
  'sos-dp': [U('plat/dp-sos', 'Sum over Subsets DP'), C('algebra/all-submasks.html', 'Enumerating submasks of a bitmask')],
  construcao: [U('bronze/ad-hoc', 'Ad Hoc Problems')],

  // Fase 5
  'string-hashing': [C('string/string-hashing.html', 'String Hashing')],
  'kmp-z': [C('string/prefix-function.html', 'Prefix function - Knuth-Morris-Pratt'), C('string/z-function.html', 'Z-function')],
  trie: [C('string/aho_corasick.html', 'Aho-Corasick (a primeira parte constrói a trie)')],
  manacher: [C('string/manacher.html', "Manacher's Algorithm")],
  'suffix-array': [U('adv/suffix-array', 'Suffix Array'), C('string/suffix-array.html', 'Suffix Array'), C('string/lyndon_factorization.html', 'Lyndon factorization (rotação mínima)')],
  'aho-corasick': [C('string/aho_corasick.html', 'Aho-Corasick algorithm')],
  'scc-2sat': [U('adv/SCC', 'Strongly Connected Components'), C('graph/strongly-connected-components.html', 'Strongly Connected Components'), C('graph/2SAT.html', '2-SAT')],
  'pontes-articulacoes': [C('graph/bridge-searching.html', 'Finding bridges'), C('graph/cutpoints.html', 'Finding articulation points')],
  'euler-hamilton': [C('graph/euler_path.html', 'Finding the Eulerian path'), U('gold/dp-bitmasks', 'Bitmask DP (caminho hamiltoniano)')],
  'fluxo-matching': [
    U('adv/max-flow', 'Maximum Flow'),
    C('graph/edmonds_karp.html', 'Ford-Fulkerson and Edmonds-Karp'),
    C('graph/dinic.html', "Dinic's algorithm"),
    C('graph/kuhn_maximum_bipartite_matching.html', "Kuhn's Algorithm"),
  ],
  'min-cost-flow': [U('adv/min-cost-flow', 'Minimum Cost Flow'), C('graph/min_cost_flow.html', 'Minimum-cost flow'), C('graph/hungarian-algorithm.html', 'Hungarian Algorithm')],
  'geometria-basica': [U('plat/geo-pri', 'Geometry Primitives'), C('geometry/basic-geometry.html', 'Basic Geometry'), C('geometry/check-segments-intersection.html', 'Check if two segments intersect')],
  poligonos: [
    C('geometry/area-of-simple-polygon.html', 'Area of simple polygon'),
    C('geometry/picks-theorem.html', "Pick's Theorem"),
    C('geometry/point-in-convex-polygon.html', 'Point in convex polygon'),
  ],
  'sweep-geometria': [U('plat/convex-hull', 'Convex Hull'), U('plat/sweep-line', 'Sweep Line'), C('geometry/convex-hull.html', 'Convex hull construction'), C('geometry/nearest_points.html', 'Nearest pair of points')],
  'distancia-manhattan': [C('geometry/manhattan-distance.html', 'Manhattan Distance')],
  bitset: [U('plat/bitsets', 'Bitsets')],
  treap: [U('adv/treaps', 'Treaps'), C('data_structures/treap.html', 'Treap')],
  fft: [C('algebra/fft.html', 'Fast Fourier transform')],
  'conectividade-offline': [U('adv/offline-del', 'Offline Deletion'), C('data_structures/deleting_in_log_n.html', 'Deleting in O(T(n) log n)')],
  'cht-li-chao': [U('plat/convex-hull-trick', 'Convex Hull Trick'), C('geometry/convex_hull_trick.html', 'Convex hull trick and Li Chao tree')],
  'dp-otimizacoes': [U('plat/DC-DP', 'Divide & Conquer - DP'), C('dynamic_programming/divide-and-conquer-dp.html', 'Divide and Conquer DP'), C('dynamic_programming/knuth-optimization.html', "Knuth's Optimization")],
  interativos: [
    { label: 'Aula do site — Busca binária e o formato interativo', url: '/modulos/busca-binaria' },
    C('num_methods/binary_search.html', 'Binary Search'),
  ],
  'contagem-avancada': [U('plat/PIE', 'Inclusion-Exclusion Principle'), C('combinatorics/inclusion-exclusion.html', 'The Inclusion-Exclusion Principle')],
  'greedy-avancado': [U('adv/slope-trick', 'Slope Trick'), U('silver/greedy-sorting', 'Greedy Algorithms with Sorting')],
};
