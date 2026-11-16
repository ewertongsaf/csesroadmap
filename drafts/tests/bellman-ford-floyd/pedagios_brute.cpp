#include <bits/stdc++.h>
using namespace std;
// Força bruta para grafos pequenos: enumera todos os caminhos simples a partir de 1 (menor custo até cada vértice)
// e todos os ciclos simples alcançáveis a partir de 1 (algum de soma negativa?).
int n, m; vector<vector<pair<int,long long>>> viz; vector<long long> best; vector<bool> naPilha; vector<long long> acum; bool negativo = false;
void go(int u, long long c) {
    best[u] = min(best[u], c); naPilha[u] = true; acum[u] = c;
    for (auto [v, w] : viz[u]) { if (naPilha[v]) { if (c + w - acum[v] < 0) negativo = true; } else go(v, c + w); }
    naPilha[u] = false;
}
int main() {
    cin >> n >> m; viz.assign(n + 1, {}); for (int i = 0; i < m; i++) { int a, b; long long w; cin >> a >> b >> w; viz[a].push_back({b, w}); }
    const long long INF = 1e18; best.assign(n + 1, INF); naPilha.assign(n + 1, false); acum.assign(n + 1, 0);
    go(1, 0);
    if (negativo) { cout << "CICLO NEGATIVO\n"; return 0; }
    for (int u = 1; u <= n; u++) { if (best[u] == INF) cout << "x"; else cout << best[u]; cout << " \n"[u == n]; }
}
