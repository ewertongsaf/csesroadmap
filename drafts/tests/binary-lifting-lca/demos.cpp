// Confere os números citados no texto: profundidades, distâncias, tabela de saltos, traços do LCA, contraexemplos e quiz.
#include <bits/stdc++.h>
using namespace std;
const int LOG = 4;
int n; vector<vector<pair<int,int>>> adj; vector<int> prof; vector<long long> dist; vector<array<int, LOG>> up;
void dfs(int v, int p) { up[v][0] = p; for (int k = 1; k < LOG; k++) up[v][k] = up[up[v][k-1]][k-1]; for (auto [u, w] : adj[v]) if (u != p) { prof[u] = prof[v] + 1; dist[u] = dist[v] + w; dfs(u, v); } }
int sobe(int v, int k, bool tr) { for (int b = 0; b < LOG; b++) if (k >> b & 1) { int o = v; v = up[v][b]; if (tr) printf("   bit %d ligado: pula 2^%d = %d, de %d para %d\n", b, b, 1 << b, o, v); } return v; }
int lca(int a, int b, bool tr, int modo = 0) { if (prof[a] < prof[b]) swap(a, b); if (tr) printf("   mais fundo: %d (prof %d); outro: %d (prof %d); diferenca %d\n", a, prof[a], b, prof[b], prof[a] - prof[b]);
    if (modo != 1) a = sobe(a, prof[a] - prof[b], tr);
    if (a == b) { if (tr) printf("   ja se encontraram: %d\n", a); return a; }
    if (modo == 2) { for (int k = 0; k < LOG; k++) if (up[a][k] != up[b][k]) { a = up[a][k]; b = up[b][k]; } return up[a][0]; }
    for (int k = LOG - 1; k >= 0; k--) { if (tr) printf("   k=%d: up[%d][%d]=%d, up[%d][%d]=%d -> %s\n", k, a, k, up[a][k], b, k, up[b][k], up[a][k] != up[b][k] ? "diferentes, pula" : "iguais, nao pula"); if (up[a][k] != up[b][k]) { a = up[a][k]; b = up[b][k]; } }
    if (tr) printf("   pai de %d = %d\n", a, up[a][0]);
    return up[a][0]; }
int lcab(int a, int b) { while (prof[a] > prof[b]) a = up[a][0]; while (prof[b] > prof[a]) b = up[b][0]; while (a != b) { a = up[a][0]; b = up[b][0]; } return a; }
int main() {
    n = 12; adj.assign(n + 1, {}); int E[11][3] = {{1,2,4},{2,3,1},{3,4,3},{4,5,2},{5,6,5},{6,7,1},{3,8,2},{8,9,6},{5,10,3},{10,11,2},{1,12,7}};
    for (auto& e : E) { adj[e[0]].push_back({e[1], e[2]}); adj[e[1]].push_back({e[0], e[2]}); }
    prof.assign(n + 1, 0); dist.assign(n + 1, 0); up.assign(n + 1, {}); dfs(1, 1);
    printf("v prof dist up0 up1 up2 up3\n"); for (int v = 1; v <= n; v++) printf("%d %d %lld %d %d %d %d\n", v, prof[v], dist[v], up[v][0], up[v][1], up[v][2], up[v][3]);
    puts("sobe(7, 5):"); printf("  = %d\n", sobe(7, 5, true));
    puts("sobe(7, 6):"); printf("  = %d\n", sobe(7, 6, true));
    vector<pair<int,int>> Q = {{7, 11}, {9, 7}, {11, 12}, {6, 9}, {10, 4}};
    for (auto [a, b] : Q) { printf("lca(%d,%d):\n", a, b); int c = lca(a, b, true); printf("  = %d (bruto %d); dist = %lld + %lld - 2*%lld = %lld\n", c, lcab(a, b), dist[a], dist[b], dist[c], dist[a] + dist[b] - 2 * dist[c]); }
    // contraexemplos
    for (auto [a, b] : Q) printf("sem igualar profundidade lca(%d,%d) = %d (certo %d); do menor salto para o maior = %d\n", a, b, lca(a, b, false, 1), lcab(a, b), lca(a, b, false, 2));
    { int achados = 0; for (int a = 1; a <= n; a++) for (int b = 1; b <= n; b++) if (lca(a, b, false, 2) != lcab(a, b) && achados < 4) { achados++; printf("menor-para-maior erra no exemplo: lca(%d,%d) = %d (certo %d)\n", a, b, lca(a, b, false, 2), lcab(a, b)); } if (!achados) puts("menor-para-maior nao erra no exemplo"); }
    { int sn = n; auto sa = adj; auto sp = prof; auto sd = dist; auto su = up;
      n = 7; adj.assign(n + 1, {}); int V[6][2] = {{1,2},{2,3},{3,4},{1,5},{5,6},{6,7}}; for (auto& e : V) { adj[e[0]].push_back({e[1], 1}); adj[e[1]].push_back({e[0], 1}); }
      prof.assign(n + 1, 0); dist.assign(n + 1, 0); up.assign(n + 1, {}); dfs(1, 1);
      printf("V 1-2-3-4 e 1-5-6-7: lca(4,7) certo %d; do menor para o maior %d; sem igualar ok\n", lca(4, 7, false), lca(4, 7, false, 2));
      n = sn; adj = sa; prof = sp; dist = sd; up = su; }
    // estresse dos dois contraexemplos e do certo em árvores aleatórias
    { mt19937 rng(3); int erra1 = 0, erra2 = 0, tot = 0; for (int it = 0; it < 2000; it++) { n = rng() % 15 + 1; adj.assign(n + 1, {}); for (int v = 2; v <= n; v++) { int p = rng() % (v - 1) + 1; adj[p].push_back({v, 1}); adj[v].push_back({p, 1}); }
        prof.assign(n + 1, 0); dist.assign(n + 1, 0); up.assign(n + 1, {}); dfs(1, 1); for (int a = 1; a <= n; a++) for (int b = 1; b <= n; b++) { tot++; int c = lcab(a, b); if (lca(a, b, false) != c) { puts("LCA DIFERENTE"); return 1; } erra1 += lca(a, b, false, 1) != c; erra2 += lca(a, b, false, 2) != c; } }
      printf("estresse: lca ok em %d pares; sem igualar erra %d, menor-para-maior erra %d\n", tot, erra1, erra2); }
}
