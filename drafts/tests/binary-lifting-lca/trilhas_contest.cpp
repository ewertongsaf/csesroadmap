#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
#define rep(i,a,b) for(int i=(a);i<(b);i++)
void fastio(){ ios::sync_with_stdio(false); cin.tie(nullptr); }
const int LOG = 18;

int main(){
    fastio();
    int n, q; cin >> n >> q;
    vector<vector<pair<int,int>>> adj(n + 1);
    rep(i,0,n-1) { int a, b, w; cin >> a >> b >> w; adj[a].push_back({b, w}); adj[b].push_back({a, w}); }
    vector<int> dep(n + 1, 0); vector<ll> d(n + 1, 0);
    vector<array<int, LOG>> up(n + 1);
    auto dfs = [&](auto& self, int v, int p) -> void {
        up[v][0] = p;
        rep(k,1,LOG) up[v][k] = up[up[v][k-1]][k-1];
        for (auto [u, w] : adj[v]) if (u != p) { dep[u] = dep[v] + 1; d[u] = d[v] + w; self(self, u, v); }
    };
    dfs(dfs, 1, 1);
    auto lca = [&](int a, int b) {
        if (dep[a] < dep[b]) swap(a, b);
        rep(k,0,LOG) if ((dep[a] - dep[b]) >> k & 1) a = up[a][k];
        if (a == b) return a;
        for (int k = LOG - 1; k >= 0; k--) if (up[a][k] != up[b][k]) a = up[a][k], b = up[b][k];
        return up[a][0];
    };
    while (q--) { int a, b; cin >> a >> b; cout << d[a] + d[b] - 2 * d[lca(a, b)] << "\n"; }
}
