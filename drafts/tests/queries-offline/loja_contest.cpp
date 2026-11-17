#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
#define rep(i,a,b) for(int i=(a);i<(b);i++)
#define all(x) (x).begin(),(x).end()
#define sz(x) (int)(x).size()
void fastio(){ ios::sync_with_stdio(false); cin.tie(nullptr); }

struct BIT {
    int n; vector<ll> t;
    BIT(int n_) : n(n_), t(n_ + 1, 0) {}
    void add(int k, ll x) { for (; k <= n; k += k & -k) t[k] += x; }
    ll sum(int k) { ll s = 0; for (; k > 0; k -= k & -k) s += t[k]; return s; }
};

int main(){
    fastio();
    int n, q; cin >> n >> q;
    vector<pair<int,int>> it(n);
    rep(i,0,n) { cin >> it[i].first; it[i].second = i + 1; }
    vector<array<int,4>> qs(q);                // {x, a, b, id}
    rep(j,0,q) { cin >> qs[j][1] >> qs[j][2] >> qs[j][0]; qs[j][3] = j; }
    sort(all(it)); sort(all(qs));
    BIT f(n);
    vector<ll> resp(q);
    int p = 0;
    for (auto& [x, a, b, id] : qs) {
        while (p < n && it[p].first <= x) { f.add(it[p].second, it[p].first); p++; }
        resp[id] = f.sum(b) - f.sum(a - 1);
    }
    for (ll r : resp) cout << r << "\n";
}
