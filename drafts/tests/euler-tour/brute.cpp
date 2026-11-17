// Força bruta: o bônus percorre a equipe inteira (subindo de cada funcionário até ver se v é chefe dele).
#include <bits/stdc++.h>
using namespace std;
int main() { int n, q; cin >> n >> q; vector<long long> s(n + 1); for (int v = 1; v <= n; v++) cin >> s[v]; vector<int> p(n + 1, 0); for (int v = 2; v <= n; v++) cin >> p[v];
    while (q--) { char c; int v; cin >> c >> v; if (c == 'B') { long long x; cin >> x; for (int u = 1; u <= n; u++) { int a = u; while (a && a != v) a = p[a]; if (a == v) s[u] += x; } } else cout << s[v] << "\n"; } }
