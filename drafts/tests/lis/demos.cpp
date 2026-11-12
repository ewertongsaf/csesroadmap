// Confere os números citados no texto da aula (tabelas, contraexemplos, quiz).
#include <bits/stdc++.h>
using namespace std;

int brute(const vector<int>& a, bool strict) {
    int n = a.size(), best = 0;
    for (int mask = 0; mask < (1 << n); mask++) { long long last = LLONG_MIN; int len = 0; bool ok = true;
        for (int i = 0; i < n && ok; i++) if (mask >> i & 1) { if (strict ? a[i] <= last : a[i] < last) ok = false; last = a[i]; len++; }
        if (ok) best = max(best, len); }
    return best;
}
int fast(const vector<int>& a, bool strict, bool print = false) {
    vector<int> fim;
    for (int x : a) {
        auto it = strict ? lower_bound(fim.begin(), fim.end(), x) : upper_bound(fim.begin(), fim.end(), x);
        int pos = it - fim.begin(); bool ext = it == fim.end();
        if (ext) fim.push_back(x); else *it = x;
        if (print) { printf("  x=%d pos=%d %s ->", x, pos, ext ? "estende" : "troca"); for (int y : fim) printf(" %d", y); puts(""); }
    }
    return fim.size();
}
void quad(const vector<int>& a) {
    int n = a.size(); vector<int> L(n, 1), de(n, -1);
    for (int i = 0; i < n; i++) for (int j = 0; j < i; j++) if (a[j] <= a[i] && L[j] + 1 > L[i]) { L[i] = L[j] + 1; de[i] = j; }
    printf("L:"); for (int x : L) printf(" %d", x); printf(" | de:"); for (int x : de) printf(" %d", x); puts("");
}

int main() {
    vector<int> a = {5, 2, 2, 7, 3, 3, 8, 3};
    printf("nunca cai: brute=%d fast=%d | estrita: brute=%d fast=%d\n", brute(a, false), fast(a, false), brute(a, true), fast(a, true));
    quad(a);
    puts("traco (nunca cai):"); fast(a, false, true);
    puts("traco (estrita):"); fast(a, true, true);
    { vector<int> b = {2, 2}; vector<int> f1, f2;
      for (int x : b) { auto it = lower_bound(f1.begin(), f1.end(), x); if (it == f1.end()) f1.push_back(x); else *it = x; }
      for (int x : b) { auto it = upper_bound(f2.begin(), f2.end(), x); if (it == f2.end()) f2.push_back(x); else *it = x; }
      printf("[2,2]: lower_bound=%zu upper_bound=%zu\n", f1.size(), f2.size()); }
    puts("fim nao e a sequencia, {3,4,1} estrita:"); fast({3, 4, 1}, true, true);
    puts("quiz {4,1,6,2,3} estrita:"); fast({4, 1, 6, 2, 3}, true, true);
    puts("quiz {1,3,3,2,3} nunca cai:"); fast({1, 3, 3, 2, 3}, false, true);
    printf("quiz {1,3,3,2,3} estrita=%d\n", fast({1, 3, 3, 2, 3}, true));
    { vector<int> d = {9, 7, 8, 3, 5}; vector<int> neg; for (int x : d) neg.push_back(-x); printf("decrescente estrita de {9,7,8,3,5} = %d\n", fast(neg, true)); }
    // teste aleatório das duas versões
    mt19937 rng(7); for (int t = 0; t < 3000; t++) { int n = rng() % 12 + 1; vector<int> v(n); for (int& x : v) x = rng() % 6; assert(brute(v, true) == fast(v, true)); assert(brute(v, false) == fast(v, false)); }
    puts("aleatorio das duas versoes ok");
    printf("n^2 com n=2e5: %lld | n log n: ~%d\n", 200000LL * 200000, 200000 * 18);
}
