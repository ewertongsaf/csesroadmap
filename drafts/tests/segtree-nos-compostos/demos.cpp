// Confere os números citados no texto da aula: nós da árvore, traços, contraexemplos, o aquecimento (mínimo + quantidade) e o quiz.
#include <bits/stdc++.h>
using namespace std;
struct No { int tam, pre, suf, best, ini, fim; };
No folha(int t) { return {1, 1, 1, 1, t, t}; }
int MODO = 0; // 0 certo; 1 sem o termo do meio; 2 sem a condição pre==tam; 3 só respostas
No junta(No A, No B) { bool liga = A.fim < B.ini; No R; R.tam = A.tam + B.tam; R.ini = A.ini; R.fim = B.fim;
    R.pre = A.pre; if ((MODO == 2 || A.pre == A.tam) && liga) R.pre = A.tam + B.pre;
    R.suf = B.suf; if ((MODO == 2 || B.suf == B.tam) && liga) R.suf = B.tam + A.suf;
    R.best = max(A.best, B.best); if (liga && MODO != 1) R.best = max(R.best, A.suf + B.pre); return R; }
string S(No x) { char b[80]; snprintf(b, sizeof b, "tam %d pre %d suf %d best %d ini %d fim %d", x.tam, x.pre, x.suf, x.best, x.ini, x.fim); return b; }
struct T { int n; vector<int> v; vector<No> a; bool tr = false;
    T(vector<int> w) : n(w.size() - 1), v(w), a(4 * w.size()) { monta(1, 1, n); }
    void monta(int no, int l, int r) { if (l == r) { a[no] = folha(v[l]); return; } int m = (l + r) / 2; monta(2*no, l, m); monta(2*no+1, m+1, r); a[no] = junta(a[2*no], a[2*no+1]); }
    void muda(int no, int l, int r, int k, int x) { if (l == r) { a[no] = folha(x); if (tr) printf("   no %d (%d..%d): %s\n", no, l, r, S(a[no]).c_str()); return; } int m = (l + r) / 2; if (k <= m) muda(2*no, l, m, k, x); else muda(2*no+1, m+1, r, k, x); a[no] = junta(a[2*no], a[2*no+1]); if (tr) printf("   no %d (%d..%d): %s\n", no, l, r, S(a[no]).c_str()); }
    No q(int no, int l, int r, int x, int y) { if (x <= l && r <= y) { if (tr) printf("   no %d (%d..%d) dentro: %s\n", no, l, r, S(a[no]).c_str()); return a[no]; } int m = (l + r) / 2;
        if (y <= m) return q(2*no, l, m, x, y);
        if (x > m) return q(2*no+1, m+1, r, x, y);
        No e = q(2*no, l, m, x, y), d = q(2*no+1, m+1, r, x, y); No R = junta(e, d); if (tr) printf("   no %d (%d..%d) junta -> %s\n", no, l, r, S(R).c_str()); return R; }
    void nos() { for (int no = 1; no < 2 * n; no++) { int lv = 31 - __builtin_clz(no), sz = n >> lv, k = no - (1 << lv); printf("  no %2d (%d..%d): %s\n", no, k * sz + 1, (k + 1) * sz, S(a[no]).c_str()); } } };
