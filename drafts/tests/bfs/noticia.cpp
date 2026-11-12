#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;
    vector<vector<int>> viz(n + 1);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        viz[a].push_back(b);
        viz[b].push_back(a);
    }

    // minuto[u] = em que minuto u fica sabendo; -1 = ainda não sabe
    vector<int> minuto(n + 1, -1);
    queue<int> fila;
    minuto[1] = 0;                             // a pessoa 1 sabe desde o minuto 0
    fila.push(1);
    while (!fila.empty()) {
        int u = fila.front();                  // quem está esperando há mais tempo
        fila.pop();
        for (int v : viz[u]) {
            if (minuto[v] == -1) {             // v ainda não sabia
                minuto[v] = minuto[u] + 1;     // fica sabendo um minuto depois de u
                fila.push(v);                  // e entra na fila para contar aos amigos
            }
        }
    }
    for (int u = 1; u <= n; u++) cout << minuto[u] << " \n"[u == n];
}
