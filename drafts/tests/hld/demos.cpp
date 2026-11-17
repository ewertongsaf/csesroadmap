// Confere os números citados no texto: tamanhos, filhos pesados, cadeias, posições, trechos das perguntas, contraexemplos e quiz.
#include <bits/stdc++.h>
using namespace std;
int n; vector<vector<pair<int,int>>> adj; vector<int> c, pai, prof, tam, pes, cab, pos, ac, baixo, val; int prox; int modoDfs = 0;
void dfs1(int v, int p) { pai[v] = p; tam[v] = 1; for (auto [u, id] : adj[v]) { if (u == p) continue; prof[u] = prof[v] + 1; ac[u] = id; dfs1(u, v); tam[v] += tam[u]; if (pes[v] == 0 || tam[u] > tam[pes[v]]) pes[v] = u; } }
void dfs2(int v, int h) { cab[v] = h; pos[v] = ++prox;
    if (modoDfs == 1) { for (auto [u, id] : adj[v]) if (u != pai[v]) dfs2(u, u == pes[v] ? h : u); return; }  // ordem da lista, não o pesado primeiro
    if (pes[v]) dfs2(pes[v], h);
    for (auto [u, id] : adj[v]) if (u != pai[v] && u != pes[v]) dfs2(u, u); }
void monta(int nn, vector<array<int,3>> E) { n = nn; adj.assign(n + 1, {}); c.assign(n, 0); for (int i = 1; i < n; i++) { auto [a, b, w] = E[i - 1]; c[i] = w; adj[a].push_back({b, i}); adj[b].push_back({a, i}); }
    pai.assign(n + 1, 0); prof.assign(n + 1, 0); tam.assign(n + 1, 0); pes.assign(n + 1, 0); cab.assign(n + 1, 0); pos.assign(n + 1, 0); ac.assign(n + 1, 0); baixo.assign(n, 0); val.assign(n + 2, 0); prox = 0;
    dfs1(1, 0); dfs2(1, 1); for (int v = 2; v <= n; v++) { val[pos[v]] = c[ac[v]]; baixo[ac[v]] = v; } }
int mx(int a, int b) { int r = 0; for (int i = a; i <= b; i++) r = max(r, val[i]); return r; }
int cam(int a, int b, bool tr, int modo = 0, int* trechos = nullptr) { int r = 0, cnt = 0; int guard = 0;
    while (cab[a] != cab[b]) { if (++guard > 4 * n) return -999;
        if (modo == 2 ? prof[a] < prof[b] : prof[cab[a]] < prof[cab[b]]) swap(a, b);
        int x = mx(pos[cab[a]], pos[a]); if (tr) printf("   trecho %d..%d (de %d ate o topo %d): max %d\n", pos[cab[a]], pos[a], a, cab[a], x); r = max(r, x); cnt++; a = pai[cab[a]]; if (a == 0) return -999; }
    if (prof[a] > prof[b]) swap(a, b);
    if (modo == 1) { int x = mx(pos[a], pos[b]); if (tr) printf("   mesma cadeia, %d..%d (incluindo o LCA): max %d\n", pos[a], pos[b], x); r = max(r, x); cnt++; }
    else if (a != b) { int x = mx(pos[a] + 1, pos[b]); if (tr) printf("   mesma cadeia, %d..%d (LCA %d fica de fora): max %d\n", pos[a] + 1, pos[b], a, x); r = max(r, x); cnt++; }
    else if (tr) printf("   mesma cadeia e a == b (LCA %d): nada a somar\n", a);
    if (trechos) *trechos = cnt;
    return r; }
