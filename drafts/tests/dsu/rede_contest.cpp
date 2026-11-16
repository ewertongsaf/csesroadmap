#include <bits/stdc++.h>
using namespace std;
typedef vector<int> vi;
void fastio(){ ios::sync_with_stdio(false); cin.tie(nullptr); }

struct DSU {
    vi pai, tam;
    int grupos;
    DSU(int n) : pai(n + 1), tam(n + 1, 1), grupos(n) { iota(pai.begin(), pai.end(), 0); }
    int acha(int x) { return pai[x] == x ? x : pai[x] = acha(pai[x]); }
    bool une(int a, int b) {
        a = acha(a); b = acha(b);
        if (a == b) return false;
        if (tam[a] < tam[b]) swap(a, b);
        pai[b] = a; tam[a] += tam[b]; grupos--;
        return true;
    }
};

int main(){
    fastio();
    int n, q; cin >> n >> q;
    DSU d(n);
    while (q--) {
        char t; int a, b; cin >> t >> a >> b;
        if (t == 'L') d.une(a, b);
        else cout << (d.acha(a) == d.acha(b) ? "SIM" : "NAO") << "\n";
    }
}
