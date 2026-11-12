// Confere os números citados no texto da aula (tabelas, contraexemplos, quiz) e testa os trechos menores contra força bruta.
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;

void linha(const char* nome, const vector<ll>& v) { printf("%-22s", nome); for (ll x : v) printf(" %lld", x); puts(""); }
void linhab(const char* nome, const vector<bool>& v) { printf("%-22s", nome); for (bool x : v) printf(" %c", x ? 'S' : '.'); puts(""); }

int main() {
    // subset sum com {3, 5, 6}, somas 0..14
    { vector<int> a = {3, 5, 6}; int S = 14;
      vector<vector<bool>> pode(a.size() + 1, vector<bool>(S + 1, false));
      pode[0][0] = true; linhab("nenhum item", pode[0]);
      for (size_t i = 1; i <= a.size(); i++) {
          for (int s = 0; s <= S; s++) { pode[i][s] = pode[i - 1][s]; if (s >= a[i - 1] && pode[i - 1][s - a[i - 1]]) pode[i][s] = true; }
          char nome[40]; snprintf(nome, sizeof nome, "ate o item %d", a[i - 1]); linhab(nome, pode[i]);
      }
      // 1D certo (de trás para frente)
      vector<bool> p(S + 1, false); p[0] = true;
      for (int x : a) for (int s = S; s >= x; s--) if (p[s - x]) p[s] = true;
      linhab("1D tras p/ frente", p); assert(p == pode[a.size()]);
      // 1D errado (para frente) só com o item 3
      vector<bool> e(S + 1, false); e[0] = true;
      for (int s = 3; s <= S; s++) if (e[s - 3]) e[s] = true;
      linhab("1D p/ frente, so o 3", e);
      vector<bool> e2(S + 1, false); e2[0] = true;
      for (int x : a) for (int s = x; s <= S; s++) if (e2[s - x]) e2[s] = true;
      linhab("1D p/ frente, todos", e2); }

    // mochila do pendrive: (6,8) (4,10) (7,11) (2,6), C = 10
    vector<int> tam = {6, 4, 7, 2}, nota = {8, 10, 11, 6}; int C = 10;
    { vector<ll> m(C + 1, 0); linha("inicio", m);
      for (int i = 0; i < 4; i++) { for (int c = C; c >= tam[i]; c--) m[c] = max(m[c], m[c - tam[i]] + nota[i]);
        char nome[40]; snprintf(nome, sizeof nome, "depois de %c (%d,%d)", 'A' + i, tam[i], nota[i]); linha(nome, m); }
      // laço para frente (errado para 0/1, certo para ilimitada)
      vector<ll> f(C + 1, 0);
      for (int i = 0; i < 4; i++) for (int c = tam[i]; c <= C; c++) f[c] = max(f[c], f[c - tam[i]] + nota[i]);
      linha("para frente (ilimit.)", f);
      vector<ll> f1(C + 1, 0); for (int c = tam[3]; c <= C; c++) f1[c] = max(f1[c], f1[c - tam[3]] + nota[3]);
      linha("p/ frente, so D", f1); }
    // "exatamente c": -INF
    { const ll NEG = -1e18; vector<ll> m(C + 1, NEG); m[0] = 0;
      for (int i = 0; i < 4; i++) for (int c = C; c >= tam[i]; c--) if (m[c - tam[i]] != NEG) m[c] = max(m[c], m[c - tam[i]] + nota[i]);
      printf("%-22s", "exatamente c"); for (ll x : m) { if (x == NEG) printf(" -"); else printf(" %lld", x); } puts(""); }
    // contar subconjuntos de {2,3,5,5} com soma 10 (e todas as somas)
    { vector<int> a = {2, 3, 5, 5}; int S = 10; const ll MOD = 1e9 + 7; vector<ll> q(S + 1, 0); q[0] = 1;
      for (int x : a) { for (int s = S; s >= x; s--) q[s] = (q[s] + q[s - x]) % MOD; }
      linha("contagem {2,3,5,5}", q);
      // força bruta
      for (int s = 0; s <= S; s++) { ll c = 0; for (int mask = 0; mask < 16; mask++) { int t = 0; for (int i = 0; i < 4; i++) if (mask >> i & 1) t += a[i]; if (t == s) c++; } assert(c == q[s]); } }
    // escolhidos (reconstrução com tabela 2D)
    { vector<vector<ll>> m(5, vector<ll>(C + 1, 0));
      for (int i = 1; i <= 4; i++) for (int c = 0; c <= C; c++) { m[i][c] = m[i - 1][c]; if (c >= tam[i - 1]) m[i][c] = max(m[i][c], m[i - 1][c - tam[i - 1]] + nota[i - 1]); }
      printf("escolhidos:"); int c = C; for (int i = 4; i >= 1; i--) if (m[i][c] != m[i - 1][c]) { printf(" %c", 'A' + i - 1); c -= tam[i - 1]; } puts(""); }
    // quiz
    { vector<ll> m(8, 0); vector<pair<int,int>> it = {{3, 4}, {4, 5}, {2, 3}};
      for (auto [w, v] : it) for (int c = 7; c >= w; c--) m[c] = max(m[c], m[c - w] + v);
      linha("quiz mochila C=7", m); }
    { vector<bool> p(9, false); p[0] = true; for (int x : {4, 5}) for (int s = x; s <= 8; s++) if (p[s - x]) p[s] = true; linhab("quiz frente {4,5}", p);
      vector<bool> r(9, false); r[0] = true; for (int x : {4, 5}) for (int s = 8; s >= x; s--) if (r[s - x]) r[s] = true; linhab("quiz tras {4,5}", r); }
    { vector<ll> q(7, 0); q[0] = 1; for (int x : {1, 2, 3}) for (int s = 6; s >= x; s--) q[s] += q[s - x]; linha("quiz contagem {1,2,3}", q); }
    printf("operacoes n=1000 C=1e5: %lld | n=100 C=1e9: %lld\n", 1000LL * 100000, 100LL * 1000000000);
}
