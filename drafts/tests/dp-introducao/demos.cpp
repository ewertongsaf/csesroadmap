// Confere os números citados no texto da aula (tabelas, contraexemplos, quiz).
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;

ll chamadas = 0;
ll formas(int i) {                 // recursão direta
    chamadas++;
    if (i <= 1) return 1;
    return formas(i - 1) + formas(i - 2);
}

vector<ll> memo;
ll formas_memo(int i) {
    if (i <= 1) return 1;
    if (memo[i] != -1) return memo[i];      // já calculei: devolve o que anotei
    return memo[i] = formas_memo(i - 1) + formas_memo(i - 2);
}

int main() {
    for (int n : {5, 30}) { chamadas = 0; ll f = formas(n); printf("formas(%d)=%lld chamadas=%lld\n", n, f, chamadas); }
    memo.assign(91, -1);
    printf("memo 50=%lld 90=%lld\n", formas_memo(50), formas_memo(90));

    // tabela
    { int n = 8; vector<ll> f(n + 1); f[0] = 1; f[1] = 1; for (int i = 2; i <= n; i++) f[i] = f[i - 1] + f[i - 2];
      printf("tabela:"); for (ll x : f) printf(" %lld", x); puts(""); }

    vector<ll> c = {0, 3, 9, 3, 4, 6, 8}; int n = 6;
    { vector<ll> custo(n + 1, 0);
      for (int i = 1; i <= n; i++) { ll m = custo[i - 1]; if (i >= 2) m = min(m, custo[i - 2]); custo[i] = m + c[i]; }
      printf("custo:"); for (ll x : custo) printf(" %lld", x); puts(""); }
    // ordem errada: de n para 1
    { vector<ll> custo(n + 1, 0);
      for (int i = n; i >= 1; i--) { ll m = custo[i - 1]; if (i >= 2) m = min(m, custo[i - 2]); custo[i] = m + c[i]; }
      printf("ordem errada custo[n]=%lld\n", custo[n]); }
    // guloso
    { int i = 0; ll tot = 0; printf("guloso:");
      while (i < n) { if (i + 2 <= n && c[i + 2] < c[i + 1]) i += 2; else i += 1; tot += c[i]; printf(" %d", i); }
      printf(" total=%lld\n", tot); }
    // degrau 3 quebrado: certo (INF) x errado (0)
    { const ll INF = 1e18; vector<bool> q(n + 1, false); q[3] = true;
      vector<ll> custo(n + 1, INF); custo[0] = 0;
      for (int i = 1; i <= n; i++) { if (q[i]) continue; ll m = custo[i - 1]; if (i >= 2) m = min(m, custo[i - 2]); if (m != INF) custo[i] = m + c[i]; }
      printf("quebrado certo=%lld |", custo[n]); for (int i = 0; i <= n; i++) printf(" %s", custo[i] == INF ? "INF" : to_string(custo[i]).c_str()); puts("");
      vector<ll> e(n + 1, 0);
      for (int i = 1; i <= n; i++) { if (q[i]) { e[i] = 0; continue; } ll m = e[i - 1]; if (i >= 2) m = min(m, e[i - 2]); e[i] = m + c[i]; }
      printf("quebrado errado=%lld |", e[n]); for (ll x : e) printf(" %lld", x); puts(""); }
    // INT_MAX + c estoura
    { int inf = INT_MAX; unsigned u = (unsigned)inf + 8u; printf("INT_MAX+8 como int = %d\n", (int)u); }
    // de onde veio
    { vector<ll> custo(n + 1, 0); vector<int> de(n + 1, 0);
      for (int i = 1; i <= n; i++) { de[i] = i - 1; if (i >= 2 && custo[i - 2] < custo[i - 1]) de[i] = i - 2; custo[i] = custo[de[i]] + c[i]; }
      printf("de:"); for (int x : de) printf(" %d", x); printf(" | caminho:"); for (int i = n; i != 0; i = de[i]) printf(" %d", i); puts(" 0"); }
    // ordem dos laços, peças {1,2}, total 4
    { vector<int> pecas = {1, 2}; int T = 4;
      vector<ll> a(T + 1, 0); a[0] = 1;
      for (int t = 1; t <= T; t++) for (int p : pecas) if (t >= p) a[t] += a[t - p];
      printf("total por fora:"); for (ll x : a) printf(" %lld", x); puts("");
      vector<ll> b(T + 1, 0); b[0] = 1;
      for (int p : pecas) { for (int t = p; t <= T; t++) b[t] += b[t - p]; printf("depois da peca %d:", p); for (ll x : b) printf(" %lld", x); puts(""); } }
    // quiz
    { int n2 = 6; vector<ll> w(n2 + 1, 0); w[0] = 1; for (int i = 1; i <= n2; i++) { w[i] = w[i - 1]; if (i >= 3) w[i] += w[i - 3]; }
      printf("quiz1:"); for (ll x : w) printf(" %lld", x); puts(""); }
    { vector<ll> cc = {0, 2, 7, 1, 5, 3}; int m = 5; vector<ll> d(m + 1, 0);
      for (int i = 1; i <= m; i++) { ll x = d[i - 1]; if (i >= 2) x = min(x, d[i - 2]); d[i] = x + cc[i]; }
      printf("quiz2:"); for (ll x : d) printf(" %lld", x); puts(""); }
    { vector<int> pecas = {1, 3}; int T = 4; vector<ll> b(T + 1, 0); b[0] = 1;
      for (int p : pecas) for (int t = p; t <= T; t++) b[t] += b[t - p];
      vector<ll> a(T + 1, 0); a[0] = 1; for (int t = 1; t <= T; t++) for (int p : pecas) if (t >= p) a[t] += a[t - p];
      printf("quiz4: pecas por fora=%lld total por fora=%lld\n", b[T], a[T]); }
    // módulo
    { const ll MOD = 1e9 + 7; int n3 = 100; vector<ll> f(n3 + 1); f[0] = f[1] = 1; for (int i = 2; i <= n3; i++) f[i] = (f[i - 1] + f[i - 2]) % MOD; printf("formas(100) mod = %lld\n", f[n3]); }
}