int bruto(vector<int>& t, int x, int y) { int b = 1, c = 1; for (int i = x + 1; i <= y; i++) { c = t[i - 1] < t[i] ? c + 1 : 1; b = max(b, c); } return b; }
int main() {
    vector<int> v = {0, 3, 5, 7, 4, 6, 8, 9, 2};
    T s(v); puts("arvore inicial:"); s.nos();
    vector<tuple<char,int,int>> ev = {{'Q',1,8},{'Q',2,5},{'M',4,8},{'Q',1,8},{'M',5,9},{'Q',1,8},{'Q',3,6}};
    for (auto [c, x, y] : ev) { s.tr = true; printf("%c %d %d:\n", c, x, y); if (c == 'M') { s.muda(1, 1, 8, x, y); s.v[x] = y; printf("  temps:"); for (int i = 1; i <= 8; i++) printf(" %d", s.v[i]); puts(""); } else { No r = s.q(1, 1, 8, x, y); printf("  = %d (bruto %d)\n", r.best, bruto(s.v, x, y)); } s.tr = false; }
    puts("arvore final:"); s.nos();
    // contraexemplos, no mesmo exemplo
    for (int modo = 1; modo <= 2; modo++) { MODO = modo; T e(v); printf("modo %d (%s):", modo, modo == 1 ? "sem termo do meio" : "sem pre==tam"); vector<int> w = v;
        for (auto [c, x, y] : ev) { if (c == 'M') { e.muda(1, 1, 8, x, y); w[x] = y; } else printf(" %c%d%d=%d(certo %d)", c, x, y, e.q(1, 1, 8, x, y).best, bruto(w, x, y)); } puts(""); MODO = 0; }
    // sem pre==tam, menor caso
    { MODO = 2; T e(vector<int>{0, 1, 5, 2, 3}); printf("sem pre==tam, 1 5 2 3: raiz %s (certo: best 2 pre 2)\n", S(e.a[1]).c_str()); MODO = 0; T c(vector<int>{0, 1, 5, 2, 3}); printf("  certo: %s\n", S(c.a[1]).c_str()); }
    // só respostas: dois trechos com best 2, 2 e resultado diferente
    { T a(vector<int>{0, 1, 2, 3, 4}), b(vector<int>{0, 1, 2, 1, 2}); printf("so best: 1 2 | 3 4 -> %d ; 1 2 | 1 2 -> %d\n", a.a[1].best, b.a[1].best); }
    // neutro de zeros com temperaturas negativas
    { No Z = {0, 0, 0, 0, 0, 0}; No B = folha(-3); No B2 = junta(folha(-3), folha(-1)); No r = junta(Z, B2); printf("neutro zeros + (-3,-1): %s (certo pre 2)\n", S(r).c_str()); No r2 = junta(Z, folha(5)); printf("neutro zeros + (5): %s\n", S(r2).c_str()); (void)B; }
    // aquecimento: mínimo e quantidade
    { vector<int> w = {4, 2, 7, 2, 5, 2, 9, 3}; printf("min+qtd de"); for (int x : w) printf(" %d", x); auto mq = [&](int l, int r) { int m = INT_MAX, c = 0; for (int i = l; i <= r; i++) { if (w[i] < m) { m = w[i]; c = 0; } if (w[i] == m) c++; } return make_pair(m, c); };
      auto L = mq(0, 3), R = mq(4, 7); auto A = mq(0, 7); printf(": esq (%d,%d) dir (%d,%d) todo (%d,%d)\n", L.first, L.second, R.first, R.second, A.first, A.second);
      auto L2 = mq(0, 1), R2 = mq(2, 3); printf("  posicoes 1-2 (%d,%d), 3-4 (%d,%d), 1-4 (%d,%d)\n", L2.first, L2.second, R2.first, R2.second, L.first, L.second);
      auto L3 = mq(4, 5), R3 = mq(6, 7); printf("  posicoes 5-6 (%d,%d), 7-8 (%d,%d), 5-8 (%d,%d)\n", L3.first, L3.second, R3.first, R3.second, R.first, R.second); }
    // estresse do junta sobre todos os cortes
    { mt19937 rng(11); for (int it = 0; it < 20000; it++) { int n = rng() % 9 + 1; vector<int> w(n + 1); for (int i = 1; i <= n; i++) w[i] = (int)(rng() % 7) - 3; T tt(w); int x = rng() % n + 1, y = rng() % n + 1; if (x > y) swap(x, y); if (tt.q(1, 1, n, x, y).best != bruto(w, x, y)) { puts("JUNTA: DIFERENTE"); return 1; } } puts("junta com negativos: estresse ok"); }
    // quiz
    { T a(vector<int>{0, 7, 8}), b(vector<int>{0, 9, 8}); printf("ordem: junta(7 8, 9 8) best %d ; junta(9 8, 7 8) best %d\n", junta(a.a[1], b.a[1]).best, junta(b.a[1], a.a[1]).best); }
    { MODO = 2; T e(v); printf("sem pre==tam, exemplo inicial: no 2 %s | no 3 %s | raiz %s\n", S(e.a[2]).c_str(), S(e.a[3]).c_str(), S(e.a[1]).c_str()); MODO = 0; }
    { T a(vector<int>{0, 2, 4, 6}), b(vector<int>{0, 7, 9, 1}); No r = junta(a.a[1], b.a[1]); printf("quiz 2 4 6 | 7 9 1: A %s | B %s | R %s\n", S(a.a[1]).c_str(), S(b.a[1]).c_str(), S(r).c_str()); }
    { T a(vector<int>{0, 2, 4, 6}), b(vector<int>{0, 5, 9, 1}); No r = junta(a.a[1], b.a[1]); printf("quiz 2 4 6 | 5 9 1: R %s\n", S(r).c_str()); }
    { T a(vector<int>{0, 5, 1, 3}), b(vector<int>{0, 4, 6, 8}); No r = junta(a.a[1], b.a[1]); printf("quiz 5 1 3 | 4 6 8: A %s | B %s | R %s\n", S(a.a[1]).c_str(), S(b.a[1]).c_str(), S(r).c_str()); }
    { T z(vector<int>{0, 3, 5, 7, 8, 9, 8, 9, 2}); z.tr = true; puts("quiz Q 2 7 no estado final:"); No r = z.q(1, 1, 8, 2, 7); printf("  = %d\n", r.best); }
}
