// Confere os números citados no texto da aula (blocos, traços, contraexemplos, inversões, atualização em intervalo, quiz).
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
struct B { int n; vector<ll> t; B(int n_) : n(n_), t(n_ + 1, 0) {}
    void add(int k, ll x, bool tr = false) { for (int i = k; i <= n; i += i & -i) { t[i] += x; if (tr) printf("   i=%d (bloco %d..%d) -> bit[%d]=%lld\n", i, i - (i & -i) + 1, i, i, t[i]); } }
    ll sum(int k, bool tr = false) { ll s = 0; for (int i = k; i > 0; i -= i & -i) { s += t[i]; if (tr) printf("   i=%d (bloco %d..%d) bit=%lld acumulado=%lld\n", i, i - (i & -i) + 1, i, t[i], s); } return s; }
    void mostra(const char* nome) { printf("%s:", nome); for (int i = 1; i <= n; i++) printf(" %lld", t[i]); puts(""); } };
string bin(int x, int w) { string s; for (int b = w - 1; b >= 0; b--) s += ((x >> b) & 1) ? '1' : '0'; return s; }
int main() {
    vector<ll> a = {0, 3, 1, 4, 1, 5, 9, 2, 6}; int n = 8;
    puts("i  bin   i&-i  bloco");
    for (int i = 1; i <= n; i++) printf("%d  %s  %d     %d..%d\n", i, bin(i, 4).c_str(), i & -i, i - (i & -i) + 1, i);
    B f(n); for (int i = 1; i <= n; i++) f.add(i, a[i]); f.mostra("bit inicial");
    { ll p = 0; printf("prefixos:"); for (int i = 1; i <= n; i++) { p += a[i]; printf(" %lld", p); } puts(""); }
    puts("soma(7):"); printf("  = %lld\n", f.sum(7, true));
    puts("S 1 7:"); printf("  = %lld\n", f.sum(7) - f.sum(0));
    puts("A 3 2:"); f.add(3, 2, true); f.mostra("bit");
    puts("S 1 7:"); printf("  = %lld\n", f.sum(7) - f.sum(0));
    puts("S 4 7: soma(7)"); ll s7 = f.sum(7, true); puts("  soma(3)"); ll s3 = f.sum(3, true); printf("  = %lld - %lld = %lld\n", s7, s3, s7 - s3);
    printf("  ERRADO soma(7)-soma(4) = %lld\n", f.sum(7) - f.sum(4));
    puts("A 6 -4:"); f.add(6, -4, true); f.mostra("bit");
    printf("S 4 7 = %lld\n", f.sum(7) - f.sum(3));
    puts("S 3 3: soma(3)"); ll u = f.sum(3, true); puts("  soma(2)"); ll v = f.sum(2, true); printf("  = %lld - %lld = %lld\n", u, v, u - v);
    // contraexemplo: "definir" usando atualiza direto
    { B g(4); ll v0[5] = {0, 5, 2, 7, 1}; for (int i = 1; i <= 4; i++) g.add(i, v0[i]); printf("vetor 5 2 7 1, soma total = %lld; 'posicao 3 passa a valer 4':\n", g.sum(4));
      B e = g; e.add(3, 4); printf("  errado add(3,4): soma total = %lld\n", e.sum(4)); B c = g; c.add(3, 4 - v0[3]); printf("  certo add(3, 4-7): soma total = %lld\n", c.sum(4)); }
    // passos máximos
    { int N = 200000, mx = 0, arg = 0; for (int k = 1; k <= N; k++) { int c = 0; for (int i = k; i > 0; i -= i & -i) c++; if (c > mx) { mx = c; arg = k; } } int mu = 0; for (int k = 1; k <= N; k++) { int c = 0; for (int i = k; i <= N; i += i & -i) c++; mu = max(mu, c); } printf("n=2e5: soma visita no maximo %d blocos (k=%d); atualiza no maximo %d\n", mx, arg, mu); }
    // inversões
    { vector<int> p = {4, 2, 5, 1, 3}; B c(5); ll inv = 0; puts("inversoes de 4 2 5 1 3: valor | ja vistos | vistos <= valor | maiores | total");
      for (int j = 0; j < 5; j++) { ll men = c.sum(p[j]); ll mai = j - men; inv += mai; printf("  %d | %d | %lld | %lld | %lld\n", p[j], j, men, mai, inv); c.add(p[j], 1); }
      // estresse contra O(n^2)
      mt19937 rng(7); for (int it = 0; it < 2000; it++) { int m = rng() % 9 + 1; vector<int> q(m); for (auto& x : q) x = rng() % 6 + 1; B d(6); ll r = 0; for (int j = 0; j < m; j++) { r += j - d.sum(q[j]); d.add(q[j], 1); } ll b = 0; for (int i = 0; i < m; i++) for (int j = i + 1; j < m; j++) if (q[i] > q[j]) b++; if (r != b) { puts("INVERSOES: DIFERENTE"); return 1; } } puts("  inversoes: estresse ok"); }
    // atualização em intervalo, consulta em ponto
    { int m = 6; B d(m); auto faixa = [&](int l, int r, ll x) { d.add(l, x); d.add(r + 1, -x); }; faixa(2, 4, 5); faixa(4, 6, 3);
      printf("faixa: +5 em 2..4, +3 em 4..6 -> valores:"); for (int i = 1; i <= m; i++) printf(" %lld", d.sum(i)); puts("");
      printf("  vetor de diferencas:"); for (int i = 1; i <= m; i++) printf(" %lld", d.sum(i) - d.sum(i - 1)); puts("");
      mt19937 rng(9); for (int it = 0; it < 2000; it++) { int k = rng() % 8 + 1; B e(k); vector<ll> br(k + 2, 0); for (int o = 0; o < 10; o++) { int l = rng() % k + 1, r = rng() % k + 1; if (l > r) swap(l, r); ll x = (int)(rng() % 11) - 5; e.add(l, x); e.add(r + 1, -x); for (int i = l; i <= r; i++) br[i] += x; int p = rng() % k + 1; if (e.sum(p) != br[p]) { puts("FAIXA: DIFERENTE"); return 1; } } } puts("  faixa: estresse ok"); }
    // quiz
    { B g(4); ll v0[5] = {0, 2, 5, 1, 4}; for (int i = 1; i <= 4; i++) g.add(i, v0[i]); g.mostra("quiz bit de 2 5 1 4"); }
    { printf("quiz soma(13) visita:"); for (int i = 13; i > 0; i -= i & -i) printf(" %d", i); puts(""); printf("quiz atualiza(5), n=16 visita:"); for (int i = 5; i <= 16; i += i & -i) printf(" %d", i); puts(""); printf("quiz 12&-12=%d, 10&-10=%d\n", 12 & -12, 10 & -10); }
    { B g(8); for (int i = 1; i <= 8; i++) g.add(i, 1); g.add(4, 3); printf("quiz: oito 1s, add(4,3): soma(3,6)=%lld, bit[4]=%lld bit[8]=%lld bit[6]=%lld\n", g.sum(6) - g.sum(2), g.t[4], g.t[8], g.t[6]); }
}
