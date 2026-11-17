// Força bruta para o placar: vetor ordenado sem repetição.
#include <bits/stdc++.h>
using namespace std;
int main() { int q; cin >> q; vector<int> v;
    while (q--) { char t; int x; cin >> t >> x;
        if (t == 'I') { if (find(v.begin(), v.end(), x) == v.end()) { v.push_back(x); sort(v.begin(), v.end()); } }
        else if (t == 'R') { auto it = find(v.begin(), v.end(), x); if (it != v.end()) v.erase(it); }
        else if (t == 'K') cout << v[x - 1] << "\n";
        else { int c = 0; for (int y : v) if (y < x) c++; cout << c << "\n"; } } }
