// O trecho "dois estados" do texto, copiado, e testado contra força bruta em todos os subconjuntos.
#include <bits/stdc++.h>
using namespace std;
int n;
vector<long long> val;
vector<vector<pair<int, int>>> adj;
vector<array<long long, 2>> dp;                // dp[v][0]: v sem barraca; dp[v][1]: v com barraca

void calcula(int v, int pai) {
    dp[v][0] = 0;
    dp[v][1] = val[v];
    for (auto [u, w] : adj[v]) {
        if (u == pai) continue;
        calcula(u, v);
        dp[v][0] += max(dp[u][0], dp[u][1]);   // v vazia: o filho escolhe o que for melhor
        dp[v][1] += dp[u][0];                  // v com barraca: o filho não pode ter
    }
}

int main() {
    n = 8; val = {0, 2, 1, 3, 1, 2, 1, 4, 1}; adj.assign(n + 1, {});
    int E[7][3] = {{1,2,3},{1,3,2},{2,4,4},{2,5,1},{3,6,5},{6,7,2},{6,8,1}};
    for (auto& e : E) { adj[e[0]].push_back({e[1], e[2]}); adj[e[1]].push_back({e[0], e[2]}); }
    dp.assign(n + 1, {0, 0}); calcula(1, 0);
    printf("v dp0 dp1\n"); for (int v = 1; v <= n; v++) printf("%d %lld %lld\n", v, dp[v][0], dp[v][1]);
    printf("resposta %lld\n", max(dp[1][0], dp[1][1]));
    mt19937 rng(6);
    for (int it = 0; it < 3000; it++) {
        n = rng() % 10 + 1; val.assign(n + 1, 0); adj.assign(n + 1, {}); vector<pair<int,int>> ed;
        for (int v = 1; v <= n; v++) val[v] = rng() % 10;
        for (int v = 2; v <= n; v++) { int p = rng() % (v - 1) + 1; adj[p].push_back({v, 1}); adj[v].push_back({p, 1}); ed.push_back({p, v}); }
        dp.assign(n + 1, {0, 0}); calcula(1, 0);
        long long b = 0;
        for (int m = 0; m < (1 << n); m++) { bool ok = true; for (auto [x, y] : ed) if ((m >> (x - 1) & 1) && (m >> (y - 1) & 1)) ok = false; if (!ok) continue; long long s = 0; for (int v = 1; v <= n; v++) if (m >> (v - 1) & 1) s += val[v]; b = max(b, s); }
        if (b != max(dp[1][0], dp[1][1])) { puts("BARRACAS DIFERENTE"); return 1; }
    }
    puts("barracas: estresse ok");
}
