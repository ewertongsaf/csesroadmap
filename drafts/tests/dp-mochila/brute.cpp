#include <bits/stdc++.h>
using namespace std;
int main() {   // testa todos os 2^n subconjuntos
    int n, C; cin >> n >> C; vector<int> t(n), v(n);
    for (int i = 0; i < n; i++) cin >> t[i] >> v[i];
    long long best = 0;
    for (int mask = 0; mask < (1 << n); mask++) {
        long long w = 0, s = 0;
        for (int i = 0; i < n; i++) if (mask >> i & 1) { w += t[i]; s += v[i]; }
        if (w <= C) best = max(best, s);
    }
    cout << best << "\n";
}