int bruto(int x, int y) { vector<int> best(n + 1, -1); best[x] = 0; vector<int> st = {x}; while (!st.empty()) { int v = st.back(); st.pop_back(); for (auto [u, id] : adj[v]) if (best[u] < 0) { best[u] = max(best[v], c[id]); st.push_back(u); } } return best[y]; }
int main() {
    vector<array<int,3>> E = {{1,2,4},{2,3,1},{3,4,3},{4,5,2},{5,6,5},{6,7,1},{3,8,2},{8,9,6},{5,10,3},{10,11,2},{1,12,7}};
    monta(12, E);
    printf("v pai prof tam pesado cabeca pos trilhaAcima\n"); for (int v = 1; v <= n; v++) printf("%d %d %d %d %d %d %d %d\n", v, pai[v], prof[v], tam[v], pes[v], cab[v], pos[v], ac[v]);
    printf("vetor por posicao (vertice:custo):"); vector<int> quem(n + 1); for (int v = 1; v <= n; v++) quem[pos[v]] = v; for (int i = 1; i <= n; i++) printf(" %d:%d", quem[i], val[i]); puts("");
    vector<tuple<char,int,int>> ev = {{'Q',7,9},{'Q',11,12},{'M',8,1},{'Q',7,9},{'M',5,8},{'Q',6,10},{'Q',4,4}};
    for (auto [t, x, y] : ev) { if (t == 'M') { c[x] = y; val[pos[baixo[x]]] = y; printf("M %d %d: trilha %d (vertice de baixo %d, posicao %d) passa a %d\n", x, y, x, baixo[x], pos[baixo[x]], y); }
        else { printf("Q %d %d:\n", x, y); int r = cam(x, y, true); printf("  = %d (bruto %d)\n", r, bruto(x, y)); } }
    // contraexemplos no exemplo (estado final) e numa busca
    monta(12, E);
    printf("incluindo o LCA:"); for (auto [t, x, y] : ev) if (t == 'Q') printf(" Q%d%d=%d(certo %d)", x, y, cam(x, y, false, 1), bruto(x, y)); puts("");
    printf("comparando prof dos vertices:"); for (auto [t, x, y] : ev) if (t == 'Q') printf(" Q%d%d=%d(certo %d)", x, y, cam(x, y, false, 2), bruto(x, y)); puts("");
    { int ach = 0; for (int a = 1; a <= n && ach < 3; a++) for (int b = 1; b <= n && ach < 3; b++) { int w = cam(a, b, false, 2); if (w != bruto(a, b)) { ach++; printf("  prof dos vertices erra em Q %d %d: %d (certo %d)\n", a, b, w, bruto(a, b)); } } if (!ach) puts("  prof dos vertices nao erra no exemplo"); }
    { int ach = 0; for (int a = 1; a <= n && ach < 3; a++) for (int b = 1; b <= n && ach < 3; b++) { int w = cam(a, b, false, 1); if (w != bruto(a, b)) { ach++; printf("  incluir LCA erra em Q %d %d: %d (certo %d)\n", a, b, w, bruto(a, b)); } } }
    modoDfs = 1; monta(12, E); { int ach = 0; printf("sem o pesado primeiro: pos"); for (int v = 1; v <= n; v++) printf(" %d", pos[v]); puts(""); for (int a = 1; a <= n && ach < 3; a++) for (int b = 1; b <= n && ach < 3; b++) { int w = cam(a, b, false); if (w != bruto(a, b)) { ach++; printf("  sem o pesado primeiro erra em Q %d %d: %d (certo %d)\n", a, b, w, bruto(a, b)); } } if (!ach) puts("  nao erra"); } modoDfs = 0;
    { modoDfs = 1; mt19937 rng(21); bool ok = false; for (int nn = 3; nn <= 7 && !ok; nn++) for (int it = 0; it < 4000 && !ok; it++) { vector<array<int,3>> F; for (int v = 2; v <= nn; v++) F.push_back({(int)(rng() % (v - 1)) + 1, v, (int)(rng() % 9) + 1}); monta(nn, F);
        for (int a = 1; a <= nn && !ok; a++) for (int b = 1; b <= nn && !ok; b++) { int w = cam(a, b, false); if (w != bruto(a, b)) { ok = true; printf("sem o pesado primeiro (n=%d):", nn); for (auto e : F) printf(" %d-%d(%d)", e[0], e[1], e[2]); printf(" | pesado de 1 = %d; pos:", pes[1]); for (int v = 1; v <= nn; v++) printf(" %d", pos[v]); printf(" | Q %d %d = %d (certo %d)\n", a, b, w, bruto(a, b)); } } } modoDfs = 0; }
    // estresse do certo e contagem de trechos
    { mt19937 rng(4); for (int it = 0; it < 1500; it++) { int nn = rng() % 14 + 1; vector<array<int,3>> F; for (int v = 2; v <= nn; v++) F.push_back({(int)(rng() % (v - 1)) + 1, v, (int)(rng() % 9) + 1}); monta(nn, F); for (int a = 1; a <= nn; a++) for (int b = 1; b <= nn; b++) if (cam(a, b, false) != bruto(a, b)) { puts("HLD DIFERENTE"); return 1; } } puts("estresse da consulta ok"); }
    { int N = 200000; vector<array<int,3>> F; mt19937 rng(8); for (int v = 2; v <= N; v++) F.push_back({(int)(rng() % (v - 1)) + 1, v, 1}); monta(N, F); int mxT = 0; for (int it = 0; it < 20000; it++) { int a = rng() % N + 1, b = rng() % N + 1, t; cam(a, b, false, 0, &t); mxT = max(mxT, t); } printf("arvore aleatoria de 2e5: no maximo %d trechos por pergunta (amostra de 2e4)\n", mxT); }
    { int N = (1 << 17) - 1; vector<array<int,3>> F; for (int v = 2; v <= N; v++) F.push_back({v / 2, v, 1}); monta(N, F); int mxT = 0; mt19937 rng(9); for (int it = 0; it < 20000; it++) { int a = rng() % N + 1, b = rng() % N + 1, t; cam(a, b, false, 0, &t); mxT = max(mxT, t); } printf("binaria completa n=%d: no maximo %d trechos (amostra)\n", N, mxT); }
}
