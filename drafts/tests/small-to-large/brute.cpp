// Força bruta: para cada funcionário, conta os times da equipe inteira.
#include <bits/stdc++.h>
using namespace std;
int main() { int n; cin >> n; vector<int> c(n + 1), p(n + 1, 0); for (int v = 1; v <= n; v++) cin >> c[v]; for (int v = 2; v <= n; v++) cin >> p[v];
    for (int v = 1; v <= n; v++) { map<int,int> m; for (int u = 1; u <= n; u++) { int a = u; while (a && a != v) a = p[a]; if (a == v) m[c[u]]++; }
        int bt = 0, bq = 0; for (auto [t, q] : m) if (q > bq) { bq = q; bt = t; } cout << bt << (v < n ? " " : "\n"); } }
