// Confere os números citados no texto: tabela de saltos e somas, traços das perguntas, contraexemplos e quiz.
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
int n; vector<int> S = {0, 2, 3, 4, 5, 3, 1, 6, 4}; vector<ll> C = {0, 5, 1, 2, 4, 3, 6, 2, 7};
int L = 30; vector<vector<int>> up; vector<vector<ll>> sm;
void monta(int modo) { up.assign(L, vector<int>(n + 1)); sm.assign(L, vector<ll>(n + 1)); for (int v = 1; v <= n; v++) { up[0][v] = S[v]; sm[0][v] = C[v]; }
    for (int j = 1; j < L; j++) for (int v = 1; v <= n; v++) { int m = up[j-1][v]; up[j][v] = up[j-1][m]; sm[j][v] = sm[j-1][v] + (modo == 1 ? sm[j-1][v] : sm[j-1][m]); } }
pair<int,ll> perg(int x, ll k, bool tr, int modo = 0) { ll p = 0; for (int j = 0; j < L; j++) if (k >> j & 1) { if (modo == 2) { x = up[j][x]; p += sm[j][x]; } else { p += sm[j][x]; if (tr) printf("   bit %d: 2^%d=%lld encaminhamentos a partir de %d: paga %lld, vai para %d\n", j, j, 1LL << j, x, sm[j][x], up[j][x]); x = up[j][x]; } } return {x, p}; }
pair<int,ll> bruto(int x, ll k) { ll p = 0; vector<int> vis(n + 1, -1); vector<ll> pv(n + 1); ll i = 0; while (i < k) { if (vis[x] >= 0) { ll ciclo = i - vis[x]; ll pc = p - pv[x]; ll voltas = (k - i) / ciclo; i += voltas * ciclo; p += voltas * pc; fill(vis.begin(), vis.end(), -1); if (i >= k) break; } vis[x] = i; pv[x] = p; p += C[x]; x = S[x]; i++; } return {x, p}; }
int main() {
    n = 8; monta(0);
    printf("v up0 up1 up2 up3 | s0 s1 s2 s3\n"); for (int v = 1; v <= n; v++) printf("%d %d %d %d %d | %lld %lld %lld %lld\n", v, up[0][v], up[1][v], up[2][v], up[3][v], sm[0][v], sm[1][v], sm[2][v], sm[3][v]);
    vector<pair<int,ll>> Q = {{7, 4}, {1, 10}, {8, 5}, {6, 1}, {3, 1000000000}};
    for (auto [x, k] : Q) { printf("pergunta %d %lld:\n", x, k); auto r = perg(x, k, true); auto b = bruto(x, k); printf("  = %d %lld (bruto %d %lld)\n", r.first, r.second, b.first, b.second); }
    // passo a passo de 1, 10 passos
    { int x = 1; ll p = 0; printf("1 por 10 passos:"); for (int i = 0; i < 10; i++) { p += C[x]; x = S[x]; printf(" %d", x); } printf(" | pago %lld\n", p); }
    // contraexemplos
    { monta(1); printf("soma sem andar (soma[v][j-1] dobrado):"); for (auto [x, k] : Q) { auto r = perg(x, k, false); printf(" (%d %lld)", r.first, r.second); } puts(""); monta(0); }
    { printf("move antes de somar:"); for (auto [x, k] : Q) { auto r = perg(x, k, false, 2); printf(" (%d %lld)", r.first, r.second); } puts(""); }
    { L = 18; monta(0); auto r = perg(3, 1000000000, false); printf("LOG=18 para (3, 1e9): %d %lld\n", r.first, r.second); L = 30; monta(0); }
    // Floyd: tartaruga e lebre a partir de 7
    { int t = S[7], l = S[S[7]]; int passos = 1; printf("floyd de 7: (t,l) = (%d,%d)", t, l); while (t != l) { t = S[t]; l = S[S[l]]; passos++; printf(" (%d,%d)", t, l); } printf(" -> encontro em %d apos %d passos da tartaruga\n", t, passos);
      int mu = 0; int a = 7; printf("  fase 2:"); while (a != l) { a = S[a]; l = S[l]; mu++; printf(" (%d,%d)", a, l); } printf(" -> entrada do ciclo %d, mu=%d\n", a, mu); }
    // quiz
    { auto r = perg(2, 3, false); printf("quiz (2,3): %d %lld\n", r.first, r.second); r = perg(8, 2, false); printf("quiz (8,2): %d %lld\n", r.first, r.second); printf("quiz up[1][7]=%d sm[1][7]=%lld up[2][6]=%d sm[2][6]=%lld\n", up[1][7], sm[1][7], up[2][6], sm[2][6]); r = perg(5, 6, false); printf("quiz (5,6): %d %lld\n", r.first, r.second); }
}
