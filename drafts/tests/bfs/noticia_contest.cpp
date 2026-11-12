#include <bits/stdc++.h>
using namespace std;
typedef vector<int> vi;
typedef vector<vi> vvi;
#define rep(i,a,b) for(int i=(a);i<(b);i++)
#define pb push_back
void fastio(){ ios::sync_with_stdio(false); cin.tie(nullptr); }

int main(){
    fastio();
    int n, m; cin >> n >> m;
    vvi viz(n + 1);
    rep(i, 0, m) { int a, b; cin >> a >> b; viz[a].pb(b); viz[b].pb(a); }

    vi dist(n + 1, -1);
    queue<int> q;
    dist[1] = 0; q.push(1);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : viz[u]) if (dist[v] == -1) { dist[v] = dist[u] + 1; q.push(v); }
    }
    rep(u, 1, n + 1) cout << dist[u] << " \n"[u == n];
}
