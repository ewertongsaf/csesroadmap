#include <bits/stdc++.h>
using namespace std;
int main() {   // alcance por força bruta: repete "se a alcança b e b alcança c, então a alcança c" até estabilizar
    int n, m; cin >> n >> m; vector<vector<bool>> r(n + 1, vector<bool>(n + 1, false));
    for (int i = 1; i <= n; i++) r[i][i] = true;
    for (int i = 0; i < m; i++) { int a, b; cin >> a >> b; r[a][b] = r[b][a] = true; }
    for (int k = 1; k <= n; k++) for (int i = 1; i <= n; i++) for (int j = 1; j <= n; j++) if (r[i][k] && r[k][j]) r[i][j] = true;
    int grupos = 0, maior = 0;
    for (int i = 1; i <= n; i++) { int t = 0; bool primeiro = true; for (int j = 1; j <= n; j++) if (r[i][j]) { t++; if (j < i) primeiro = false; } if (primeiro) grupos++; maior = max(maior, t); }
    cout << grupos << " " << maior << "\n";
}
