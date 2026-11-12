#include <bits/stdc++.h>
using namespace std;
int n, m; vector<vector<long long>> g;
long long go(int i, int j) {     // testa todos os caminhos a partir de (i,j)
    if (i == n - 1 && j == m - 1) return g[i][j];
    long long r = LLONG_MIN;
    if (i + 1 < n) r = max(r, go(i + 1, j));
    if (j + 1 < m) r = max(r, go(i, j + 1));
    return r + g[i][j];
}
int main() { cin >> n >> m; g.assign(n, vector<long long>(m)); for (auto& r : g) for (auto& x : r) cin >> x; cout << go(0, 0) << "\n"; }
