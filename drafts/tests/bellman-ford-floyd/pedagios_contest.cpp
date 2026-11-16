#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
#define rep(i,a,b) for(int i=(a);i<(b);i++)
void fastio(){ ios::sync_with_stdio(false); cin.tie(nullptr); }

int main(){
    fastio();
    int n, m; cin >> n >> m;
    vector<array<ll, 3>> es(m);                // {de, para, custo}
    for (auto& e : es) cin >> e[0] >> e[1] >> e[2];

    const ll INF = 1e18;
    vector<ll> dist(n + 1, INF);
    dist[1] = 0;
    bool mudou = false;
    rep(rodada, 0, n) {
        mudou = false;
        for (auto& [a, b, w] : es) if (dist[a] != INF && dist[a] + w < dist[b]) { dist[b] = dist[a] + w; mudou = true; }
        if (!mudou) break;
    }
    if (mudou) { cout << "CICLO NEGATIVO\n"; return 0; }
    rep(u, 1, n + 1) { if (dist[u] == INF) cout << "x"; else cout << dist[u]; cout << " \n"[u == n]; }
}
