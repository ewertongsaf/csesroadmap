// Confere os números citados no texto da aula (traço de Kahn, tempos, ciclo, contagem de caminhos, quiz).
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;

void kahn(int n, vector<ll> dur, vector<pair<int,int>> es, bool log) {
    vector<vector<int>> adj(n + 1); vector<int> g(n + 1, 0); for (auto [a, b] : es) { adj[a].push_back(b); g[b]++; }
    if (log) { printf("grau de entrada:"); for (int u = 1; u <= n; u++) printf(" %d", g[u]); puts(""); }
    vector<ll> ini(n + 1, 0), fim(n + 1, 0); queue<int> q; for (int u = 1; u <= n; u++) if (!g[u]) q.push(u);
    auto F = [&]() { auto c = q; string s; while (!c.empty()) { s += to_string(c.front()) + " "; c.pop(); } return s.empty() ? string("(vazia) ") : s; };
    vector<int> ordem; if (log) printf("inicio | fila: %s\n", F().c_str());
    while (!q.empty()) { int u = q.front(); q.pop(); ordem.push_back(u); fim[u] = ini[u] + dur[u]; string lib, at;
        for (int v : adj[u]) { if (fim[u] > ini[v]) { at += " ini[" + to_string(v) + "]=" + to_string(fim[u]); ini[v] = fim[u]; } if (--g[v] == 0) { q.push(v); lib += " " + to_string(v); } }
        if (log) printf("sai %d: inicio %lld, fim %lld |%s | libera:%s | fila: %s\n", u, ini[u], fim[u], at.empty() ? " -" : at.c_str(), lib.empty() ? " -" : lib.c_str(), F().c_str()); }
    printf("ordem:"); for (int x : ordem) printf(" %d", x); printf(" | feitas %zu de %d | total %lld", ordem.size(), n, *max_element(fim.begin(), fim.end()));
    if ((int)ordem.size() < n) { printf(" | presas:"); for (int u = 1; u <= n; u++) if (g[u] > 0) printf(" %d(faltam %d)", u, g[u]); }
    puts("");
}

int main() {
    vector<ll> dur = {0, 3, 2, 4, 1, 2, 3}; vector<pair<int,int>> es = {{1,3},{2,3},{2,4},{3,5},{4,5},{4,6}};
    kahn(6, dur, es, true);
    auto c = es; c.push_back({5, 2}); puts("com 5->2:"); kahn(6, dur, c, true);
    // BFS comum a partir das tarefas sem dependência NÃO é ordem válida
    { vector<vector<int>> adj(7); for (auto [a, b] : es) adj[a].push_back(b); vector<bool> vis(7, false); queue<int> q; for (int s : {1, 2}) { vis[s] = true; q.push(s); } printf("BFS comum:"); while (!q.empty()) { int u = q.front(); q.pop(); printf(" %d", u); for (int v : adj[u]) if (!vis[v]) { vis[v] = true; q.push(v); } } puts(""); }
    { vector<pair<int,int>> e2 = {{1,2},{1,3},{3,2}}; vector<vector<int>> adj(4); for (auto [a, b] : e2) adj[a].push_back(b); vector<bool> vis(4, false); queue<int> q; vis[1] = true; q.push(1); printf("BFS comum em 1->2,1->3,3->2:"); while (!q.empty()) { int u = q.front(); q.pop(); printf(" %d", u); for (int v : adj[u]) if (!vis[v]) { vis[v] = true; q.push(v); } } puts(""); kahn(3, {0,1,1,1}, e2, false); }
    // contar caminhos de 2 até cada tarefa, na ordem topológica 1 2 3 4 5 6
    { vector<vector<int>> adj(7); for (auto [a, b] : es) adj[a].push_back(b); vector<ll> cam(7, 0); cam[2] = 1; for (int u : {1, 2, 3, 4, 5, 6}) for (int v : adj[u]) cam[v] += cam[u]; printf("caminhos a partir de 2:"); for (int u = 1; u <= 6; u++) printf(" %lld", cam[u]); puts(""); }
    // quiz
    puts("quiz A:"); kahn(5, {0, 2, 3, 1, 4, 2}, {{1,3},{2,3},{3,4},{2,5}}, true);
    puts("quiz B (ciclo 2->3->4->2):"); kahn(5, {0, 1, 1, 1, 1, 1}, {{1,2},{2,3},{3,4},{4,2},{4,5}}, false);
}
