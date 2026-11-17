// Força bruta: uma busca a partir de cada clareira.
#include <bits/stdc++.h>
using namespace std;
int main() { int n; cin >> n; vector<vector<pair<int,int>>> adj(n + 1);
    for (int i = 0; i < n - 1; i++) { int a, b, w; cin >> a >> b >> w; adj[a].push_back({b, w}); adj[b].push_back({a, w}); }
    long long diam = 0, melhor = LLONG_MAX; int centro = 1;
    for (int s = 1; s <= n; s++) { vector<long long> d(n + 1, -1); d[s] = 0; vector<int> st = {s};
        while (!st.empty()) { int v = st.back(); st.pop_back(); for (auto [u, w] : adj[v]) if (d[u] < 0) { d[u] = d[v] + w; st.push_back(u); } }
        long long e = *max_element(d.begin() + 1, d.end()); diam = max(diam, e); if (e < melhor) { melhor = e; centro = s; } }
    cout << diam << " " << centro << " " << melhor << "\n"; }
