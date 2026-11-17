// Força bruta: encaminha a carta um passo por vez (k pequeno nos testes aleatórios).
#include <bits/stdc++.h>
using namespace std;
int main() { int n, q; cin >> n >> q; vector<int> s(n + 1); vector<long long> c(n + 1); for (int v = 1; v <= n; v++) cin >> s[v]; for (int v = 1; v <= n; v++) cin >> c[v];
    while (q--) { int x; long long k; cin >> x >> k; long long p = 0; while (k--) { p += c[x]; x = s[x]; } cout << x << " " << p << "\n"; } }
