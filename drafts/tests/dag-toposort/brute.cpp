#include <bits/stdc++.h>
using namespace std;
// Força bruta: ciclo = alguma tarefa alcança a si mesma (fecho por três laços); senão, fim por recursão direta sem memória.
int n, m; vector<long long> dur; vector<vector<int>> antes;
long long fim(int u) { long long ini = 0; for (int p : antes[u]) ini = max(ini, fim(p)); return ini + dur[u]; }
int main() {
    cin >> n >> m; dur.assign(n + 1, 0); for (int u = 1; u <= n; u++) cin >> dur[u];
    antes.assign(n + 1, {}); vector<vector<bool>> r(n + 1, vector<bool>(n + 1, false));
    for (int i = 0; i < m; i++) { int a, b; cin >> a >> b; antes[b].push_back(a); r[a][b] = true; }
    for (int k = 1; k <= n; k++) for (int i = 1; i <= n; i++) for (int j = 1; j <= n; j++) if (r[i][k] && r[k][j]) r[i][j] = true;
    for (int i = 1; i <= n; i++) if (r[i][i]) { cout << "IMPOSSIVEL\n"; return 0; }
    long long total = 0; for (int u = 1; u <= n; u++) total = max(total, fim(u));
    cout << total << "\n";
}
