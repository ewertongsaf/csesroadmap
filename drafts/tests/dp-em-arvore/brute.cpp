// Força bruta: uma busca a partir de cada clareira.
#include <bits/stdc++.h>
using namespace std;
int main() { int n; cin >> n; vector<long long> p(n + 1); for (int v = 1; v <= n; v++) cin >> p[v];
    vector<vector<pair<int,int>>> adj(n + 1); for (int i = 0; i < n - 1; i++) { int a, b, w; cin >> a >> b >> w; adj[a].push_back({b, w}); adj[b].push_back({a, w}); }
    for (int s = 1; s <= n; s++) { vector<long long> d(n + 1, -1); d[s] = 0; vector<int> st = {s};
        while (!st.empty()) { int v = st.back(); st.pop_back(); for (auto [u, w] : adj[v]) if (d[u] < 0) { d[u] = d[v] + w; st.push_back(u); } }
        long long c = 0; for (int v = 1; v <= n; v++) c += p[v] * d[v]; cout << c << (s < n ? " " : "\n"); } }
