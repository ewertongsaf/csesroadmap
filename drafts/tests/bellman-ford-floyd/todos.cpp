#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, m, q;
    cin >> n >> m >> q;
    const long long INF = 1e18;
    // d[i][j] = menor custo conhecido de i até j
    vector<vector<long long>> d(n + 1, vector<long long>(n + 1, INF));
    for (int i = 1; i <= n; i++) d[i][i] = 0;              // de uma cidade até ela mesma: 0
    for (int e = 0; e < m; e++) {
        int a, b;
        long long w;
        cin >> a >> b >> w;
        d[a][b] = min(d[a][b], w);                         // pode haver mais de uma estrada no par
    }

    for (int k = 1; k <= n; k++)                           // k POR FORA: a cidade liberada como parada
        for (int i = 1; i <= n; i++)
            for (int j = 1; j <= n; j++)
                if (d[i][k] != INF && d[k][j] != INF)      // só combina trechos que existem
                    d[i][j] = min(d[i][j], d[i][k] + d[k][j]);

    while (q--) {
        int a, b;
        cin >> a >> b;
        if (d[a][b] == INF) cout << "x\n";
        else cout << d[a][b] << "\n";
    }
}
