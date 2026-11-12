// Confere os números citados no texto da aula e testa os trechos menores (grid, várias fontes, estados, caminho) contra força bruta.
#include <bits/stdc++.h>
using namespace std;

const int dl[] = {-1, 1, 0, 0}, dc[] = {0, 0, -1, 1};
vector<vector<int>> bfs_grid(const vector<string>& g, char fonte) {
    int R = g.size(), C = g[0].size(); vector<vector<int>> d(R, vector<int>(C, -1)); queue<pair<int,int>> q;
    for (int l = 0; l < R; l++) for (int c = 0; c < C; c++) if (g[l][c] == fonte) { d[l][c] = 0; q.push({l, c}); }
    while (!q.empty()) { auto [l, c] = q.front(); q.pop();
        for (int k = 0; k < 4; k++) { int nl = l + dl[k], nc = c + dc[k];
            if (nl < 0 || nl >= R || nc < 0 || nc >= C) continue;
            if (g[nl][nc] == '#' || d[nl][nc] != -1) continue;
            d[nl][nc] = d[l][c] + 1; q.push({nl, nc}); } }
    return d;
}
vector<vector<int>> relax_grid(const vector<string>& g, char fonte) { // força bruta: relaxa até estabilizar
    int R = g.size(), C = g[0].size(); const int INF = 1e9; vector<vector<int>> d(R, vector<int>(C, INF));
    for (int l = 0; l < R; l++) for (int c = 0; c < C; c++) if (g[l][c] == fonte) d[l][c] = 0;
    bool mud = true; while (mud) { mud = false; for (int l = 0; l < R; l++) for (int c = 0; c < C; c++) if (g[l][c] != '#') for (int k = 0; k < 4; k++) { int nl = l + dl[k], nc = c + dc[k]; if (nl < 0 || nl >= R || nc < 0 || nc >= C || g[nl][nc] == '#') continue; if (d[nl][nc] + 1 < d[l][c]) { d[l][c] = d[nl][nc] + 1; mud = true; } } }
    for (auto& r : d) for (int& x : r) if (x == INF) x = -1;
    return d;
}
void show(const vector<vector<int>>& d, const vector<string>& g) { for (size_t l = 0; l < d.size(); l++) { for (size_t c = 0; c < d[l].size(); c++) { if (g[l][c] == '#') printf("  #"); else if (d[l][c] < 0) printf("  ."); else printf(" %2d", d[l][c]); } puts(""); } }

int botoes(int a, int b, int lim) { vector<int> d(lim + 1, -1); queue<int> q; d[a] = 0; q.push(a);
    while (!q.empty()) { int x = q.front(); q.pop(); for (int y : {x + 1, x * 2}) if (y <= lim && d[y] == -1) { d[y] = d[x] + 1; q.push(y); } } return d[b]; }

int main() {
    int n = 7; vector<vector<int>> viz(n + 1); for (auto [a, b] : vector<pair<int,int>>{{1,2},{1,3},{2,4},{3,4},{4,5},{5,6}}) { viz[a].push_back(b); viz[b].push_back(a); }
    // traço da fila
    vector<int> d(n + 1, -1), pai(n + 1, 0); queue<int> q; d[1] = 0; q.push(1);
    auto fila = [&]() { queue<int> c = q; string s; while (!c.empty()) { s += to_string(c.front()) + " "; c.pop(); } return s.empty() ? string("(vazia)") : s; };
    printf("inicio | fila: %s\n", fila().c_str());
    while (!q.empty()) { int u = q.front(); q.pop(); string novos;
        for (int v : viz[u]) if (d[v] == -1) { d[v] = d[u] + 1; pai[v] = u; q.push(v); novos += to_string(v) + "(min " + to_string(d[v]) + ") "; }
        printf("tira %d (min %d) | novos: %s| fila: %s\n", u, d[u], novos.empty() ? "nenhum " : novos.c_str(), fila().c_str()); }
    printf("minutos:"); for (int u = 1; u <= n; u++) printf(" %d", d[u]); printf(" | pai:"); for (int u = 1; u <= n; u++) printf(" %d", pai[u]); puts("");
    { vector<int> cam; for (int u = 6; u != 0; u = pai[u]) cam.push_back(u); reverse(cam.begin(), cam.end()); printf("caminho ate 6:"); for (int x : cam) printf(" %d", x); puts(""); }
    // profundidade da DFS como "distância" (errado)
    { vector<int> prof(n + 1, -1); function<void(int,int)> dfs = [&](int u, int p) { prof[u] = p; for (int v : viz[u]) if (prof[v] == -1) dfs(v, p + 1); }; dfs(1, 0); printf("profundidade DFS:"); for (int u = 1; u <= n; u++) printf(" %d", prof[u]); puts(""); }
    // marcar só ao tirar da fila: quantas vezes cada vértice entra
    { vector<bool> vis(n + 1, false); queue<int> f; f.push(1); vector<int> entradas(n + 1, 0); entradas[1] = 1; int total = 1;
      while (!f.empty()) { int u = f.front(); f.pop(); if (vis[u]) continue; vis[u] = true; for (int v : viz[u]) if (!vis[v]) { f.push(v); entradas[v]++; total++; } }
      printf("marcando ao tirar: entradas na fila:"); for (int u = 1; u <= n; u++) printf(" %d", entradas[u]); printf(" | total %d\n", total); }
    // grid do texto
    vector<string> g = {"S..#.", ".#...", ".#.#.", "...#."};
    puts("grid, uma fonte:"); show(bfs_grid(g, 'S'), g);
    vector<string> g2 = {"F..#.", ".#...", ".#.#.", "...#F"};
    puts("grid, duas fontes:"); show(bfs_grid(g2, 'F'), g2);
    printf("botoes 2->11: %d | 3->10: %d | 1->9: %d | 5->8: %d\n", botoes(2, 11, 40), botoes(3, 10, 40), botoes(1, 9, 40), botoes(5, 8, 40));
    // aleatórios: grid com 1 ou várias fontes
    mt19937 rng(3);
    for (int t = 0; t < 3000; t++) { int R = rng() % 5 + 1, C = rng() % 5 + 1; vector<string> gr(R, string(C, '.')); for (auto& row : gr) for (char& ch : row) { int x = rng() % 6; ch = x < 2 ? '#' : x == 2 ? 'F' : '.'; }
        assert(bfs_grid(gr, 'F') == relax_grid(gr, 'F')); }
    puts("aleatorios (grid, varias fontes) ok");
}
