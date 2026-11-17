#include <bits/stdc++.h>
using namespace std;
typedef vector<int> vi;
#define rep(i,a,b) for(int i=(a);i<(b);i++)
void fastio(){ ios::sync_with_stdio(false); cin.tie(nullptr); }

int n;
vi t;
void upd(int k, int x, int no, int l, int r) {
    if (l == r) { t[no] = x; return; }
    int m = (l + r) / 2;
    if (k <= m) upd(k, x, 2*no, l, m); else upd(k, x, 2*no+1, m+1, r);
    t[no] = max(t[2*no], t[2*no+1]);
}
int qry(int a, int b, int no, int l, int r) {
    if (b < l || r < a) return 0;
    if (a <= l && r <= b) return t[no];
    int m = (l + r) / 2;
    return max(qry(a, b, 2*no, l, m), qry(a, b, 2*no+1, m+1, r));
}

int main(){
    fastio();
    int q; cin >> n >> q;
    vector<vector<pair<int,int>>> adj(n + 1); vi c(n);
    rep(i,1,n) { int a, b; cin >> a >> b >> c[i]; adj[a].push_back({b, i}); adj[b].push_back({a, i}); }
    vi par(n + 1), dep(n + 1), sz(n + 1), hv(n + 1, 0), hd(n + 1), ps(n + 1), up(n + 1), low(n);
    auto d1 = [&](auto& self, int v, int p) -> void {
        par[v] = p; sz[v] = 1;
        for (auto [u, id] : adj[v]) if (u != p) { dep[u] = dep[v] + 1; up[u] = id; self(self, u, v); sz[v] += sz[u]; if (!hv[v] || sz[u] > sz[hv[v]]) hv[v] = u; }
    };
    int cur = 0;
    auto d2 = [&](auto& self, int v, int h) -> void {
        hd[v] = h; ps[v] = ++cur;
        if (hv[v]) self(self, hv[v], h);
        for (auto [u, id] : adj[v]) if (u != par[v] && u != hv[v]) self(self, u, u);
    };
    d1(d1, 1, 0); d2(d2, 1, 1);
    t.assign(4 * n, 0);
    rep(v,2,n+1) { upd(ps[v], c[up[v]], 1, 1, n); low[up[v]] = v; }
    auto path = [&](int a, int b) {
        int r = 0;
        for (; hd[a] != hd[b]; a = par[hd[a]]) {
            if (dep[hd[a]] < dep[hd[b]]) swap(a, b);
            r = max(r, qry(ps[hd[a]], ps[a], 1, 1, n));
        }
        if (dep[a] > dep[b]) swap(a, b);
        if (a != b) r = max(r, qry(ps[a] + 1, ps[b], 1, 1, n));
        return r;
    };
    while (q--) {
        char tp; int x, y; cin >> tp >> x >> y;
        if (tp == 'M') upd(ps[low[x]], y, 1, 1, n);
        else cout << path(x, y) << "\n";
    }
}
