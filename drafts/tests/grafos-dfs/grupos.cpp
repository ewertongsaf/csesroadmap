#include <bits/stdc++.h>
using namespace std;

int n, m;
vector<vector<int>> viz;        // viz[u] = lista dos vizinhos de u
vector<bool> visitado;

// Visita u e tudo o que dá para alcançar a partir dele. Devolve quantos vértices visitou.
int dfs(int u) {
    visitado[u] = true;
    int tamanho = 1;                           // o próprio u
    for (int v : viz[u])                       // para cada vizinho v de u
        if (!visitado[v]) tamanho += dfs(v);   // se ainda não fui lá, vou
    return tamanho;
}

int main() {
    cin >> n >> m;
    viz.assign(n + 1, {});                     // vértices de 1 a n; a posição 0 fica sem uso
    visitado.assign(n + 1, false);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        viz[a].push_back(b);                   // a amizade vale nos dois sentidos
        viz[b].push_back(a);
    }

    int grupos = 0, maior = 0;
    for (int u = 1; u <= n; u++) {
        if (!visitado[u]) {                    // u ainda não pertence a nenhum grupo
            grupos++;
            maior = max(maior, dfs(u));        // a DFS marca o grupo inteiro
        }
    }
    cout << grupos << " " << maior << "\n";
}
