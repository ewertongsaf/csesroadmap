#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
typedef vector<int> vi;
#define rep(i,a,b) for(int i=(a);i<(b);i++)
void fastio(){ ios::sync_with_stdio(false); cin.tie(nullptr); }

int main(){
    fastio();
    int n, q; cin >> n >> q;
    vector<ll> sal(n + 1);
    rep(v,1,n+1) cin >> sal[v];
    vector<vi> ch(n + 1);
    rep(v,2,n+1) { int p; cin >> p; ch[p].push_back(v); }
    vi in(n + 1), out(n + 1); int t = 0;
    auto dfs = [&](auto& self, int v) -> void { in[v] = ++t; for (int u : ch[v]) self(self, u); out[v] = t; };
    dfs(dfs, 1);
    vector<ll> f(n + 2, 0);
    auto add = [&](int k, ll x) { for (; k <= n; k += k & -k) f[k] += x; };
    auto sum = [&](int k) { ll s = 0; for (; k > 0; k -= k & -k) s += f[k]; return s; };
    while (q--) {
        char c; int v; cin >> c >> v;
        if (c == 'B') { ll x; cin >> x; add(in[v], x); add(out[v] + 1, -x); }
        else cout << sal[v] + sum(in[v]) << "\n";
    }
}
