#include <bits/stdc++.h>
using namespace std;
// Menor número de apagar/inserir = |a| + |b| - 2 * (maior subsequência comum), achada testando todos os subconjuntos de letras de a.
int main() {
    string a, b; cin >> a >> b; int n = a.size(), best = 0;
    for (int mask = 0; mask < (1 << n); mask++) {
        string s; for (int i = 0; i < n; i++) if (mask >> i & 1) s += a[i];
        size_t k = 0; for (char c : b) if (k < s.size() && s[k] == c) k++;
        if (k == s.size()) best = max(best, (int)s.size());
    }
    cout << (int)a.size() + (int)b.size() - 2 * best << "\n";
}
