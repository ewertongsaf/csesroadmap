// Confere os números citados no texto da aula: traços com pendências, contraexemplos, contagem de nós, persistência e quiz.
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
struct L { int n; vector<ll> a, p; bool tr = false; int vis = 0; int modo = 0; // modo 1: consulta sem empurrar; 2: soma sem empurrar
    L(vector<ll> v) : n(v.size() - 1), a(4 * v.size()), p(4 * v.size(), 0) { mo(1, 1, n, v); }
    void mo(int no, int l, int r, vector<ll>& v) { if (l == r) { a[no] = v[l]; return; } int m = (l + r) / 2; mo(2*no, l, m, v); mo(2*no+1, m+1, r, v); a[no] = max(a[2*no], a[2*no+1]); }
    void ap(int no, ll x) { a[no] += x; if (modo == 3) p[no] = x; else p[no] += x; }
    void em(int no) { if (p[no]) { if (tr) printf("   empurra %+lld do no %d para os nos %d e %d\n", p[no], no, 2*no, 2*no+1); ap(2*no, p[no]); ap(2*no+1, p[no]); p[no] = 0; } }
    void so(int no, int l, int r, int x0, int y0, ll x) { vis++; if (y0 < l || r < x0) { if (tr) printf("   no %d (%d..%d): fora\n", no, l, r); return; }
        if (x0 <= l && r <= y0) { ap(no, x); if (tr) printf("   no %d (%d..%d): dentro, max vira %lld, pendente %+lld\n", no, l, r, a[no], p[no]); return; }
        if (tr) printf("   no %d (%d..%d): parcial\n", no, l, r);
        if (modo != 2) em(no);
        int m = (l + r) / 2; so(2*no, l, m, x0, y0, x); so(2*no+1, m+1, r, x0, y0, x); a[no] = max(a[2*no], a[2*no+1]); if (tr) printf("   no %d (%d..%d): refaz max = %lld\n", no, l, r, a[no]); }
    ll co(int no, int l, int r, int x0, int y0) { vis++; if (y0 < l || r < x0) { if (tr) printf("   no %d (%d..%d): fora\n", no, l, r); return LLONG_MIN; } if (x0 <= l && r <= y0) { if (tr) printf("   no %d (%d..%d): dentro, vale %lld\n", no, l, r, a[no]); return a[no]; }
        if (tr) printf("   no %d (%d..%d): parcial\n", no, l, r);
        if (modo != 1) em(no);
        int m = (l + r) / 2; ll e = co(2*no, l, m, x0, y0); ll d = co(2*no+1, m+1, r, x0, y0); return max(e, d); }
    void estado() { printf("   max[1..15]:"); for (int i = 1; i < 2 * n; i++) printf(" %lld", a[i]); printf(" | pend:"); for (int i = 1; i < 2 * n; i++) if (p[i]) printf(" no%d=%+lld", i, p[i]); puts(""); } };
vector<ll> V = {0, 2, 6, 1, 8, 3, 5, 4, 7};
struct Op { char c; int a, b; ll x; };
vector<Op> OPS = {{'Q', 1, 8, 0}, {'S', 1, 4, 3}, {'Q', 3, 6, 0}, {'S', 5, 8, -2}, {'S', 2, 7, 4}, {'Q', 5, 8, 0}, {'Q', 1, 2, 0}};
vector<ll> roda(int modo, bool tr) { L s(V); s.modo = modo; s.tr = tr; vector<ll> w = V, out; if (tr) { puts("inicial:"); s.estado(); }
    for (auto o : OPS) { if (tr) printf("%c %d %d %lld:\n", o.c, o.a, o.b, o.x); if (o.c == 'S') { s.vis = 0; s.so(1, 1, 8, o.a, o.b, o.x); for (int i = o.a; i <= o.b; i++) w[i] += o.x; if (tr) { printf("   (%d nos visitados) temps:", s.vis); for (int i = 1; i <= 8; i++) printf(" %lld", w[i]); puts(""); s.estado(); } }
        else { s.vis = 0; ll r = s.co(1, 1, 8, o.a, o.b); out.push_back(r); if (tr) { printf("   = %lld (%d nos visitados; bruto %lld)\n", r, s.vis, *max_element(w.begin() + o.a, w.begin() + o.b + 1)); s.estado(); } } }
    return out; }
