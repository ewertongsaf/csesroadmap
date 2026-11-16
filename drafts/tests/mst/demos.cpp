// Confere os números citados no texto da aula (traço de Kruskal, contraexemplos, contagem de árvores, quiz).
#include <bits/stdc++.h>
using namespace std;
typedef long long ll; typedef vector<array<ll,3>> Es;   // {a, b, custo}

ll kruskal(int n, Es es, bool log, bool maior = false) {
    sort(es.begin(), es.end(), [&](auto& x, auto& y) { return maior ? x[2] > y[2] : (x[2] != y[2] ? x[2] < y[2] : x < y); });
    vector<int> p(n + 1); iota(p.begin(), p.end(), 0); function<int(int)> f = [&](int x) { return p[x] == x ? x : p[x] = f(p[x]); };
    ll tot = 0; int us = 0;
    for (auto& e : es) { int a = f(e[0]), b = f(e[1]); bool ok = a != b; if (ok) { p[a] = b; tot += e[2]; us++; }
        if (log) { map<int, vector<int>> g; for (int i = 1; i <= n; i++) g[f(i)].push_back(i); string gs; for (auto& [r, v] : g) { gs += "{"; for (size_t i = 0; i < v.size(); i++) gs += (i ? "," : "") + to_string(v[i]); gs += "} "; }
            printf("%lld-%lld (%lld): %s | total %lld | grupos: %s\n", e[0], e[1], e[2], ok ? "ENTRA" : "fecha ciclo, fora", tot, gs.c_str()); } }
    if (log) printf("usados %d de %d necessarios, total %lld\n", us, n - 1, tot);
    return us == n - 1 ? tot : -1;
}

int main() {
    Es es = {{1,2,4},{1,3,2},{2,3,1},{2,4,5},{3,4,8},{3,5,10},{4,5,3}};
    kruskal(5, es, true);
    // guloso errado: cada bairro escolhe o trecho mais barato que sai dele
    { map<pair<ll,ll>, ll> esc; for (int u = 1; u <= 5; u++) { array<ll,3> b = {0, 0, LLONG_MAX}; for (auto& e : es) if ((e[0] == u || e[1] == u) && e[2] < b[2]) b = e; esc[{b[0], b[1]}] = b[2]; printf("bairro %d escolhe %lld-%lld (%lld)\n", u, b[0], b[1], b[2]); }
      ll t = 0; printf("escolhidos:"); for (auto& [k, w] : esc) { printf(" %lld-%lld", k.first, k.second); t += w; } printf(" | custo %lld | %zu trechos\n", t, esc.size()); }
    // árvore de caminhos mínimos x MST no triângulo
    { Es tri = {{1,2,2},{1,3,2},{2,3,1}}; printf("triangulo: MST = %lld ; arvore de caminhos minimos a partir de 1 = 1-2 + 1-3 = 4\n", kruskal(3, tri, false)); }
    // quantas árvores geradoras tem o exemplo (subconjuntos de 4 trechos que conectam)
    { int cnt = 0; ll best = LLONG_MAX, second = LLONG_MAX; for (int mask = 0; mask < (1 << 7); mask++) if (__builtin_popcount(mask) == 4) { Es sub; ll c = 0; for (int i = 0; i < 7; i++) if (mask >> i & 1) { sub.push_back(es[i]); c += es[i][2]; } if (kruskal(5, sub, false) != -1) { cnt++; if (c < best) { second = best; best = c; } else if (c < second) second = c; } }
      printf("arvores geradoras do exemplo: %d ; melhor %lld ; segunda melhor %lld\n", cnt, best, second); }
    printf("desconexo: %lld\n", kruskal(4, {{1,2,3},{3,4,1}}, false));
    printf("maior arvore geradora do exemplo: %lld\n", kruskal(5, es, false, true));
    puts("quiz A:"); kruskal(4, {{1,2,3},{2,3,1},{3,4,4},{1,3,2},{2,4,6}}, true);
    puts("quiz B (empate):"); kruskal(3, {{1,2,5},{2,3,5},{1,3,5}}, true);
    printf("arvores num grafo completo de n=10: 10^8 = %lld (formula n^(n-2))\n", 100000000LL);
}
