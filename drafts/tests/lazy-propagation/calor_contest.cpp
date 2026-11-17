#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
typedef vector<ll> vl;
#define rep(i,a,b) for(int i=(a);i<(b);i++)
void fastio(){ ios::sync_with_stdio(false); cin.tie(nullptr); }

struct Lazy {
    int n; vl t, lz;
    Lazy(const vl& v) : n(v.size() - 1), t(4 * v.size()), lz(4 * v.size(), 0) { build(1, 1, n, v); }
    void build(int no, int l, int r, const vl& v) {
        if (l == r) { t[no] = v[l]; return; }
        int m = (l + r) / 2;
        build(2*no, l, m, v); build(2*no+1, m+1, r, v);
        t[no] = max(t[2*no], t[2*no+1]);
    }
    void app(int no, ll x) { t[no] += x; lz[no] += x; }
    void push(int no) { if (lz[no]) { app(2*no, lz[no]); app(2*no+1, lz[no]); lz[no] = 0; } }
    void add(int a, int b, ll x, int no, int l, int r) {
        if (b < l || r < a) return;
        if (a <= l && r <= b) { app(no, x); return; }
        push(no);
        int m = (l + r) / 2;
        add(a, b, x, 2*no, l, m); add(a, b, x, 2*no+1, m+1, r);
        t[no] = max(t[2*no], t[2*no+1]);
    }
    ll qry(int a, int b, int no, int l, int r) {
        if (b < l || r < a) return LLONG_MIN;
        if (a <= l && r <= b) return t[no];
        push(no);
        int m = (l + r) / 2;
        return max(qry(a, b, 2*no, l, m), qry(a, b, 2*no+1, m+1, r));
    }
    void add(int a, int b, ll x) { add(a, b, x, 1, 1, n); }
    ll qry(int a, int b) { return qry(a, b, 1, 1, n); }
};

int main(){
    fastio();
    int n, q; cin >> n >> q;
    vl v(n + 1);
    rep(i,1,n+1) cin >> v[i];
    Lazy s(v);
    while (q--) {
        char c; int a, b; cin >> c >> a >> b;
        if (c == 'S') { ll x; cin >> x; s.add(a, b, x); }
        else cout << s.qry(a, b) << "\n";
    }
}
