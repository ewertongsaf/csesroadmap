#include <bits/stdc++.h>
using namespace std;

int n;
vector<long long> pop;                         // moradores de cada clareira
vector<vector<pair<int, int>>> adj;            // (vizinho, comprimento da trilha)
vector<long long> P, C, resp;
long long total = 0;

// Na volta da recursão: P[v] = moradores da subárvore de v; C[v] = custo de todos eles irem até v.
void desce(int v, int pai) {
    P[v] = pop[v];
    C[v] = 0;
    for (auto [u, w] : adj[v]) {
        if (u == pai) continue;
        desce(u, v);
        P[v] += P[u];
        C[v] += C[u] + P[u] * w;               // quem já chegava em u anda mais w até v
    }
}

// Na ida: a resposta do filho sai da resposta do pai.
void sobe(int v, int pai) {
    for (auto [u, w] : adj[v]) {
        if (u == pai) continue;
        resp[u] = resp[v] - P[u] * w + (total - P[u]) * w;   // a subárvore de u chega w mais perto; o resto, w mais longe
        sobe(u, v);
    }
}

int main() {
    cin >> n;
    pop.resize(n + 1);
    adj.resize(n + 1);
    for (int v = 1; v <= n; v++) {
        cin >> pop[v];
        total += pop[v];
    }
    for (int i = 0; i < n - 1; i++) {
        int a, b, w;
        cin >> a >> b >> w;
        adj[a].push_back({b, w});
        adj[b].push_back({a, w});
    }
    P.assign(n + 1, 0);
    C.assign(n + 1, 0);
    resp.assign(n + 1, 0);

    desce(1, 0);
    resp[1] = C[1];                            // com raiz em 1, a subárvore de 1 é todo mundo
    sobe(1, 0);

    for (int v = 1; v <= n; v++) cout << resp[v] << (v < n ? " " : "\n");
}
