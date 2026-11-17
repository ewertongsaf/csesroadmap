// Força bruta: vetor comum, soma com laço.
#include <bits/stdc++.h>
using namespace std;
int main() { int n, q; cin >> n >> q; vector<long long> a(n + 1); for (int i = 1; i <= n; i++) cin >> a[i];
    while (q--) { char t; cin >> t; if (t == 'A') { int k; long long x; cin >> k >> x; a[k] += x; } else { int l, r; cin >> l >> r; long long s = 0; for (int i = l; i <= r; i++) s += a[i]; cout << s << "\n"; } } }
