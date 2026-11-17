// Confere os números citados no texto: traço das junções, contagem de movimentos, contraexemplos e quiz.
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
int n; vector<int> tm_, pai; vector<vector<int>> ch; vector<map<int,int>> cnt; vector<int> bt, bq, id, rr; ll movs; bool tr; int modo; // modo 0 certo; 1 sempre o filho entra no pai; 2 desempate errado (ignora); 3 nao troca melhor ao juntar (recalcula so no fim? usa max sem desempate)
void put(int m, int t, int q) { int x = (cnt[m][t] += q); if (x > bq[m] || (modo != 2 && x == bq[m] && t < bt[m])) { bq[m] = x; bt[m] = t; } }
void dfs(int v) { id[v] = v; put(v, tm_[v], 1);
    for (int u : ch[v]) { dfs(u); int a = id[v], b = id[u]; bool troca = false; if (modo != 1 && cnt[a].size() < cnt[b].size()) { swap(a, b); troca = true; }
        if (tr) { printf("   %d junta %d: conjunto maior tem %zu times, menor tem %zu%s; move", v, u, cnt[a].size(), cnt[b].size(), troca ? " (troca: o do filho fica)" : ""); for (auto [t, q] : cnt[b]) printf(" t%d:%d", t, q); puts(""); }
        for (auto [t, q] : cnt[b]) { put(a, t, q); movs++; } cnt[b].clear(); id[v] = a; }
    rr[v] = bt[id[v]]; if (tr) { printf("  %d pronto: conjunto", v); for (auto [t, q] : cnt[id[v]]) printf(" t%d:%d", t, q); printf(" -> time %d (%d)\n", bt[id[v]], bq[id[v]]); } }
void roda(vector<int> t, vector<int> p, int m, bool tr_) { n = t.size() - 1; tm_ = t; pai = p; modo = m; tr = tr_; ch.assign(n + 1, {}); for (int v = 2; v <= n; v++) ch[p[v]].push_back(v); cnt.assign(n + 1, {}); bt.assign(n + 1, 0); bq.assign(n + 1, 0); id.assign(n + 1, 0); rr.assign(n + 1, 0); movs = 0; dfs(1); }
int main() {
    vector<int> T = {0, 2, 1, 3, 1, 1, 3, 2, 3}, P = {0, 0, 1, 1, 2, 2, 3, 6, 6};
    roda(T, P, 0, true); printf("resp:"); for (int v = 1; v <= n; v++) printf(" %d", rr[v]); printf(" | movimentos %lld\n", movs);
    roda(T, P, 2, false); printf("sem desempate:"); for (int v = 1; v <= n; v++) printf(" %d", rr[v]); puts("");
    // movimentos numa cadeia de 2e5 (pai = v-1), cada um com time diferente
    { int N = 5000; vector<int> t(N + 1), p(N + 1, 0); for (int v = 1; v <= N; v++) t[v] = v; for (int v = 2; v <= N; v++) p[v] = v - 1; roda(t, p, 1, false); ll ing = movs; roda(t, p, 0, false); printf("cadeia de %d, times distintos: filho sempre entra no pai = %lld movimentos (n(n-1)/2 = %lld); menor no maior = %lld\n", N, ing, (ll)N * (N - 1) / 2, movs); }
    { int N = 200000; vector<int> t(N + 1), p(N + 1, 0); for (int v = 1; v <= N; v++) t[v] = v; for (int v = 2; v <= N; v++) p[v] = v - 1; roda(t, p, 0, false); printf("cadeia de 2e5: menor no maior = %lld movimentos; o ingenuo seria %lld\n", movs, (ll)N * (N - 1) / 2); }
    // e uma "vassoura": estrela no topo... pior caso do small-to-large: arvore binaria completa
    { int N = (1 << 17) - 1; vector<int> t(N + 1), p(N + 1, 0); for (int v = 1; v <= N; v++) t[v] = v; for (int v = 2; v <= N; v++) p[v] = v / 2; roda(t, p, 0, false); ll sl = movs; roda(t, p, 1, false); printf("binaria completa n=%d: menor no maior = %lld movimentos; sempre filho no pai = %lld\n", N, sl, movs); }
    { mt19937 rng(12); bool ok = false; for (int nn = 2; nn <= 5 && !ok; nn++) for (int it = 0; it < 5000 && !ok; it++) { vector<int> t(nn + 1), p(nn + 1, 0); for (int v = 1; v <= nn; v++) t[v] = rng() % 3 + 1; for (int v = 2; v <= nn; v++) p[v] = rng() % (v - 1) + 1;
        roda(t, p, 0, false); vector<int> c0 = rr; roda(t, p, 2, false); if (rr != c0) { ok = true; printf("desempate importa (n=%d): times", nn); for (int v = 1; v <= nn; v++) printf(" %d", t[v]); printf(" chefes"); for (int v = 2; v <= nn; v++) printf(" %d", p[v]); printf(" | certo"); for (int v = 1; v <= nn; v++) printf(" %d", c0[v]); printf(" | sem desempate"); for (int v = 1; v <= nn; v++) printf(" %d", rr[v]); puts(""); } } }
    // quiz: estado do conjunto do 3
    { roda(T, P, 0, false); }
}
