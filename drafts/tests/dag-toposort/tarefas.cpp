#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;
    vector<long long> dur(n + 1);
    for (int u = 1; u <= n; u++) cin >> dur[u];

    vector<vector<int>> depois(n + 1);         // depois[a] = tarefas que só começam quando a termina
    vector<int> faltam(n + 1, 0);              // faltam[b] = quantas dependências de b ainda não terminaram
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;                         // a precisa terminar antes de b começar
        depois[a].push_back(b);
        faltam[b]++;
    }

    vector<long long> inicio(n + 1, 0), fim(n + 1, 0);
    queue<int> fila;
    for (int u = 1; u <= n; u++)
        if (faltam[u] == 0) fila.push(u);      // tarefas sem dependência podem começar já

    int feitas = 0;
    long long total = 0;
    while (!fila.empty()) {
        int u = fila.front();
        fila.pop();
        feitas++;
        fim[u] = inicio[u] + dur[u];           // todas as dependências de u já foram processadas
        total = max(total, fim[u]);
        for (int v : depois[u]) {
            inicio[v] = max(inicio[v], fim[u]);   // v só começa depois que u terminar
            if (--faltam[v] == 0) fila.push(v);   // era a última dependência: v está liberada
        }
    }

    if (feitas < n) cout << "IMPOSSIVEL\n";    // sobrou tarefa: há dependência circular
    else cout << total << "\n";
}
