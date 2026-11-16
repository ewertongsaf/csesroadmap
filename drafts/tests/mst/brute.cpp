#include <bits/stdc++.h>
using namespace std;
int main() {   // força bruta: testa todo subconjunto de trechos e fica com o mais barato que conecta tudo
    int n, m; cin >> n >> m; vector<array<long long, 3>> es(m); for (auto& e : es) cin >> e[0] >> e[1] >> e[2];
    long long best = LLONG_MAX;
    for (int mask = 0; mask < (1 << m); mask++) {
        vector<int> p(n + 1); iota(p.begin(), p.end(), 0); function<int(int)> f = [&](int x) { return p[x] == x ? x : p[x] = f(p[x]); };
        long long c = 0; int comps = n;
        for (int i = 0; i < m; i++) if (mask >> i & 1) { c += es[i][2]; int a = f(es[i][0]), b = f(es[i][1]); if (a != b) { p[a] = b; comps--; } }
        if (comps == 1) best = min(best, c);
    }
    if (best == LLONG_MAX) cout << "IMPOSSIVEL\n"; else cout << best << "\n";
}
