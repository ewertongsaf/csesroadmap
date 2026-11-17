// Força bruta: soma e máximo com laços.
#include <bits/stdc++.h>
using namespace std;
int main() { int n, q; cin >> n >> q; vector<long long> t(n + 1); for (int i = 1; i <= n; i++) cin >> t[i];
    while (q--) { char c; int a, b; cin >> c >> a >> b; if (c == 'S') { long long x; cin >> x; for (int i = a; i <= b; i++) t[i] += x; } else cout << *max_element(t.begin() + a, t.begin() + b + 1) << "\n"; } }