int main() {
    auto r0 = roda(0, true); printf("saida:"); for (ll x : r0) printf(" %lld", x); puts("");
    auto r1 = roda(1, false); printf("consulta sem empurrar:"); for (ll x : r1) printf(" %lld", x); puts("");
    auto r3 = roda(3, false); printf("pendencia com = :"); for (ll x : r3) printf(" %lld", x); puts("");
    auto r2 = roda(2, false); printf("soma sem empurrar:"); for (ll x : r2) printf(" %lld", x); puts("");
    { L s(V); s.modo = 2; s.so(1, 1, 8, 1, 4, 3); s.so(1, 1, 8, 2, 7, 4); printf("soma sem empurrar, no 2 depois de S 1 4 3 e S 2 7 4: %lld (certo:", s.a[2]); L c(V); c.so(1, 1, 8, 1, 4, 3); c.so(1, 1, 8, 2, 7, 4); printf(" %lld)\n", c.a[2]); }
    for (int modo : {0, 3}) { L s(vector<ll>{0, 1, 2, 3, 4}); s.modo = modo; s.so(1, 1, 4, 1, 4, 10); s.so(1, 1, 4, 1, 4, -20); printf("1 2 3 4, S 1 4 10, S 1 4 -20, modo %d: pend raiz %lld, Q 1 1 = %lld, Q 1 4 = %lld\n", modo, s.p[1], s.co(1, 1, 4, 1, 1), s.co(1, 1, 4, 1, 4)); }
    // quantos nós uma soma no vetor todo / trecho grande visita, n = 1024
    { int n = 1024; L s(vector<ll>(n + 1, 0)); int mx = 0; for (int a = 1; a <= n; a++) for (int b = a; b <= n; b++) { s.vis = 0; s.so(1, 1, n, a, b, 1); mx = max(mx, s.vis); } printf("n=1024: uma soma visita no maximo %d nos (todos os trechos)\n", mx); }
    // persistente: soma, vetor 1 2 3 4
    { const int M = 1000; static int E[M], D[M]; static ll S[M]; int cnt = 0;
      auto novo = [&](int e, int d, ll v) { cnt++; E[cnt] = e; D[cnt] = d; S[cnt] = v; return cnt; };
      vector<ll> w = {0, 1, 2, 3, 4};
      function<int(int,int)> monta = [&](int l, int r) -> int { if (l == r) return novo(0, 0, w[l]); int m = (l + r) / 2; int e = monta(l, m), d = monta(m + 1, r); return novo(e, d, S[e] + S[d]); };
      function<int(int,int,int,int,ll)> muda = [&](int ant, int l, int r, int k, ll x) -> int { if (l == r) return novo(0, 0, x); int m = (l + r) / 2; if (k <= m) { int e = muda(E[ant], l, m, k, x); return novo(e, D[ant], S[e] + S[D[ant]]); } int d = muda(D[ant], m + 1, r, k, x); return novo(E[ant], d, S[E[ant]] + S[d]); };
      function<ll(int,int,int,int,int)> cons = [&](int no, int l, int r, int a, int b) -> ll { if (b < l || r < a) return 0; if (a <= l && r <= b) return S[no]; int m = (l + r) / 2; return cons(E[no], l, m, a, b) + cons(D[no], m + 1, r, a, b); };
      vector<int> raiz; raiz.push_back(monta(1, 4)); printf("persistente: v0 tem %d nos\n", cnt);
      int c0 = cnt; raiz.push_back(muda(raiz[0], 1, 4, 2, 5)); printf("  v1 = v0 com posicao 2 := 5: %d nos novos (ids %d..%d), raiz %d\n", cnt - c0, c0 + 1, cnt, raiz[1]);
      c0 = cnt; raiz.push_back(muda(raiz[1], 1, 4, 4, 0)); printf("  v2 = v1 com posicao 4 := 0: %d nos novos (ids %d..%d), raiz %d\n", cnt - c0, c0 + 1, cnt, raiz[2]);
      c0 = cnt; raiz.push_back(muda(raiz[0], 1, 4, 1, 9)); printf("  v3 = v0 com posicao 1 := 9: %d nos novos, raiz %d\n", cnt - c0, raiz[3]);
      for (int v = 0; v < 4; v++) printf("  soma(1..4) na v%d = %lld ; soma(1..2) = %lld ; soma(3..4) = %lld\n", v, cons(raiz[v], 1, 4, 1, 4), cons(raiz[v], 1, 4, 1, 2), cons(raiz[v], 1, 4, 3, 4));
      printf("  nos de cada raiz: v0 raiz %d (filhos %d,%d) v1 raiz %d (filhos %d,%d) v2 raiz %d (filhos %d,%d) v3 raiz %d (filhos %d,%d)\n", raiz[0], E[raiz[0]], D[raiz[0]], raiz[1], E[raiz[1]], D[raiz[1]], raiz[2], E[raiz[2]], D[raiz[2]], raiz[3], E[raiz[3]], D[raiz[3]]);
      // estresse: versões aleatórias contra cópias de vetor
      mt19937 rng(4); for (int it = 0; it < 300; it++) { cnt = 0; int n = rng() % 7 + 1; w.assign(n + 1, 0); for (int i = 1; i <= n; i++) w[i] = rng() % 10; vector<vector<ll>> cop = {w}; vector<int> rz = {monta(1, n)};
          for (int o = 0; o < 12; o++) { int v = rng() % rz.size(); if (rng() % 2) { int k = rng() % n + 1; ll x = rng() % 10; rz.push_back(muda(rz[v], 1, n, k, x)); cop.push_back(cop[v]); cop.back()[k] = x; } else { int a = rng() % n + 1, b = rng() % n + 1; if (a > b) swap(a, b); ll s = 0; for (int i = a; i <= b; i++) s += cop[v][i]; if (cons(rz[v], 1, n, a, b) != s) { puts("PERSISTENTE: DIFERENTE"); return 1; } } } }
      puts("  persistente: estresse ok"); }
    // quiz
    { L s(vector<ll>{0, 1, 2, 3, 4}); s.tr = true; puts("quiz S 1 2 5 em 1 2 3 4:"); s.so(1, 1, 4, 1, 2, 5); s.estado(); puts("quiz Q 2 3:"); printf("  = %lld\n", s.co(1, 1, 4, 2, 3)); s.estado(); }
    { L s(vector<ll>{0, 1, 2, 3, 4}); s.modo = 1; s.so(1, 1, 4, 1, 2, 5); printf("quiz consulta sem empurrar Q 2 3: %lld\n", s.co(1, 1, 4, 2, 3)); }
    { L s(vector<ll>{0, 1, 2, 3, 4}); s.so(1, 1, 4, 1, 4, 10); s.so(1, 1, 4, 3, 4, -20); printf("quiz S 1 4 10; S 3 4 -20; Q 1 4 = %lld; pend raiz %lld\n", s.co(1, 1, 4, 1, 4), s.p[1]); }
}
