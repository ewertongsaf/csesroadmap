// Força bruta: BFS a partir de v até achar um posto aberto.
#include <bits/stdc++.h>
using namespace std;
int main() { int n, q; cin >> n >> q; vector<vector<int>> adj(n + 1); for (int i = 0; i < n - 1; i++) { int a, b; cin >> a >> b; adj[a].push_back(b); adj[b].push_back(a); }
    vector<bool> aberto(n + 1, false); aberto[1] = true;
    while (q--) { char t; int v; cin >> t >> v; if (t == 'A') { aberto[v] = true; continue; }
        vector<int> d(n + 1, -1); d[v] = 0; deque<int> fila = {v}; int r = -1;
        while (!fila.empty()) { int x = fila.front(); fila.pop_front(); if (aberto[x]) { r = d[x]; break; } for (int u : adj[x]) if (d[u] < 0) { d[u] = d[x] + 1; fila.push_back(u); } }
        cout << r << "\n"; } }
