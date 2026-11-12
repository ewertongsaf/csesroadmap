// Confere os números citados no texto da aula e testa os trechos menores (grid, ciclo, duas cores) contra força bruta.
#include <bits/stdc++.h>
using namespace std;

int n; vector<vector<int>> viz; vector<bool> vis; int prof = 0;
void dfs_log(int u) {
    vis[u] = true; printf("%*sdfs(%d): vizinhos", prof * 2, "", u); for (int v : viz[u]) printf(" %d", v); puts("");
    for (int v : viz[u]) { if (!vis[v]) { printf("%*s  %d -> %d novo\n", prof * 2, "", u, v); prof++; dfs_log(v); prof--; } else printf("%*s  %d -> %d ja visitado\n", prof * 2, "", u, v); }
    printf("%*sfim de dfs(%d)\n", prof * 2, "", u);
}

// --- grid ---
int R, Cc; vector<string> g; vector<vector<bool>> gv;
const int dl[] = {-1, 1, 0, 0}, dc[] = {0, 0, -1, 1};
void inunda(int l, int c) {
    gv[l][c] = true;
    for (int d = 0; d < 4; d++) { int nl = l + dl[d], nc = c + dc[d];
        if (nl < 0 || nl >= R || nc < 0 || nc >= Cc) continue;
        if (g[nl][nc] != '#' || gv[nl][nc]) continue;
        inunda(nl, nc); }
}
int ilhas(vector<string> grid) { g = grid; R = g.size(); Cc = g[0].size(); gv.assign(R, vector<bool>(Cc, false)); int k = 0;
    for (int l = 0; l < R; l++) for (int c = 0; c < Cc; c++) if (g[l][c] == '#' && !gv[l][c]) { k++; inunda(l, c); }
    return k; }
int ilhas_brute(vector<string> grid) { // rótulos que se propagam até estabilizar
    int r = grid.size(), c = grid[0].size(); vector<vector<int>> id(r, vector<int>(c, -1)); int k = 0;
    for (int i = 0; i < r; i++) for (int j = 0; j < c; j++) if (grid[i][j] == '#') id[i][j] = k++;
    bool mud = true; while (mud) { mud = false; for (int i = 0; i < r; i++) for (int j = 0; j < c; j++) if (id[i][j] >= 0) for (int d = 0; d < 4; d++) { int a = i + dl[d], b = j + dc[d]; if (a < 0 || a >= r || b < 0 || b >= c || id[a][b] < 0) continue; if (id[a][b] < id[i][j]) { id[i][j] = id[a][b]; mud = true; } } }
    set<int> s; for (auto& row : id) for (int x : row) if (x >= 0) s.insert(x); return s.size(); }

// --- ciclo e duas cores ---
vector<int> cor; bool temCiclo, duasCores;
void dfs2(int u, int pai) {
    for (int v : viz[u]) {
        if (cor[v] == -1) { cor[v] = 1 - cor[u]; dfs2(v, u); }
        else { if (v != pai) temCiclo = true; if (cor[v] == cor[u]) duasCores = false; }
    }
}
void analisa() { cor.assign(n + 1, -1); temCiclo = false; duasCores = true; for (int u = 1; u <= n; u++) if (cor[u] == -1) { cor[u] = 0; dfs2(u, 0); } }

int main() {
    n = 8; viz.assign(n + 1, {}); vector<pair<int,int>> ar = {{1,2},{1,3},{2,4},{3,4},{5,6},{6,7}};
    for (auto [a, b] : ar) { viz[a].push_back(b); viz[b].push_back(a); }
    for (int u = 1; u <= n; u++) { printf("viz[%d]:", u); for (int v : viz[u]) printf(" %d", v); puts(""); }
    vis.assign(n + 1, false); dfs_log(1);
    analisa(); printf("exemplo: ciclo=%d duasCores=%d cores:", (int)temCiclo, (int)duasCores); for (int u = 1; u <= n; u++) printf(" %d", cor[u]); puts("");
    // triângulo
    n = 3; viz.assign(4, {}); for (auto [a, b] : vector<pair<int,int>>{{1,2},{2,3},{1,3}}) { viz[a].push_back(b); viz[b].push_back(a); }
    analisa(); printf("triangulo: ciclo=%d duasCores=%d\n", (int)temCiclo, (int)duasCores);
    n = 3; viz.assign(4, {}); for (auto [a, b] : vector<pair<int,int>>{{1,2},{2,3}}) { viz[a].push_back(b); viz[b].push_back(a); }
    analisa(); printf("caminho 1-2-3: ciclo=%d duasCores=%d\n", (int)temCiclo, (int)duasCores);
    // grid do texto
    vector<string> mapa = {"##..#", "#...#", "..#..", "##..#"};
    printf("ilhas do mapa: %d\n", ilhas(mapa));
    printf("matriz n=1e5: %lld casas | n=2e5 m=2e5 lista: %d entradas\n", 100000LL * 100000, 2 * 200000);
    // testes aleatórios
    mt19937 rng(5);
    for (int t = 0; t < 3000; t++) {
        int r = rng() % 5 + 1, c = rng() % 5 + 1; vector<string> gr(r, string(c, '.')); for (auto& row : gr) for (char& ch : row) if (rng() % 2) ch = '#';
        assert(ilhas(gr) == ilhas_brute(gr));
        n = rng() % 7 + 1; int mm = rng() % 9; set<pair<int,int>> es; viz.assign(n + 1, {});
        for (int i = 0; i < mm; i++) { int a = rng() % n + 1, b = rng() % n + 1; if (a == b) continue; if (a > b) swap(a, b); if (es.insert({a, b}).second) { viz[a].push_back(b); viz[b].push_back(a); } }
        analisa();
        // força bruta: ciclo <=> arestas > n - componentes ; duas cores <=> existe coloração
        vector<int> p(n + 1); iota(p.begin(), p.end(), 0); function<int(int)> f = [&](int x) { return p[x] == x ? x : p[x] = f(p[x]); }; int comps = n; for (auto [a, b] : es) { int x = f(a), y = f(b); if (x != y) { p[x] = y; comps--; } }
        assert(temCiclo == ((int)es.size() > n - comps));
        bool ok = false; for (int mask = 0; mask < (1 << n) && !ok; mask++) { bool good = true; for (auto [a, b] : es) if (((mask >> (a - 1)) & 1) == ((mask >> (b - 1)) & 1)) good = false; ok = good; }
        assert(duasCores == ok);
    }
    puts("aleatorios (grid, ciclo, duas cores) ok");
}
