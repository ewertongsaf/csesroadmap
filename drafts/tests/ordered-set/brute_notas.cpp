// Força bruta para as notas: multiset.
#include <bits/stdc++.h>
using namespace std;
int main() { int m, q; cin >> m >> q; multiset<int> s;
    while (q--) { char t; int x; cin >> t >> x;
        if (t == 'I') s.insert(x);
        else if (t == 'R') { auto it = s.find(x); if (it != s.end()) s.erase(it); }
        else if (t == 'K') { auto it = s.begin(); advance(it, x - 1); cout << *it << "\n"; }
        else { int c = 0; for (int y : s) if (y < x) c++; cout << c << "\n"; } } }
