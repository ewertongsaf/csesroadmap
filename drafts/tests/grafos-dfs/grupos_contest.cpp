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

    vector<bool> vis(n + 1, false);
    // lambda recursiva: recebe a si mesma como parâmetro para poder se chamar
    auto dfs = [&](auto&& self, int u) -> int {
        vis[u] = true;
        int t = 1;
        for (int v : viz[u]) if (!vis[v]) t += self(self, v);
        return t;
    };
    int grupos = 0, maior = 0;
    rep(u, 1, n + 1) if (!vis[u]) { grupos++; maior = max(maior, dfs(dfs, u)); }
    cout << grupos << " " << maior << "\n";
}
