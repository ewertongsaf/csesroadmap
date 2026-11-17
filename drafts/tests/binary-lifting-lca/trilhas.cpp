#include <bits/stdc++.h>
using namespace std;

const int LOG = 18;                            // 2^18 > 2·10^5: saltos suficientes para qualquer profundidade
int n;
vector<vector<pair<int, int>>> adj;            // (vizinho, comprimento da trilha)
vector<int> prof;                              // profundidade: quantas trilhas até a raiz
vector<long long> dist;                        // distância (somando comprimentos) até a raiz
vector<array<int, LOG>> up;                    // up[v][k] = ancestral de v 2^k passos acima

void dfs(int v, int pai) {
    up[v][0] = pai;
    for (int k = 1; k < LOG; k++) up[v][k] = up[up[v][k - 1]][k - 1];   // 2^k = 2^(k-1) + 2^(k-1)
    for (auto [u, w] : adj[v]) {
        if (u == pai) continue;
        prof[u] = prof[v] + 1;
        dist[u] = dist[v] + w;
        dfs(u, v);
    }
}

// Sobe k passos a partir de v, usando os bits de k.
int sobe(int v, int k) {
    for (int b = 0; b < LOG; b++)
        if (k >> b & 1) v = up[v][b];          // o bit b de k está ligado: pula 2^b
    return v;
}

int lca(int a, int b) {
    if (prof[a] < prof[b]) swap(a, b);         // a é o mais fundo
    a = sobe(a, prof[a] - prof[b]);            // agora os dois estão na mesma profundidade
    if (a == b) return a;
    for (int k = LOG - 1; k >= 0; k--) {       // do maior salto para o menor
        if (up[a][k] != up[b][k]) {            // ainda não se encontraram: pode pular
            a = up[a][k];
            b = up[b][k];
        }
    }
    return up[a][0];                           // um passo abaixo do encontro: o pai é o LCA
}

int main() {
    int q;
    cin >> n >> q;
    adj.resize(n + 1);
    for (int i = 0; i < n - 1; i++) {
        int a, b, w;
        cin >> a >> b >> w;
        adj[a].push_back({b, w});
        adj[b].push_back({a, w});
    }
    prof.assign(n + 1, 0);
    dist.assign(n + 1, 0);
    up.assign(n + 1, {});
    dfs(1, 1);                                 // a raiz é pai de si mesma: saltos além dela param nela

    while (q--) {
        int a, b;
        cin >> a >> b;
        int c = lca(a, b);
        cout << dist[a] + dist[b] - 2 * dist[c] << "\n";
    }
}
