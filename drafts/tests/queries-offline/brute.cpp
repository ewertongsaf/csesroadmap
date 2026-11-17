// Força bruta: percorre o trecho de cada pergunta.
#include <bits/stdc++.h>
using namespace std;
int main() { int n, q; cin >> n >> q; vector<long long> p(n + 1); for (int i = 1; i <= n; i++) cin >> p[i];
    while (q--) { int a, b; long long x; cin >> a >> b >> x; long long s = 0; for (int i = a; i <= b; i++) if (p[i] <= x) s += p[i]; cout << s << "\n"; } }
