// Força bruta: uma busca por pergunta.
#include <bits/stdc++.h>
using namespace std;
int main() { int n, q; cin >> n >> q; vector<vector<pair<int,int>>> adj(n + 1);
    for (int i = 0; i < n - 1; i++) { int a, b, w; cin >> a >> b >> w; adj[a].push_back({b, w}); adj[b].push_back({a, w}); }
    while (q--) { int a, b; cin >> a >> b; vector<long long> d(n + 1, -1); d[a] = 0; vector<int> st = {a};
        while (!st.empty()) { int v = st.back(); st.pop_back(); for (auto [u, w] : adj[v]) if (d[u] < 0) { d[u] = d[v] + w; st.push_back(u); } }
        cout << d[b] << "\n"; } }
