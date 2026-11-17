#include <bits/stdc++.h>
using namespace std;
typedef vector<int> vi;
#define rep(i,a,b) for(int i=(a);i<(b);i++)
void fastio(){ ios::sync_with_stdio(false); cin.tie(nullptr); }
const int INF = 1e9;

int main(){
    fastio();
    int n, q; cin >> n >> q;
    vector<vi> adj(n + 1);
    rep(i,0,n-1) { int a, b; cin >> a >> b; adj[a].push_back(b); adj[b].push_back(a); }
    vector<char> rem(n + 1, 0); vi sz(n + 1), best(n + 1, INF);
    vector<vector<pair<int,int>>> up(n + 1);
    auto calc = [&](auto& self, int v, int p) -> int { sz[v] = 1; for (int u : adj[v]) if (u != p && !rem[u]) sz[v] += self(self, u, v); return sz[v]; };
    auto cen = [&](auto& self, int v, int p, int tot) -> int { for (int u : adj[v]) if (u != p && !rem[u] && sz[u] > tot / 2) return self(self, u, v, tot); return v; };
    auto mark = [&](auto& self, int v, int p, int c, int d) -> void { up[v].push_back({c, d}); for (int u : adj[v]) if (u != p && !rem[u]) self(self, u, v, c, d + 1); };
    auto dec = [&](auto& self, int v) -> void {
        int c = cen(cen, v, 0, calc(calc, v, 0));
        mark(mark, c, 0, c, 0); rem[c] = 1;
        for (int u : adj[c]) if (!rem[u]) self(self, u);
    };
    dec(dec, 1);
    auto open = [&](int v) { for (auto [c, d] : up[v]) best[c] = min(best[c], d); };
    open(1);
    while (q--) {
        char t; int v; cin >> t >> v;
        if (t == 'A') open(v);
        else { int r = INF; for (auto [c, d] : up[v]) r = min(r, d + best[c]); cout << r << "\n"; }
    }
}
