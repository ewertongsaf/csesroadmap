#include <bits/stdc++.h>
using namespace std;
int main() {   // força bruta: tenta melhorar por toda estrada, repetidamente, até nada mudar
    int n, m; cin >> n >> m; vector<array<long long, 3>> es(m); for (auto& e : es) cin >> e[0] >> e[1] >> e[2];
    const long long INF = 1e18; vector<long long> d(n + 1, INF); d[1] = 0;
    bool mud = true;
    while (mud) { mud = false; for (auto& e : es) { if (d[e[0]] + e[2] < d[e[1]]) { d[e[1]] = d[e[0]] + e[2]; mud = true; } if (d[e[1]] + e[2] < d[e[0]]) { d[e[0]] = d[e[1]] + e[2]; mud = true; } } }
    for (int u = 1; u <= n; u++) cout << (d[u] == INF ? -1 : d[u]) << " \n"[u == n];
}
