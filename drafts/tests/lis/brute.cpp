#include <bits/stdc++.h>
using namespace std;
int main() {   // testa todos os 2^n subconjuntos
    int n; cin >> n; vector<int> a(n); for (int& x : a) cin >> x; int best = 0;
    for (int mask = 0; mask < (1 << n); mask++) {
        int last = INT_MIN, len = 0; bool ok = true;
        for (int i = 0; i < n && ok; i++) if (mask >> i & 1) { if (a[i] < last) ok = false; last = a[i]; len++; }
        if (ok) best = max(best, len);
    }
    cout << best << "\n";
}
