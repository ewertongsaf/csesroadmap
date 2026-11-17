// Força bruta: busca o caminho a cada pergunta e olha todas as trilhas dele.
#include <bits/stdc++.h>
using namespace std;
int main() { int n, q; cin >> n >> q; vector<vector<pair<int,int>>> adj(n + 1); vector<int> c(n);
    for (int i = 1; i < n; i++) { int a, b; cin >> a >> b >> c[i]; adj[a].push_back({b, i}); adj[b].push_back({a, i}); }
    while (q--) { char t; int x, y; cin >> t >> x >> y; if (t == 'M') { c[x] = y; continue; }
        vector<int> best(n + 1, -1); best[x] = 0; vector<int> st = {x};
        while (!st.empty()) { int v = st.back(); st.pop_back(); for (auto [u, id] : adj[v]) if (best[u] < 0) { best[u] = max(best[v], c[id]); st.push_back(u); } }
        cout << best[y] << "\n"; } }
