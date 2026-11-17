#include <bits/stdc++.h>
using namespace std;

const int INF = 1e9;
int n;
vector<vector<int>> adj;
vector<bool> removido;                         // vértices que já foram centroides (cortam a árvore)
vector<int> tam;
vector<vector<pair<int, int>>> acima;          // acima[v] = lista de (centroide ancestral c, distância de v até c)
vector<int> melhor;                            // melhor[c] = menor distância de c até um posto aberto do pedaço de c

int calculaTam(int v, int p) {                 // tamanho das subárvores dentro do pedaço atual
    tam[v] = 1;
    for (int u : adj[v])
        if (u != p && !removido[u]) tam[v] += calculaTam(u, v);
    return tam[v];
}

int achaCentroide(int v, int p, int total) {   // desce enquanto algum filho tiver mais da metade do pedaço
    for (int u : adj[v])
        if (u != p && !removido[u] && tam[u] > total / 2) return achaCentroide(u, v, total);
    return v;
}

void anotaDistancias(int v, int p, int c, int d) {   // todos do pedaço guardam a distância até o centroide c
    acima[v].push_back({c, d});
    for (int u : adj[v])
        if (u != p && !removido[u]) anotaDistancias(u, v, c, d + 1);
}

void decompoe(int v) {
    int total = calculaTam(v, 0);
    int c = achaCentroide(v, 0, total);
    anotaDistancias(c, 0, c, 0);
    removido[c] = true;                        // corta o pedaço no centroide
    for (int u : adj[c])
        if (!removido[u]) decompoe(u);         // cada pedaço que sobrou é decomposto do mesmo jeito
}

void abre(int v) {                             // abre um posto em v
    for (auto [c, d] : acima[v]) melhor[c] = min(melhor[c], d);
}

int maisProximo(int v) {                       // distância de v até o posto aberto mais próximo
    int res = INF;
    for (auto [c, d] : acima[v]) res = min(res, d + melhor[c]);
    return res;
}

int main() {
    int q;
    cin >> n >> q;
    adj.resize(n + 1);
    for (int i = 0; i < n - 1; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);
    }
    removido.assign(n + 1, false);
    tam.assign(n + 1, 0);
    acima.resize(n + 1);
    melhor.assign(n + 1, INF);
    decompoe(1);
    abre(1);                                   // no começo, só a clareira 1 tem posto

    while (q--) {
        char tipo;
        int v;
        cin >> tipo >> v;
        if (tipo == 'A') abre(v);              // A v: abre um posto em v
        else cout << maisProximo(v) << "\n";   // Q v: distância até o posto mais próximo
    }
}
