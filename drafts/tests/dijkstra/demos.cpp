// Confere os números citados no texto da aula (traços, contraexemplos, quiz).
#include <bits/stdc++.h>
using namespace std;
typedef long long ll; typedef pair<ll,int> pli;
const ll INF = 1e18;
string S(ll x) { return x >= INF ? "inf" : to_string(x); }

struct G { int n; vector<vector<pair<int,ll>>> viz; };
G grafo(int n, vector<array<ll,3>> es, bool dir = false) { G g{n, vector<vector<pair<int,ll>>>(n + 1)}; for (auto& e : es) { g.viz[e[0]].push_back({(int)e[1], e[2]}); if (!dir) g.viz[e[1]].push_back({(int)e[0], e[2]}); } return g; }

vector<ll> dijkstra(const G& g, int s, bool log = false, vector<int>* pai = nullptr) {
    vector<ll> dist(g.n + 1, INF); priority_queue<pli, vector<pli>, greater<pli>> pq; dist[s] = 0; pq.push({0, s});
    if (pai) pai->assign(g.n + 1, 0);
    int velhas = 0, pushes = 1;
    while (!pq.empty()) { auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) { velhas++; if (log) printf("sai (%lld, %d): velha, ignora\n", d, u); continue; }
        string mud;
        for (auto [v, t] : g.viz[u]) if (d + t < dist[v]) { mud += " " + to_string(v) + ":" + S(dist[v]) + "->" + to_string(d + t); dist[v] = d + t; if (pai) (*pai)[v] = u; pq.push({dist[v], v}); pushes++; }
        if (log) { printf("sai (%lld, %d): fecha %d |%s | dist:", d, u, u, mud.empty() ? " nada melhora" : mud.c_str()); for (int i = 1; i <= g.n; i++) printf(" %s", S(dist[i]).c_str()); auto c = pq; printf(" | fila:"); while (!c.empty()) { printf(" (%lld,%d)", c.top().first, c.top().second); c.pop(); } puts(""); } }
    if (log) printf("entradas na fila: %d, velhas: %d\n", pushes, velhas);
    return dist;
}

int main() {
    G g = grafo(5, {{1,2,7},{1,3,2},{3,2,3},{2,4,1},{3,4,8},{4,5,2}});
    vector<int> pai; auto d = dijkstra(g, 1, true, &pai);
    printf("pai:"); for (int u = 1; u <= 5; u++) printf(" %d", pai[u]); printf(" | caminho ate 5:"); { vector<int> c; for (int u = 5; u; u = pai[u]) c.push_back(u); reverse(c.begin(), c.end()); for (int x : c) printf(" %d", x); } puts("");
    // BFS (menos estradas) no mesmo grafo
    { vector<int> e(6, -1); vector<ll> custo(6, 0); queue<int> q; e[1] = 0; q.push(1); while (!q.empty()) { int u = q.front(); q.pop(); for (auto [v, t] : g.viz[u]) if (e[v] == -1) { e[v] = e[u] + 1; custo[v] = custo[u] + t; q.push(v); } } printf("BFS: tempo pelo caminho de menos estradas:"); for (int u = 1; u <= 5; u++) printf(" %lld", custo[u]); puts(""); }
    // peso negativo: versão que fecha cada vértice uma vez
    { G h = grafo(3, {{1,2,2},{1,3,5},{3,2,-4}}, true); vector<ll> dist(4, INF); vector<bool> fechado(4, false); dist[1] = 0;
      for (int it = 0; it < 3; it++) { int u = 0; for (int i = 1; i <= 3; i++) if (!fechado[i] && (u == 0 || dist[i] < dist[u])) u = i; fechado[u] = true; printf("negativo: fecha %d com %s\n", u, S(dist[u]).c_str()); for (auto [v, t] : h.viz[u]) if (!fechado[v] && dist[u] + t < dist[v]) dist[v] = dist[u] + t; }
      printf("negativo: resposta com 'fechado' = %lld %lld %lld (certo: 0 1 5)\n", dist[1], dist[2], dist[3]); }
    // quiz
    { G q = grafo(4, {{1,2,4},{1,3,1},{3,2,2},{2,4,5},{3,4,9}}); puts("quiz A:"); dijkstra(q, 1, true); }
    { G q = grafo(4, {{1,2,1},{2,3,1},{1,3,5},{3,4,1}}, true); auto r = dijkstra(q, 1); printf("quiz B direcionado: %s %s %s %s\n", S(r[1]).c_str(), S(r[2]).c_str(), S(r[3]).c_str(), S(r[4]).c_str()); auto r2 = dijkstra(q, 3); printf("quiz B a partir de 3: %s %s %s %s\n", S(r2[1]).c_str(), S(r2[2]).c_str(), S(r2[3]).c_str(), S(r2[4]).c_str()); }
    printf("maior distancia possivel: %lld (int max %d)\n", 99999LL * 1000000000LL, INT_MAX);
}
