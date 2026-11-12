// Confere os números citados no texto da aula (tabelas, contraexemplos, quiz).
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;

vector<vector<int>> diff(const string& a, const string& b) {
    int n = a.size(), m = b.size(); vector<vector<int>> d(n + 1, vector<int>(m + 1));
    for (int i = 0; i <= n; i++) d[i][0] = i;
    for (int j = 0; j <= m; j++) d[0][j] = j;
    for (int i = 1; i <= n; i++) for (int j = 1; j <= m; j++) d[i][j] = a[i - 1] == b[j - 1] ? d[i - 1][j - 1] : 1 + min(d[i - 1][j], d[i][j - 1]);
    return d;
}
void show(const string& a, const string& b) {
    auto d = diff(a, b); printf("%s -> %s\n", a.c_str(), b.c_str());
    for (auto& r : d) { for (int x : r) printf(" %d", x); puts(""); }
}

int main() {
    vector<vector<ll>> g = {{1, 4, 8, 6}, {6, 9, 1, 8}, {3, 4, 1, 5}}; int n = 3, m = 4;
    vector<vector<ll>> d(n, vector<ll>(m));
    for (int i = 0; i < n; i++) for (int j = 0; j < m; j++) { ll a = 0; if (i && j) a = max(d[i - 1][j], d[i][j - 1]); else if (i) a = d[i - 1][j]; else if (j) a = d[i][j - 1]; d[i][j] = a + g[i][j]; }
    puts("grid melhor:"); for (auto& r : d) { for (ll x : r) printf(" %lld", x); puts(""); }
    // guloso
    { int i = 0, j = 0; ll t = g[0][0]; printf("guloso: (0,0)");
      while (i != n - 1 || j != m - 1) { if (i == n - 1) j++; else if (j == m - 1) i++; else if (g[i + 1][j] > g[i][j + 1]) i++; else j++; t += g[i][j]; printf(" (%d,%d)", i, j); }
      printf(" total=%lld\n", t); }
    // número de caminhos: C(n+m-2, n-1)
    { auto C = [](int N, int K) { long double r = 1; for (int i = 1; i <= K; i++) r = r * (N - K + i) / i; return r; };
      printf("caminhos 3x4=%.0Lf 10x10=%.0Lf 20x20=%.0Lf 1000x1000 ~ 10^%.0Lf\n", C(5, 2), C(18, 9), C(38, 19), (lgammal(1999) - 2 * lgammal(1000)) / logl(10)); }
    // caminho ótimo
    { int i = n - 1, j = m - 1; vector<pair<int,int>> p; p.push_back({i, j});
      while (i || j) { if (i && (!j || d[i - 1][j] > d[i][j - 1])) i--; else j--; p.push_back({i, j}); }
      reverse(p.begin(), p.end()); printf("caminho:"); for (auto [x, y] : p) printf(" (%d,%d)=%lld", x, y, g[x][y]); puts(""); }
    // moldura com 0 em tabuleiro com negativos: errado
    { vector<vector<ll>> h = {{-5, -1}, {-2, -3}}; vector<vector<ll>> e(3, vector<ll>(3, 0)), c(3, vector<ll>(3, (ll)-1e18));
      for (int i = 1; i <= 2; i++) for (int j = 1; j <= 2; j++) { e[i][j] = max(e[i - 1][j], e[i][j - 1]) + h[i - 1][j - 1]; c[i][j] = ((i == 1 && j == 1) ? 0 : max(c[i - 1][j], c[i][j - 1])) + h[i - 1][j - 1]; }
      printf("negativos: moldura 0 -> %lld | certo -> %lld | tabela errada: %lld %lld / %lld %lld | certa: %lld %lld / %lld %lld\n", e[2][2], c[2][2], e[1][1], e[1][2], e[2][1], e[2][2], c[1][1], c[1][2], c[2][1], c[2][2]); }
    // ordem errada: colunas da direita para a esquerda
    { vector<vector<ll>> w(n, vector<ll>(m, 0));
      for (int i = 0; i < n; i++) for (int j = m - 1; j >= 0; j--) { ll a = 0; if (i && j) a = max(w[i - 1][j], w[i][j - 1]); else if (i) a = w[i - 1][j]; else if (j) a = w[i][j - 1]; w[i][j] = a + g[i][j]; }
      printf("ordem errada (j decrescente): %lld\n", w[n - 1][m - 1]); }
    show("casa", "saco"); show("ab", "ba"); show("sol", "sal"); show("gato", "gota"); show("mala", "lama");
    // índice errado: a[i] == b[j] em vez de a[i-1] == b[j-1]
    { string a = "casa", b = "saco"; int N = 4, M = 4; vector<vector<int>> e(N + 1, vector<int>(M + 1));
      for (int i = 0; i <= N; i++) e[i][0] = i;
      for (int j = 0; j <= M; j++) e[0][j] = j;
      string a2 = a + '#', b2 = b + '$';
      for (int i = 1; i <= N; i++) for (int j = 1; j <= M; j++) e[i][j] = a2[i] == b2[j] ? e[i - 1][j - 1] : 1 + min(e[i - 1][j], e[i][j - 1]);
      printf("indice errado casa->saco: %d\n", e[N][M]); }
    // quiz
    { vector<vector<ll>> q = {{2, 1, 3}, {4, 6, 1}}; vector<vector<ll>> r(2, vector<ll>(3));
      for (int i = 0; i < 2; i++) for (int j = 0; j < 3; j++) { ll a = 0; if (i && j) a = max(r[i - 1][j], r[i][j - 1]); else if (i) a = r[i - 1][j]; else if (j) a = r[i][j - 1]; r[i][j] = a + q[i][j]; }
      printf("quiz grid: %lld %lld %lld / %lld %lld %lld\n", r[0][0], r[0][1], r[0][2], r[1][0], r[1][1], r[1][2]); }
}
