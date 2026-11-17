// Confere os números citados no texto da aula (nós, traços, 4n, neutro errado, descida, quiz).
#include <bits/stdc++.h>
using namespace std;
const int INF = INT_MAX;
struct S { int n; vector<int> t; int neutro = INF; int maxNo = 0; int visitas = 0; bool tr = false;
    S(const vector<int>& v) : n(v.size() - 1), t(8 * v.size(), 0) { monta(1, 1, n, v); }
    void monta(int no, int l, int r, const vector<int>& v) { maxNo = max(maxNo, no); if (l == r) { t[no] = v[l]; return; } int m = (l + r) / 2; monta(2*no, l, m, v); monta(2*no+1, m+1, r, v); t[no] = min(t[2*no], t[2*no+1]); }
    void muda(int no, int l, int r, int k, int x) { if (l == r) { t[no] = x; if (tr) printf("   no %d (%d..%d) = %d\n", no, l, r, x); return; } int m = (l + r) / 2; if (k <= m) muda(2*no, l, m, k, x); else muda(2*no+1, m+1, r, k, x); int ant = t[no]; t[no] = min(t[2*no], t[2*no+1]); if (tr) printf("   no %d (%d..%d): min(%d, %d) = %d (antes %d)\n", no, l, r, t[2*no], t[2*no+1], t[no], ant); }
    int consulta(int no, int l, int r, int a, int b) { visitas++;
        if (b < l || r < a) { if (tr) printf("   no %d (%d..%d): fora\n", no, l, r); return neutro; }
        if (a <= l && r <= b) { if (tr) printf("   no %d (%d..%d): dentro, vale %d\n", no, l, r, t[no]); return t[no]; }
        if (tr) printf("   no %d (%d..%d): parcial\n", no, l, r);
        int m = (l + r) / 2; int e = consulta(2*no, l, m, a, b); int d = consulta(2*no+1, m+1, r, a, b); return min(e, d); }
    int primeiro(int no, int l, int r, int x) { if (t[no] > x) return 0; if (l == r) return l; int m = (l + r) / 2; if (tr) printf("   no %d (%d..%d): esquerda tem minimo %d -> vai para a %s\n", no, l, r, t[2*no], t[2*no] <= x ? "esquerda" : "direita"); if (t[2*no] <= x) return primeiro(2*no, l, m, x); return primeiro(2*no+1, m+1, r, x); }
    void nos(int no, int l, int r) { printf("  no %d: %d..%d = %d\n", no, l, r, t[no]); if (l == r) return; int m = (l + r) / 2; nos(2*no, l, m); nos(2*no+1, m+1, r); } };
int main() {
    vector<int> v = {0, 5, 3, 8, 6, 2, 7, 4, 6};
    S s(v); puts("arvore inicial:"); s.nos(1, 1, 8); s.tr = true;
    auto Q = [&](int a, int b) { printf("Q %d %d:\n", a, b); s.visitas = 0; int r = s.consulta(1, 1, 8, a, b); printf("  = %d (%d nos visitados)\n", r, s.visitas); };
    auto M = [&](int k, int x) { printf("M %d %d:\n", k, x); s.muda(1, 1, 8, k, x); printf("  arv[1..15]:"); for (int i = 1; i <= 15; i++) printf(" %d", s.t[i]); puts(""); };
    Q(1, 8); Q(3, 4); M(5, 9); Q(3, 7); M(2, 7); Q(1, 4);
    // neutro errado
    { S e(vector<int>{0, 5, 3, 8, 6, 2, 7, 4, 6}); e.neutro = 0; printf("neutro 0 em Q 3 4 (certo: 6): %d\n", e.consulta(1, 1, 8, 3, 4)); printf("neutro 0 em Q 1 8 (certo: 2): %d\n", e.consulta(1, 1, 8, 1, 8)); }
    // descida: estado atual 5 7 8 6 9 7 4 6
    puts("primeiro posto com preco <= 6:"); printf("  = %d\n", s.primeiro(1, 1, 8, 6));
    puts("primeiro posto com preco <= 4:"); printf("  = %d\n", s.primeiro(1, 1, 8, 4));
    puts("primeiro posto com preco <= 3:"); printf("  = %d\n", s.primeiro(1, 1, 8, 3));
    s.tr = false;
    { mt19937 rng(5); for (int it = 0; it < 3000; it++) { int n = rng() % 9 + 1; vector<int> w(n + 1); for (int i = 1; i <= n; i++) w[i] = rng() % 10; S d(w); for (int o = 0; o < 10; o++) { if (rng() % 2) { int k = rng() % n + 1, x = rng() % 10; w[k] = x; d.muda(1, 1, n, k, x); } int x = rng() % 10; int b = 0; for (int i = 1; i <= n; i++) if (w[i] <= x) { b = i; break; } if (d.primeiro(1, 1, n, x) != b) { puts("DESCIDA: DIFERENTE"); return 1; } } } puts("descida: estresse ok"); }
    // n que não é potência de 2
    { vector<int> w = {0, 4, 9, 1, 7, 3, 8}; S d(w); puts("n = 6:"); d.nos(1, 1, 6); printf("maior indice de no usado com n=6: %d (2n = 12)\n", d.maxNo); }
    { double pior = 0; int arg = 0; for (int n = 1; n <= 3000; n++) { S d(vector<int>(n + 1, 0)); if ((double)d.maxNo / n > pior) { pior = (double)d.maxNo / n; arg = n; } } printf("pior razao maiorIndice/n para n<=3000: %.3f (n=%d)\n", pior, arg); S g(vector<int>(200001, 0)); printf("n=2e5: maior indice %d (4n=%d)\n", g.maxNo, 800000); }
    // visitas máximas
    { int n = 1024; S d(vector<int>(n + 1, 0)); int mx = 0; for (int a = 1; a <= n; a++) for (int b = a; b <= n; b++) { d.visitas = 0; d.consulta(1, 1, n, a, b); mx = max(mx, d.visitas); } printf("n=1024: uma consulta visita no maximo %d nos (4*log2 n = 40)\n", mx); }
    // quiz
    { S d(vector<int>{0, 4, 9, 1, 7}); puts("quiz arvore de 4 9 1 7:"); d.nos(1, 1, 4); d.tr = true; puts("quiz consulta 2..3:"); d.visitas = 0; { int r = d.consulta(1, 1, 4, 2, 3); printf("  = %d, %d visitas\n", r, d.visitas); } puts("quiz muda(3, 8):"); d.muda(1, 1, 4, 3, 8); printf("  arv[1..7]:"); for (int i = 1; i <= 7; i++) printf(" %d", d.t[i]); puts(""); puts("quiz primeiro <= 7:"); printf("  = %d\n", d.primeiro(1, 1, 4, 7)); }
}
