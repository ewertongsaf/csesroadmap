#include <bits/stdc++.h>
using namespace std;
typedef vector<int> vi;
#define rep(i,a,b) for(int i=(a);i<(b);i++)
void fastio(){ ios::sync_with_stdio(false); cin.tie(nullptr); }

struct Seg {
    int n; vi t;
    const int NEUTRO = INT_MAX;
    int junta(int x, int y) { return min(x, y); }
    Seg(const vi& v) : n(v.size() - 1), t(4 * v.size()) { build(1, 1, n, v); }
    void build(int no, int l, int r, const vi& v) {
        if (l == r) { t[no] = v[l]; return; }
        int m = (l + r) / 2;
        build(2*no, l, m, v); build(2*no+1, m+1, r, v);
        t[no] = junta(t[2*no], t[2*no+1]);
    }
    void upd(int k, int x, int no, int l, int r) {
        if (l == r) { t[no] = x; return; }
        int m = (l + r) / 2;
        if (k <= m) upd(k, x, 2*no, l, m); else upd(k, x, 2*no+1, m+1, r);
        t[no] = junta(t[2*no], t[2*no+1]);
    }
    int qry(int a, int b, int no, int l, int r) {
        if (b < l || r < a) return NEUTRO;
        if (a <= l && r <= b) return t[no];
        int m = (l + r) / 2;
        return junta(qry(a, b, 2*no, l, m), qry(a, b, 2*no+1, m+1, r));
    }
    void upd(int k, int x) { upd(k, x, 1, 1, n); }
    int qry(int a, int b) { return qry(a, b, 1, 1, n); }
};

int main(){
    fastio();
    int n, q; cin >> n >> q;
    vi v(n + 1);
    rep(i,1,n+1) cin >> v[i];
    Seg s(v);
    while (q--) {
        char t; int x, y; cin >> t >> x >> y;
        if (t == 'M') s.upd(x, y);
        else cout << s.qry(x, y) << "\n";
    }
}
