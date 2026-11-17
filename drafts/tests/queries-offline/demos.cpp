// Confere os números citados no texto da aula: a varredura passo a passo, os contraexemplos, o exemplo com DSU e o quiz.
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
struct B { int n; vector<ll> t; B(int n_) : n(n_), t(n_ + 1, 0) {} void add(int k, ll x) { for (; k <= n; k += k & -k) t[k] += x; } ll sum(int k) { ll s = 0; for (; k > 0; k -= k & -k) s += t[k]; return s; } };
vector<int> P = {0, 4, 7, 2, 9, 5, 3, 8, 6};
vector<array<int,3>> Q = {{2, 6, 5}, {1, 8, 3}, {3, 7, 8}, {1, 4, 6}, {5, 8, 5}, {4, 4, 8}};
// modo 0 certo; 1 perguntas antes dos produtos de mesmo preço (<); 2 imprime na ordem ordenada
vector<ll> roda(int modo, bool tr) { int n = 8, q = Q.size(); vector<pair<int,int>> it; for (int i = 1; i <= n; i++) it.push_back({P[i], i}); sort(it.begin(), it.end());
    vector<int> ord(q); iota(ord.begin(), ord.end(), 0); stable_sort(ord.begin(), ord.end(), [&](int a, int b) { return Q[a][2] < Q[b][2]; });
    B f(n); vector<ll> resp(q), sorted; int p = 0; vector<int> aceso(n + 1, 0);
    for (int j : ord) { int x = Q[j][2];
        while (p < n && (modo == 1 ? it[p].first < x : it[p].first <= x)) { f.add(it[p].second, it[p].first); aceso[it[p].second] = 1;
            if (tr) { printf("  acende posicao %d (preco %d) | acesos:", it[p].second, it[p].first); for (int i = 1; i <= n; i++) printf(" %s", aceso[i] ? to_string(P[i]).c_str() : "."); puts(""); } p++; }
        ll r = f.sum(Q[j][1]) - f.sum(Q[j][0] - 1); resp[j] = r; sorted.push_back(r);
        if (tr) printf("  pergunta %d (%d..%d, ate %d) = %lld\n", j + 1, Q[j][0], Q[j][1], x, r); }
    return modo == 2 ? sorted : resp; }
int main() {
    puts("certo, passo a passo:"); auto r = roda(0, true); printf("saida:"); for (ll x : r) printf(" %lld", x); puts("");
    { printf("bruto:"); for (auto [a, b, x] : Q) { ll s = 0; for (int i = a; i <= b; i++) if (P[i] <= x) s += P[i]; printf(" %lld", s); } puts(""); }
    auto e1 = roda(1, false); printf("com < no lugar de <=:"); for (ll x : e1) printf(" %lld", x); puts("");
    auto e2 = roda(2, false); printf("sem guardar o id (ordem ordenada):"); for (ll x : e2) printf(" %lld", x); puts("");
    // pergunta com limite abaixo de tudo
    { ll s = 0; for (int i = 1; i <= 8; i++) if (P[i] <= 1) s += P[i]; printf("limite 1 no vetor todo: %lld\n", s); }
    // DSU: cabos (a, b, custo) e perguntas (a, b, x): dá para ir de a a b usando só cabos de custo <= x?
    { int n = 5; vector<array<int,3>> E = {{1, 2, 4}, {2, 3, 7}, {3, 4, 2}, {4, 5, 6}, {1, 5, 9}}; vector<array<int,3>> PQ = {{1, 3, 5}, {3, 5, 6}, {1, 3, 7}, {2, 4, 3}};
      vector<int> pai(n + 1); iota(pai.begin(), pai.end(), 0); function<int(int)> acha = [&](int x) { return pai[x] == x ? x : pai[x] = acha(pai[x]); };
      vector<array<int,3>> es = E; sort(es.begin(), es.end(), [](auto& a, auto& b) { return a[2] < b[2]; }); vector<int> ord = {0, 1, 2, 3}; sort(ord.begin(), ord.end(), [&](int a, int b) { return PQ[a][2] < PQ[b][2]; });
      vector<string> resp(4); size_t k = 0; puts("DSU:");
      for (int j : ord) { while (k < es.size() && es[k][2] <= PQ[j][2]) { pai[acha(es[k][0])] = acha(es[k][1]); printf("  une %d-%d (custo %d)\n", es[k][0], es[k][1], es[k][2]); k++; } resp[j] = acha(PQ[j][0]) == acha(PQ[j][1]) ? "SIM" : "NAO"; printf("  pergunta %d (%d, %d, ate %d): %s\n", j + 1, PQ[j][0], PQ[j][1], PQ[j][2], resp[j].c_str()); }
      printf("  saida:"); for (auto& s : resp) printf(" %s", s.c_str()); puts("");  printf("  tente (2, 5, ate 6): %s\n", [&]{ vector<int> p2(n + 1); iota(p2.begin(), p2.end(), 0); function<int(int)> f = [&](int x) { return p2[x] == x ? x : p2[x] = f(p2[x]); }; for (auto& e : E) if (e[2] <= 6) p2[f(e[0])] = f(e[1]); return f(2) == f(5) ? "SIM" : "NAO"; }()); }
    // quiz: vetor 3 1 4 1 5, perguntas
    { vector<int> w = {0, 3, 1, 4, 1, 5}; auto sq = [&](int a, int b, int x) { ll s = 0; for (int i = a; i <= b; i++) if (w[i] <= x) s += w[i]; return s; }; auto sl = [&](int a, int b, int x) { ll s = 0; for (int i = a; i <= b; i++) if (w[i] < x) s += w[i]; return s; };
      printf("quiz 3 1 4 1 5: (1,5,3)=%lld (<: %lld) (2,4,4)=%lld (<: %lld) (1,5,1)=%lld\n", sq(1, 5, 3), sl(1, 5, 3), sq(2, 4, 4), sl(2, 4, 4), sq(1, 5, 1)); }
}
