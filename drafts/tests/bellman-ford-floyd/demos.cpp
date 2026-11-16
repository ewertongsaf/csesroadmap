// Confere os números citados no texto da aula (rodadas, ciclo negativo, matrizes do Floyd-Warshall, quiz).
#include <bits/stdc++.h>
using namespace std;
typedef long long ll; const ll INF = 1e18;
string S(ll x) { return x >= INF / 2 ? "inf" : to_string(x); }
typedef vector<array<ll,3>> Es;

bool bf(int n, const Es& es, bool log, vector<ll>& dist, bool pula = true) {
    dist.assign(n + 1, INF); dist[1] = 0; bool mud = false;
    for (int r = 1; r <= n; r++) { mud = false; string s;
        for (auto& e : es) { if (pula && dist[e[0]] == INF) continue; if (dist[e[0]] + e[2] < dist[e[1]]) { s += " " + to_string(e[1]) + ":" + S(dist[e[1]]) + "->" + S(dist[e[0]] + e[2]); dist[e[1]] = dist[e[0]] + e[2]; mud = true; } }
        if (log) { printf("rodada %d:%s | dist:", r, s.empty() ? " nada" : s.c_str()); for (int u = 1; u <= n; u++) printf(" %s", S(dist[u]).c_str()); puts(""); }
        if (!mud) break; }
    return mud;
}
vector<vector<ll>> floyd(int n, const Es& es, int ordem = 0, bool log = false) {
    vector<vector<ll>> d(n + 1, vector<ll>(n + 1, INF)); for (int i = 1; i <= n; i++) d[i][i] = 0; for (auto& e : es) d[e[0]][e[1]] = min(d[e[0]][e[1]], e[2]);
    auto show = [&](const char* t) { puts(t); for (int i = 1; i <= n; i++) { for (int j = 1; j <= n; j++) printf(" %4s", S(d[i][j]).c_str()); puts(""); } };
    if (log) show("inicio");
    if (ordem == 0) { for (int k = 1; k <= n; k++) { for (int i = 1; i <= n; i++) for (int j = 1; j <= n; j++) if (d[i][k] != INF && d[k][j] != INF) d[i][j] = min(d[i][j], d[i][k] + d[k][j]); if (log) { char t[40]; snprintf(t, sizeof t, "depois de k=%d", k); show(t); } } }
    else { for (int i = 1; i <= n; i++) for (int j = 1; j <= n; j++) for (int k = 1; k <= n; k++) if (d[i][k] != INF && d[k][j] != INF) d[i][j] = min(d[i][j], d[i][k] + d[k][j]); }
    return d;
}

int main() {
    Es es = {{4,5,1},{2,4,2},{3,2,-3},{1,2,4},{1,3,5}};
    vector<ll> d; printf("sem ciclo -> ciclo? %d\n", (int)bf(5, es, true, d));
    Es boa = {{1,2,4},{1,3,5},{3,2,-3},{2,4,2},{4,5,1}}; puts("mesma coisa, estradas em outra ordem:"); bf(5, boa, true, d);
    Es ciclo = es; ciclo.push_back({5,3,-1}); printf("com 5->3 (-1) -> ciclo? %d\n", (int)bf(5, ciclo, true, d));
    // sem o teste do INF: cidade inalcançável "melhora"
    { Es x = {{2,3,-5},{1,2,7}}; Es y = {{3,4,-5},{1,2,7}}; vector<ll> a; bf(4, y, false, a, false); printf("sem pular INF: dist[4] = %lld (INF = %lld) -> %s\n", a[4], INF, a[4] == INF ? "igual a INF" : "DIFERENTE de INF"); (void)x; }
    // Floyd-Warshall
    Es fw = {{1,2,3},{2,3,1},{1,3,7},{3,4,2},{4,1,4}}; auto m = floyd(4, fw, 0, true);
    // ordem errada dos laços: procura contraexemplo pequeno
    { mt19937 rng(1); for (int t = 0; t < 20000; t++) { int n = 4; Es e; for (int i = 0; i < 5; i++) { ll a = rng() % n + 1, b = rng() % n + 1; if (a != b) e.push_back({a, b, (ll)(rng() % 9 + 1)}); } auto c = floyd(n, e, 0), w = floyd(n, e, 1); if (c != w) { printf("contraexemplo ordem i,j,k:"); for (auto& x : e) printf(" %lld->%lld(%lld)", x[0], x[1], x[2]); puts(""); for (int i = 1; i <= n; i++) for (int j = 1; j <= n; j++) if (c[i][j] != w[i][j]) printf("  d[%d][%d]: certo %s, errado %s\n", i, j, S(c[i][j]).c_str(), S(w[i][j]).c_str()); break; } } }
    { Es e = {{1,3,1},{3,2,1},{2,4,1}}; auto c = floyd(4, e, 0), w = floyd(4, e, 1); printf("cadeia 1->3->2->4: d[1][4] certo %s, com k por dentro %s\n", S(c[1][4]).c_str(), S(w[1][4]).c_str()); }
    // quiz
    { Es q = {{1,2,5},{2,3,-2},{1,3,4},{3,4,1}}; puts("quiz BF:"); bf(4, q, true, d); }
    { Es q = {{1,2,2},{2,3,2},{1,3,5},{3,1,1}}; auto r = floyd(3, q); printf("quiz FW: d[1][3]=%s d[3][2]=%s d[2][1]=%s\n", S(r[1][3]).c_str(), S(r[3][2]).c_str(), S(r[2][1]).c_str()); }
    { Es q = {{1,2,1},{2,3,-2},{3,2,1}}; printf("quiz ciclo 2->3->2 soma -1: ciclo? %d\n", (int)bf(3, q, false, d)); Es q2 = {{1,2,1},{2,3,-1},{3,2,1}}; printf("soma 0: ciclo? %d\n", (int)bf(3, q2, false, d)); }
    printf("n*m: 2500*5000=%lld | 1e5*2e5=%lld | n^3 com 500=%lld\n", 2500LL * 5000, 100000LL * 200000, 500LL * 500 * 500);
}
