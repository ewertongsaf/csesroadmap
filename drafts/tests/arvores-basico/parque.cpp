#include <bits/stdc++.h>
using namespace std;

int n;
vector<vector<pair<int, int>>> adj;            // adj[v] = lista de (vizinho, comprimento da trilha)

// Preenche dist[v] = distância de v até a clareira onde a busca começou.
void dfs(int v, int pai, long long d, vector<long long>& dist) {
    dist[v] = d;
    for (auto [u, w] : adj[v]) {
        if (u != pai) dfs(u, v, d + w, dist);  // numa árvore, só não se pode voltar pelo pai
    }
}

// Clareira mais distante segundo o vetor dist (a de menor número, no empate).
int maisLonge(const vector<long long>& dist) {
    int melhor = 1;
    for (int v = 2; v <= n; v++)
        if (dist[v] > dist[melhor]) melhor = v;
    return melhor;
}

int main() {
    cin >> n;
    adj.resize(n + 1);
    for (int i = 0; i < n - 1; i++) {
        int a, b, w;
        cin >> a >> b >> w;
        adj[a].push_back({b, w});
        adj[b].push_back({a, w});
    }

    vector<long long> d1(n + 1), dA(n + 1), dB(n + 1);
    dfs(1, 0, 0, d1);
    int A = maisLonge(d1);                     // uma ponta do diâmetro
    dfs(A, 0, 0, dA);
    int B = maisLonge(dA);                     // a outra ponta
    dfs(B, 0, 0, dB);

    long long diametro = dA[B];
    int centro = 1;
    long long melhor = LLONG_MAX;
    for (int v = 1; v <= n; v++) {
        long long pior = max(dA[v], dB[v]);    // a clareira mais distante de v é A ou B
        if (pior < melhor) {
            melhor = pior;
            centro = v;
        }
    }
    cout << diametro << " " << centro << " " << melhor << "\n";
}
