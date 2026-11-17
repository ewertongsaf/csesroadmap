// Confere os números citados no texto: ordem da DFS, ent e sai, traços dos eventos, contraexemplos e quiz.
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
int n; vector<vector<int>> ch; vector<int> ent, sai, ordem; int rel = 0;
void dfs(int v) { ent[v] = ++rel; ordem.push_back(v); for (int u : ch[v]) dfs(u); sai[v] = rel; }
int main() {
    n = 8; vector<ll> sal = {0, 10, 7, 8, 5, 4, 6, 3, 2}; vector<int> pai = {0, 0, 1, 1, 2, 2, 3, 6, 6};
    ch.assign(n + 1, {}); for (int v = 2; v <= n; v++) ch[pai[v]].push_back(v); ent.assign(n + 1, 0); sai.assign(n + 1, 0); dfs(1);
    printf("ordem:"); for (int v : ordem) printf(" %d", v); puts(""); printf("v ent sai tam\n"); for (int v = 1; v <= n; v++) printf("%d %d %d %d\n", v, ent[v], sai[v], sai[v] - ent[v] + 1);
    vector<ll> dif(n + 2, 0); vector<ll> real = sal;
    auto em = [&](int v) { ll s = 0; for (int i = 1; i <= ent[v]; i++) s += dif[i]; return s; };
    struct E { char c; int v; ll x; }; vector<E> ev = {{'Q', 7, 0}, {'B', 3, 5}, {'Q', 7, 0}, {'B', 2, 2}, {'B', 1, 1}, {'Q', 5, 0}, {'Q', 6, 0}, {'Q', 1, 0}};
    for (auto e : ev) { if (e.c == 'B') { dif[ent[e.v]] += e.x; dif[sai[e.v] + 1] -= e.x; for (int u = 1; u <= n; u++) { int a = u; while (a && a != e.v) a = pai[a]; if (a == e.v) real[u] += e.x; }
            printf("B %d %lld: posicoes %d..%d; dif:", e.v, e.x, ent[e.v], sai[e.v]); for (int i = 1; i <= n + 1; i++) printf(" %lld", dif[i]); puts(""); }
        else printf("Q %d: ent %d, soma dif 1..%d = %lld, salario %lld (real %lld)\n", e.v, ent[e.v], ent[e.v], em(e.v), sal[e.v] + em(e.v), real[e.v]); }
    printf("salarios finais:"); for (int v = 1; v <= n; v++) printf(" %lld", real[v]); puts("");
    // contraexemplo: usar o número do funcionário em vez da posição (v .. v+tam-1)
    { vector<int> hit; int v = 2, tam = sai[v] - ent[v] + 1; for (int u = v; u <= v + tam - 1; u++) hit.push_back(u); printf("pelo numero: bonus de 2 iria para"); for (int u : hit) printf(" %d", u); printf(" (equipe de verdade: 2 4 5)\n"); }
    // contraexemplo: esquecer o -x no fim
    { vector<ll> d(n + 2, 0); d[ent[2]] += 2; printf("sem o -x: depois de B 2 2, ganham:"); for (int u = 1; u <= n; u++) { ll s = 0; for (int i = 1; i <= ent[u]; i++) s += d[i]; if (s) printf(" %d", u); } puts(" (deviam ganhar so 2 4 5)"); }
    // contraexemplo: sai[v]+1 vs sai[v] (sai fora do lugar)
    { vector<ll> d(n + 2, 0); d[ent[3]] += 5; d[sai[3]] -= 5; printf("com -x em sai em vez de sai+1: ganham:"); for (int u = 1; u <= n; u++) { ll s = 0; for (int i = 1; i <= ent[u]; i++) s += d[i]; if (s) printf(" %d", u); } puts(""); }
    // quiz
    printf("quiz: ent[6]=%d sai[6]=%d; ent[2]=%d sai[2]=%d; posicao 5 e de %d\n", ent[6], sai[6], ent[2], sai[2], ordem[4]);
}
