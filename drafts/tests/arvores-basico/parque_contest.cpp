#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
typedef vector<ll> vl;
#define rep(i,a,b) for(int i=(a);i<(b);i++)
void fastio(){ ios::sync_with_stdio(false); cin.tie(nullptr); }

int main(){
    fastio();
    int n; cin >> n;
    vector<vector<pair<int,int>>> adj(n + 1);
    rep(i,0,n-1) { int a, b, w; cin >> a >> b >> w; adj[a].push_back({b, w}); adj[b].push_back({a, w}); }
    auto dists = [&](int s) {
        vl d(n + 1, 0);
        auto dfs = [&](auto& self, int v, int p) -> void {
            for (auto [u, w] : adj[v]) if (u != p) { d[u] = d[v] + w; self(self, u, v); }
        };
        dfs(dfs, s, 0);
        return d;
    };
    auto far = [&](const vl& d) { return int(max_element(d.begin() + 1, d.end()) - d.begin()); };
    vl d1 = dists(1); int A = far(d1);
    vl dA = dists(A); int B = far(dA);
    vl dB = dists(B);
    int c = 1;
    rep(v,1,n+1) if (max(dA[v], dB[v]) < max(dA[c], dB[c])) c = v;
    cout << dA[B] << " " << c << " " << max(dA[c], dB[c]) << "\n";
}
