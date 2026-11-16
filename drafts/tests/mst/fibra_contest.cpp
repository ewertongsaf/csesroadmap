#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
typedef vector<int> vi;
#define all(x) (x).begin(),(x).end()
void fastio(){ ios::sync_with_stdio(false); cin.tie(nullptr); }

struct DSU {
    vi pai, tam;
    DSU(int n) : pai(n + 1), tam(n + 1, 1) { iota(all(pai), 0); }
    int acha(int x) { return pai[x] == x ? x : pai[x] = acha(pai[x]); }
    bool une(int a, int b) {
        a = acha(a); b = acha(b);
        if (a == b) return false;
        if (tam[a] < tam[b]) swap(a, b);
        pai[b] = a; tam[a] += tam[b];
        return true;
    }
};

int main(){
    fastio();
    int n, m; cin >> n >> m;
    vector<array<ll, 3>> es(m);                // {custo, a, b}
    for (auto& e : es) cin >> e[1] >> e[2] >> e[0];
    sort(all(es));
    DSU d(n);
    ll total = 0; int usados = 0;
    for (auto& [w, a, b] : es) if (d.une(a, b)) { total += w; usados++; }
    if (usados < n - 1) cout << "IMPOSSIVEL\n"; else cout << total << "\n";
}
