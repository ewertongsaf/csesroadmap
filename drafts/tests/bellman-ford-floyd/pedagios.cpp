#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;
    vector<int> de(m), para(m);
    vector<long long> custo(m);
    for (int i = 0; i < m; i++) cin >> de[i] >> para[i] >> custo[i];   // estrada de mão única

    const long long INF = 1e18;
    vector<long long> dist(n + 1, INF);
    dist[1] = 0;
    bool mudou = false;
    for (int rodada = 1; rodada <= n; rodada++) {          // n rodadas: a última só serve de teste
        mudou = false;
        for (int i = 0; i < m; i++) {
            if (dist[de[i]] == INF) continue;              // ainda não sei chegar à origem da estrada
            if (dist[de[i]] + custo[i] < dist[para[i]]) {  // relaxa a estrada i
                dist[para[i]] = dist[de[i]] + custo[i];
                mudou = true;
            }
        }
        if (!mudou) break;                                 // rodada sem melhora: terminou
    }

    if (mudou) {                                           // a rodada n ainda melhorou alguém
        cout << "CICLO NEGATIVO\n";
        return 0;
    }
    for (int u = 1; u <= n; u++) {
        if (dist[u] == INF) cout << "x";
        else cout << dist[u];
        cout << " \n"[u == n];
    }
}
