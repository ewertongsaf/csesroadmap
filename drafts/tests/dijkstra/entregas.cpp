#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;
    // viz[u] = lista de pares (vizinho, tempo da estrada)
    vector<vector<pair<int, long long>>> viz(n + 1);
    for (int i = 0; i < m; i++) {
        int a, b;
        long long t;
        cin >> a >> b >> t;
        viz[a].push_back({b, t});
        viz[b].push_back({a, t});              // estrada de mão dupla
    }

    const long long INF = 1e18;                // "ainda não sei chegar"
    vector<long long> dist(n + 1, INF);
    // fila de prioridade de pares (tempo, cidade); com greater, sai primeiro o MENOR tempo
    priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<pair<long long, int>>> fila;
    dist[1] = 0;
    fila.push({0, 1});
    while (!fila.empty()) {
        auto [d, u] = fila.top();
        fila.pop();
        if (d > dist[u]) continue;             // entrada velha: já achei caminho melhor até u
        for (auto [v, t] : viz[u]) {
            if (dist[u] + t < dist[v]) {       // passar por u melhora o tempo até v?
                dist[v] = dist[u] + t;
                fila.push({dist[v], v});
            }
        }
    }
    for (int u = 1; u <= n; u++) cout << (dist[u] == INF ? -1 : dist[u]) << " \n"[u == n];
}
