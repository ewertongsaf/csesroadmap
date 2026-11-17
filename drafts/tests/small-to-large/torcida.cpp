#include <bits/stdc++.h>
using namespace std;

int n;
vector<int> timeDe;                            // o time de cada funcionário
vector<vector<int>> filhos;
vector<map<int, int>> conta;                   // conta[m][t] = quantos torcem para t no conjunto m
vector<int> melhorTime, melhorQtd;             // o time mais comum do conjunto m (o menor, no empate) e quantos torcem
vector<int> dono;                              // dono[v] = o número do conjunto que guarda a equipe de v
vector<int> resp;

// Põe "qtd" torcedores do time t no conjunto m, atualizando o mais comum.
void poe(int m, int t, int qtd) {
    int c = (conta[m][t] += qtd);              // a nova contagem do time t
    if (c > melhorQtd[m] || (c == melhorQtd[m] && t < melhorTime[m])) {
        melhorQtd[m] = c;
        melhorTime[m] = t;
    }
}

void dfs(int v) {
    dono[v] = v;                               // o conjunto de v começa só com ele
    poe(v, timeDe[v], 1);
    for (int u : filhos[v]) {
        dfs(u);
        int a = dono[v], b = dono[u];
        if (conta[a].size() < conta[b].size()) swap(a, b);   // a é o conjunto maior
        for (auto [t, qtd] : conta[b]) poe(a, t, qtd);         // o menor entra no maior
        conta[b].clear();                      // o menor não é mais usado
        dono[v] = a;
    }
    resp[v] = melhorTime[dono[v]];
}

int main() {
    cin >> n;
    timeDe.resize(n + 1);
    for (int v = 1; v <= n; v++) cin >> timeDe[v];
    filhos.resize(n + 1);
    for (int v = 2; v <= n; v++) {
        int chefe;
        cin >> chefe;
        filhos[chefe].push_back(v);
    }
    conta.resize(n + 1);
    melhorTime.assign(n + 1, 0);
    melhorQtd.assign(n + 1, 0);
    dono.assign(n + 1, 0);
    resp.assign(n + 1, 0);
    dfs(1);
    for (int v = 1; v <= n; v++) cout << resp[v] << (v < n ? " " : "\n");
}
