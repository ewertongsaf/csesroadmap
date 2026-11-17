#include <bits/stdc++.h>
using namespace std;
typedef vector<int> vi;
#define rep(i,a,b) for(int i=(a);i<(b);i++)
void fastio(){ ios::sync_with_stdio(false); cin.tie(nullptr); }

struct No { int tam, pre, suf, best, ini, fim; };
No folha(int t) { return {1, 1, 1, 1, t, t}; }
No junta(const No& A, const No& B) {
    bool liga = A.fim < B.ini;
    return { A.tam + B.tam,
             (A.pre == A.tam && liga) ? A.tam + B.pre : A.pre,
             (B.suf == B.tam && liga) ? B.tam + A.suf : B.suf,
             max({A.best, B.best, liga ? A.suf + B.pre : 0}),
             A.ini, B.fim };
}

struct Seg {
    int n; vector<No> t;
    Seg(const vi& v) : n(v.size() - 1), t(4 * v.size()) { build(1, 1, n, v); }
    void build(int no, int l, int r, const vi& v) {
        if (l == r) { t[no] = folha(v[l]); return; }
        int m = (l + r) / 2;
        build(2*no, l, m, v); build(2*no+1, m+1, r, v);
        t[no] = junta(t[2*no], t[2*no+1]);
    }
    void upd(int k, int x, int no, int l, int r) {
        if (l == r) { t[no] = folha(x); return; }
        int m = (l + r) / 2;
        if (k <= m) upd(k, x, 2*no, l, m); else upd(k, x, 2*no+1, m+1, r);
        t[no] = junta(t[2*no], t[2*no+1]);
    }
    No qry(int a, int b, int no, int l, int r) {
        if (a <= l && r <= b) return t[no];
        int m = (l + r) / 2;
        if (b <= m) return qry(a, b, 2*no, l, m);
        if (a > m) return qry(a, b, 2*no+1, m+1, r);
        return junta(qry(a, b, 2*no, l, m), qry(a, b, 2*no+1, m+1, r));
    }
    void upd(int k, int x) { upd(k, x, 1, 1, n); }
    No qry(int a, int b) { return qry(a, b, 1, 1, n); }
};

int main(){
    fastio();
    int n, q; cin >> n >> q;
    vi v(n + 1);
    rep(i,1,n+1) cin >> v[i];
    Seg s(v);
    while (q--) {
        char c; int x, y; cin >> c >> x >> y;
        if (c == 'M') s.upd(x, y);
        else cout << s.qry(x, y).best << "\n";
    }
}
