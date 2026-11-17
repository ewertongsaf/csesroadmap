// Força bruta: percorre o trecho contando a subida atual.
#include <bits/stdc++.h>
using namespace std;
int main() { int n, q; cin >> n >> q; vector<int> t(n + 1); for (int i = 1; i <= n; i++) cin >> t[i];
    while (q--) { char c; int x, y; cin >> c >> x >> y;
        if (c == 'M') t[x] = y;
        else { int best = 1, cur = 1; for (int i = x + 1; i <= y; i++) { cur = (t[i - 1] < t[i]) ? cur + 1 : 1; best = max(best, cur); } cout << best << "\n"; } } }
