// Confere os números citados no texto: P e C de cada clareira, a ordem do rerooting, contraexemplos e quiz.
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
int n; vector<ll> pop_, P, C, R; ll tot; vector<vector<pair<int,int>>> adj; vector<int> ordemDesce, ordemSobe;
void desce(int v, int pa) { P[v] = pop_[v]; C[v] = 0; for (auto [u, w] : adj[v]) if (u != pa) { desce(u, v); P[v] += P[u]; C[v] += C[u] + P[u] * w; } ordemDesce.push_back(v); }
void sobe(int v, int pa, int modo) { for (auto [u, w] : adj[v]) if (u != pa) { ordemSobe.push_back(u);
        if (modo == 0) R[u] = R[v] - P[u] * w + (tot - P[u]) * w; else if (modo == 1) R[u] = C[u]; else R[u] = R[v] - P[u] * w + (tot - P[u]) * w + 0 * w; 
        if (modo == 0) printf("  %d -> %d (trilha %d): %lld - %lld*%d + (%lld-%lld)*%d = %lld\n", v, u, w, R[v], P[u], w, tot, P[u], w, R[u]);
        sobe(u, v, modo); } }
void monta(vector<ll> p, vector<array<int,3>> E) { n = p.size() - 1; pop_ = p; tot = 0; for (int v = 1; v <= n; v++) tot += p[v]; adj.assign(n + 1, {}); for (auto e : E) { adj[e[0]].push_back({e[1], e[2]}); adj[e[1]].push_back({e[0], e[2]}); } P.assign(n + 1, 0); C.assign(n + 1, 0); R.assign(n + 1, 0); ordemDesce.clear(); ordemSobe.clear(); }
vector<ll> bruto() { vector<ll> out(n + 1); for (int s = 1; s <= n; s++) { vector<ll> d(n + 1, -1); d[s] = 0; vector<int> st = {s}; while (!st.empty()) { int v = st.back(); st.pop_back(); for (auto [u, w] : adj[v]) if (d[u] < 0) { d[u] = d[v] + w; st.push_back(u); } } for (int v = 1; v <= n; v++) out[s] += pop_[v] * d[v]; } return out; }
int main() {
    vector<array<int,3>> E = {{1,2,3},{1,3,2},{2,4,4},{2,5,1},{3,6,5},{6,7,2},{6,8,1}};
    monta({0, 2, 1, 3, 1, 2, 1, 4, 1}, E);
    desce(1, 0); printf("total %lld\nordem da volta:", tot); for (int v : ordemDesce) printf(" %d", v); puts("");
    printf("v P C\n"); for (int v = 1; v <= n; v++) printf("%d %lld %lld\n", v, P[v], C[v]);
    R[1] = C[1]; puts("rerooting:"); sobe(1, 0, 0);
    auto b = bruto(); printf("resp:"); for (int v = 1; v <= n; v++) printf(" %lld", R[v]); printf("\nbruto:"); for (int v = 1; v <= n; v++) printf(" %lld", b[v]); puts("");
    { int m = 1; for (int v = 2; v <= n; v++) if (R[v] < R[m]) m = v; printf("melhor clareira %d custo %lld\n", m, R[m]); }
    // contraexemplo: usar só C[u] (esquece quem está fora da subárvore)
    { vector<ll> keep = R; for (int v = 2; v <= n; v++) R[v] = C[v]; printf("so C[v]:"); for (int v = 1; v <= n; v++) printf(" %lld", R[v]); puts(""); R = keep; }
    // contraexemplo: tamanho (número de clareiras) em vez de população no rerooting
    { vector<int> T(n + 1); function<void(int,int)> t = [&](int v, int pa) { T[v] = 1; for (auto [u, w] : adj[v]) if (u != pa) { t(u, v); T[v] += T[u]; } }; t(1, 0); vector<ll> X(n + 1); X[1] = C[1];
      function<void(int,int)> s = [&](int v, int pa) { for (auto [u, w] : adj[v]) if (u != pa) { X[u] = X[v] + (ll)(n - 2 * T[u]) * w; s(u, v); } }; s(1, 0); printf("com tamanho em vez de populacao:"); for (int v = 1; v <= n; v++) printf(" %lld", X[v]); puts(""); }
    // quiz: caminho 1-2-3 pesos 1, pops 1 1 1 e 5 1 1
    { monta({0, 1, 1, 1}, {{1,2,1},{2,3,1}}); desce(1, 0); R[1] = C[1]; sobe(1, 0, 2); printf("quiz caminho 1-2-3 pops 1 1 1: P %lld %lld %lld C %lld %lld %lld resp %lld %lld %lld\n", P[1], P[2], P[3], C[1], C[2], C[3], R[1], R[2], R[3]); }
    { monta({0, 5, 1, 1}, {{1,2,1},{2,3,1}}); desce(1, 0); R[1] = C[1]; sobe(1, 0, 2); printf("quiz caminho pops 5 1 1: resp %lld %lld %lld\n", R[1], R[2], R[3]); }
    { monta({0, 1, 2, 3, 4}, {{1,2,2},{1,3,1},{1,4,3}}); desce(1, 0); R[1] = C[1]; sobe(1, 0, 2); printf("quiz estrela centro 1 pops 1 2 3 4 pesos 2 1 3: P %lld %lld %lld %lld C1 %lld resp %lld %lld %lld %lld\n", P[1], P[2], P[3], P[4], C[1], R[1], R[2], R[3], R[4]); }
    // estresse do contraexemplo de tamanho: quando difere
}
