#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
typedef vector<ll> vl;
#define rep(i,a,b) for(int i=(a);i<(b);i++)
void fastio(){ ios::sync_with_stdio(false); cin.tie(nullptr); }

int main(){
    fastio();
    int n; cin >> n;
    vl p(n + 1); ll tot = 0;
    rep(v,1,n+1) { cin >> p[v]; tot += p[v]; }
    vector<vector<pair<int,int>>> adj(n + 1);
    rep(i,0,n-1) { int a, b, w; cin >> a >> b >> w; adj[a].push_back({b, w}); adj[b].push_back({a, w}); }
    vl P(n + 1), C(n + 1), r(n + 1);
    auto down = [&](auto& self, int v, int pa) -> void {
        P[v] = p[v];
        for (auto [u, w] : adj[v]) if (u != pa) { self(self, u, v); P[v] += P[u]; C[v] += C[u] + P[u] * w; }
    };
    auto up = [&](auto& self, int v, int pa) -> void {
        for (auto [u, w] : adj[v]) if (u != pa) { r[u] = r[v] + (tot - 2 * P[u]) * w; self(self, u, v); }
    };
    down(down, 1, 0); r[1] = C[1]; up(up, 1, 0);
    rep(v,1,n+1) cout << r[v] << (v < n ? ' ' : '\n');
}
