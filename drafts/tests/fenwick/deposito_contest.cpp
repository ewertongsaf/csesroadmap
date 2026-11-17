#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
#define rep(i,a,b) for(int i=(a);i<(b);i++)
void fastio(){ ios::sync_with_stdio(false); cin.tie(nullptr); }

struct BIT {
    int n; vector<ll> t;
    BIT(int n_) : n(n_), t(n_ + 1, 0) {}
    void add(int k, ll x) { for (; k <= n; k += k & -k) t[k] += x; }
    ll sum(int k) { ll s = 0; for (; k > 0; k -= k & -k) s += t[k]; return s; }
    ll sum(int a, int b) { return sum(b) - sum(a - 1); }
};

int main(){
    fastio();
    int n, q; cin >> n >> q;
    BIT f(n);
    rep(i,1,n+1) { ll x; cin >> x; f.add(i, x); }
    while (q--) {
        char t; cin >> t;
        if (t == 'A') { int k; ll x; cin >> k >> x; f.add(k, x); }
        else { int a, b; cin >> a >> b; cout << f.sum(a, b) << "\n"; }
    }
}
