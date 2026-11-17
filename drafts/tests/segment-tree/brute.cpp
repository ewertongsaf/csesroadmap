// Força bruta: vetor comum, mínimo com laço.
#include <bits/stdc++.h>
using namespace std;
int main() { int n, q; cin >> n >> q; vector<int> a(n + 1); for (int i = 1; i <= n; i++) cin >> a[i];
    while (q--) { char t; int x, y; cin >> t >> x >> y; if (t == 'M') a[x] = y; else cout << *min_element(a.begin() + x, a.begin() + y + 1) << "\n"; } }
