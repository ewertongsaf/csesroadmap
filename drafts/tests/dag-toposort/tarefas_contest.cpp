#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
typedef vector<int> vi;
typedef vector<vi> vvi;
#define rep(i,a,b) for(int i=(a);i<(b);i++)
#define pb push_back
void fastio(){ ios::sync_with_stdio(false); cin.tie(nullptr); }

int main(){
    fastio();
    int n, m; cin >> n >> m;
    vector<ll> dur(n + 1), fim(n + 1, 0);
    rep(u, 1, n + 1) cin >> dur[u];
    vvi adj(n + 1); vi grau(n + 1, 0);
    rep(i, 0, m) { int a, b; cin >> a >> b; adj[a].pb(b); grau[b]++; }

    queue<int> q;
    rep(u, 1, n + 1) if (!grau[u]) q.push(u);
    int feitas = 0; ll total = 0;
    while (!q.empty()) {
        int u = q.front(); q.pop(); feitas++;
        fim[u] += dur[u];                      // até aqui, fim[u] guardava o início de u
        total = max(total, fim[u]);
        for (int v : adj[u]) { fim[v] = max(fim[v], fim[u]); if (--grau[v] == 0) q.push(v); }
    }
    if (feitas < n) cout << "IMPOSSIVEL\n"; else cout << total << "\n";
}
