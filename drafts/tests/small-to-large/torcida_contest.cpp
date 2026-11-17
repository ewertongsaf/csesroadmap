#include <bits/stdc++.h>
using namespace std;
typedef vector<int> vi;
#define rep(i,a,b) for(int i=(a);i<(b);i++)
void fastio(){ ios::sync_with_stdio(false); cin.tie(nullptr); }

int main(){
    fastio();
    int n; cin >> n;
    vi c(n + 1); rep(v,1,n+1) cin >> c[v];
    vector<vi> ch(n + 1); rep(v,2,n+1) { int p; cin >> p; ch[p].push_back(v); }
    vector<map<int,int>> cnt(n + 1); vi bt(n + 1, 0), bq(n + 1, 0), id(n + 1), r(n + 1);
    auto put = [&](int m, int t, int q) { int x = (cnt[m][t] += q); if (x > bq[m] || (x == bq[m] && t < bt[m])) bq[m] = x, bt[m] = t; };
    auto dfs = [&](auto& self, int v) -> void {
        id[v] = v; put(v, c[v], 1);
        for (int u : ch[v]) {
            self(self, u);
            int a = id[v], b = id[u];
            if (cnt[a].size() < cnt[b].size()) swap(a, b);
            for (auto [t, q] : cnt[b]) put(a, t, q);
            cnt[b].clear(); id[v] = a;
        }
        r[v] = bt[id[v]];
    };
    dfs(dfs, 1);
    rep(v,1,n+1) cout << r[v] << (v < n ? ' ' : '\n');
}
