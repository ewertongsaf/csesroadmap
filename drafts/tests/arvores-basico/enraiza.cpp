// O trecho "enraizar" do texto da aula, copiado, e testado contra uma contagem por força bruta.
#include <bits/stdc++.h>
using namespace std;
int n;
vector<vector<pair<int, int>>> adj;
vector<int> pai, prof, tam;

void enraiza(int v, int p) {
    pai[v] = p;
    tam[v] = 1;                                // a própria clareira
    for (auto [u, w] : adj[v]) {
        if (u == p) continue;
        prof[u] = prof[v] + 1;
        enraiza(u, v);
        tam[v] += tam[u];                      // na volta: a subárvore do filho já está contada
    }
}

int main() {
    // exemplo da aula
    n = 8; adj.assign(n + 1, {});
    int E[7][3] = {{1,2,3},{1,3,2},{2,4,4},{2,5,1},{3,6,5},{6,7,2},{6,8,1}};
    for (auto& e : E) { adj[e[0]].push_back({e[1], e[2]}); adj[e[1]].push_back({e[0], e[2]}); }
    pai.assign(n + 1, 0); prof.assign(n + 1, 0); tam.assign(n + 1, 0);
    enraiza(1, 0);
    printf("v pai prof tam\n"); for (int v = 1; v <= n; v++) printf("%d %d %d %d\n", v, pai[v], prof[v], tam[v]);
    mt19937 rng(2);
    for (int it = 0; it < 2000; it++) {
        n = rng() % 12 + 1; adj.assign(n + 1, {});
        for (int v = 2; v <= n; v++) { int p = rng() % (v - 1) + 1; adj[p].push_back({v, 1}); adj[v].push_back({p, 1}); }
        pai.assign(n + 1, 0); prof.assign(n + 1, 0); tam.assign(n + 1, 0);
        enraiza(1, 0);
        // força bruta: v está na subárvore de r se o caminho de v até 1 passa por r
        for (int r = 1; r <= n; r++) { int c = 0; for (int v = 1; v <= n; v++) { int x = v; while (x && x != r) x = pai[x]; if (x == r) c++; } if (c != tam[r]) { puts("TAM DIFERENTE"); return 1; } }
        for (int v = 2; v <= n; v++) if (prof[v] != prof[pai[v]] + 1) { puts("PROF DIFERENTE"); return 1; }
    }
    puts("enraiza: estresse ok");
}
