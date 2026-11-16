#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
typedef pair<ll,ll> pll;
#define rep(i,a,b) for(int i=(a);i<(b);i++)
#define pb push_back
void fastio(){ ios::sync_with_stdio(false); cin.tie(nullptr); }

int main(){
    fastio();
    int n, m; cin >> n >> m;
    vector<vector<pll>> viz(n + 1);            // (vizinho, peso)
    rep(i, 0, m) { ll a, b, t; cin >> a >> b >> t; viz[a].pb({b, t}); viz[b].pb({a, t}); }

    const ll INF = 1e18;
    vector<ll> dist(n + 1, INF);
    priority_queue<pll, vector<pll>, greater<pll>> pq;   // (distância, vértice)
    dist[1] = 0; pq.push({0, 1});
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;
        for (auto [v, t] : viz[u]) if (d + t < dist[v]) { dist[v] = d + t; pq.push({dist[v], v}); }
    }
    rep(u, 1, n + 1) cout << (dist[u] == INF ? -1 : dist[u]) << " \n"[u == n];
}
