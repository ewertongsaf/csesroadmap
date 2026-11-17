// Confere os números citados no texto: ordem da DFS, distâncias das três buscas, excentricidades, contraexemplos e quiz.
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
int n; vector<vector<pair<int,int>>> adj;
vector<int> ordem;
void dfs(int v, int p, ll d, vector<ll>& dist) { dist[v] = d; ordem.push_back(v); for (auto [u, w] : adj[v]) if (u != p) dfs(u, v, d + w, dist); }
int far(const vector<ll>& d) { int m = 1; for (int v = 2; v <= n; v++) if (d[v] > d[m]) m = v; return m; }
void monta(vector<array<int,3>> E, int nn) { n = nn; adj.assign(n + 1, {}); for (auto e : E) { adj[e[0]].push_back({e[1], e[2]}); adj[e[1]].push_back({e[0], e[2]}); } }
ll verdade() { ll b = LLONG_MIN; for (int s = 1; s <= n; s++) { vector<ll> d(n + 1); dfs(s, 0, 0, d); for (int v = 1; v <= n; v++) b = max(b, d[v]); } return b; }
void mostra(const char* t, const vector<ll>& d) { printf("%s:", t); for (int v = 1; v <= n; v++) printf(" %lld", d[v]); puts(""); }
int main() {
    monta({{1,2,3},{1,3,2},{2,4,4},{2,5,1},{3,6,5},{6,7,2},{6,8,1}}, 8);
    vector<ll> d1(n + 1), dA(n + 1), dB(n + 1);
    ordem.clear(); dfs(1, 0, 0, d1); printf("ordem da DFS a partir de 1:"); for (int v : ordem) printf(" %d", v); puts(""); mostra("dist de 1", d1);
    int A = far(d1); ordem.clear(); dfs(A, 0, 0, dA); printf("A=%d; ordem a partir de A:", A); for (int v : ordem) printf(" %d", v); puts(""); mostra("dist de A", dA);
    int B = far(dA); ordem.clear(); dfs(B, 0, 0, dB); printf("B=%d; ordem a partir de B:", B); for (int v : ordem) printf(" %d", v); puts(""); mostra("dist de B", dB);
    printf("excentricidade:"); for (int v = 1; v <= n; v++) printf(" %lld", max(dA[v], dB[v])); puts("");
    printf("diametro %lld (verdade %lld); uma DFS so, a partir de 1, daria %lld\n", dA[B], verdade(), d1[A]);
    // caminho do diâmetro
    { vector<int> pai(n + 1, 0); function<void(int,int)> f = [&](int v, int p) { pai[v] = p; for (auto [u, w] : adj[v]) if (u != p) f(u, v); }; f(A, 0); printf("caminho A..B:"); for (int x = B; x; x = pai[x]) printf(" %d", x); puts(""); }
    // pesos negativos: menor contraexemplo
    { mt19937 rng(5); bool achou = false; for (int nn = 2; nn <= 5 && !achou; nn++) for (int it = 0; it < 20000 && !achou; it++) { vector<array<int,3>> E; for (int v = 2; v <= nn; v++) E.push_back({(int)(rng() % (v - 1)) + 1, v, (int)(rng() % 9) - 4}); monta(E, nn);
        vector<ll> a(n + 1), b(n + 1); dfs(1, 0, 0, a); int x = far(a); dfs(x, 0, 0, b); int y = far(b); ll v = verdade(); if (b[y] != v) { achou = true; printf("contraexemplo com peso negativo (n=%d):", nn); for (auto e : E) printf(" %d-%d(%d)", e[0], e[1], e[2]); printf(" | duas DFS: A=%d B=%d dist %lld; maior de verdade %lld\n", x, y, b[y], v); } } }
    // quiz: estrela e caminho
    { monta({{1,2,1},{2,3,1},{3,4,1},{2,5,1}}, 5); vector<ll> a(n + 1), b(n + 1); ordem.clear(); dfs(1, 0, 0, a); int x = far(a); dfs(x, 0, 0, b); int y = far(b); printf("quiz arvore 1-2-3-4, 2-5 (pesos 1): ordem"); for (int v : ordem) printf(" %d", v); printf(" | A=%d B=%d diam %lld\n", x, y, b[y]); }
    { monta({{1,2,5},{1,3,1},{3,4,1},{4,5,1},{5,6,1}}, 6); vector<ll> a(n + 1); dfs(1, 0, 0, a); int x = far(a); vector<ll> b(n + 1); dfs(x, 0, 0, b); int y = far(b); printf("quiz 1-2(5) 1-3-4-5-6(1): mais longe de 1 = %d (%lld), A=%d, B=%d, diam %lld\n", x, a[x], x, y, b[y]); vector<ll> c(n + 1); dfs(y, 0, 0, c); printf("  excentricidades:"); for (int v = 1; v <= n; v++) printf(" %lld", max(b[v], c[v])); puts(""); }
}
