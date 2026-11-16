#include <bits/stdc++.h>
using namespace std;
int main() {   // força bruta: uma busca no grafo a cada pergunta
    int n, q; cin >> n >> q; vector<vector<int>> viz(n + 1);
    while (q--) { char t; int a, b; cin >> t >> a >> b;
        if (t == 'L') { viz[a].push_back(b); viz[b].push_back(a); }
        else { vector<bool> vis(n + 1, false); vector<int> st = {a}; vis[a] = true; while (!st.empty()) { int u = st.back(); st.pop_back(); for (int v : viz[u]) if (!vis[v]) { vis[v] = true; st.push_back(v); } } cout << (vis[b] ? "SIM" : "NAO") << "\n"; } }
}
