// Confere os números citados no texto: centroides de cada nível, listas "acima", traços dos eventos, contraexemplos e quiz.
#include <bits/stdc++.h>
using namespace std;
const int INF = 1e9;
int n; vector<vector<int>> adj; vector<bool> rem; vector<int> tam, nivel, paiC; vector<vector<pair<int,int>>> acima; vector<int> melhor; int modo = 0; int maxNivel;
int calc(int v, int p) { tam[v] = 1; for (int u : adj[v]) if (u != p && !rem[u]) tam[v] += calc(u, v); return tam[v]; }
int cen(int v, int p, int tot) { for (int u : adj[v]) if (u != p && !rem[u] && tam[u] > tot / 2) return cen(u, v, tot); return v; }
void marca(int v, int p, int c, int d) { acima[v].push_back({c, d}); for (int u : adj[v]) if (u != p && !rem[u]) marca(u, v, c, d + 1); }
void dec(int v, int lv, int pc) { int tot = calc(v, 0); int c = modo == 1 ? v : cen(v, 0, tot); nivel[c] = lv; paiC[c] = pc; maxNivel = max(maxNivel, lv); marca(c, 0, c, 0); rem[c] = true; for (int u : adj[c]) if (!rem[u]) dec(u, lv + 1, c); }
void monta(int nn, vector<pair<int,int>> E) { n = nn; adj.assign(n + 1, {}); for (auto [a, b] : E) { adj[a].push_back(b); adj[b].push_back(a); } rem.assign(n + 1, false); tam.assign(n + 1, 0); nivel.assign(n + 1, 0); paiC.assign(n + 1, 0); acima.assign(n + 1, {}); melhor.assign(n + 1, INF); maxNivel = 0; dec(1, 0, 0); }
void abre(int v) { for (auto [c, d] : acima[v]) melhor[c] = min(melhor[c], d); }
int consulta(int v, int m = 0) { int r = INF; if (m == 1) { auto [c, d] = acima[v].back(); return d + melhor[c]; } for (auto [c, d] : acima[v]) r = min(r, d + melhor[c]); return r; }
int bruto(int v, vector<bool>& ab) { vector<int> d(n + 1, -1); d[v] = 0; deque<int> f = {v}; while (!f.empty()) { int x = f.front(); f.pop_front(); if (ab[x]) return d[x]; for (int u : adj[x]) if (d[u] < 0) { d[u] = d[x] + 1; f.push_back(u); } } return -1; }
int main() {
    vector<pair<int,int>> E = {{1,2},{2,3},{3,4},{4,5},{5,6},{6,7},{3,8},{8,9},{5,10},{10,11},{1,12}};
    monta(12, E);
    printf("v nivel paiCentroide | acima\n"); for (int v = 1; v <= n; v++) { printf("%d %d %d |", v, nivel[v], paiC[v]); for (auto [c, d] : acima[v]) printf(" (%d,%d)", c, d); puts(""); }
    vector<bool> ab(n + 1, false); ab[1] = true; abre(1);
    printf("melhor depois de abrir 1:"); for (int v = 1; v <= n; v++) printf(" %s", melhor[v] >= INF ? "inf" : to_string(melhor[v]).c_str()); puts("");
    vector<pair<char,int>> ev = {{'Q',9},{'A',7},{'Q',9},{'Q',11},{'A',9},{'Q',8},{'Q',12}};
    for (auto [t, v] : ev) { if (t == 'A') { ab[v] = true; abre(v); printf("A %d: atualiza", v); for (auto [c, d] : acima[v]) printf(" melhor[%d]=%d", c, melhor[c]); puts(""); }
        else { printf("Q %d:", v); for (auto [c, d] : acima[v]) printf(" via %d: %d+%s", c, d, melhor[c] >= INF ? "inf" : to_string(melhor[c]).c_str()); int r = consulta(v); printf(" -> %d (bruto %d); so o proprio centroide: %d\n", r, bruto(v, ab), consulta(v, 1) >= INF / 2 ? -1 : consulta(v, 1)); } }
    // níveis: cadeia de 2e5 com centroide de verdade x escolher sempre o primeiro vértice
    { int N = 200000; vector<pair<int,int>> F; for (int v = 2; v <= N; v++) F.push_back({v - 1, v}); monta(N, F); printf("cadeia 2e5: niveis da arvore de centroides = %d\n", maxNivel + 1); }
    { int N = 3000; vector<pair<int,int>> F; for (int v = 2; v <= N; v++) F.push_back({v - 1, v}); modo = 1; monta(N, F); printf("cadeia 3000 escolhendo sempre o primeiro vertice do pedaco: %d niveis\n", maxNivel + 1); modo = 0; monta(N, F); printf("cadeia 3000 com centroide: %d niveis\n", maxNivel + 1); }
    { mt19937 rng(3); int pior = 0; for (int it = 0; it < 30; it++) { int N = 20000; vector<pair<int,int>> F; for (int v = 2; v <= N; v++) F.push_back({(int)(rng() % (v - 1)) + 1, v}); monta(N, F); pior = max(pior, maxNivel + 1); } printf("arvores aleatorias de 2e4: no maximo %d niveis\n", pior); }
}
