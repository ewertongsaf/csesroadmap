#include <bits/stdc++.h>
using namespace std;

int n;
vector<vector<int>> filhos;
vector<int> ent, sai;                          // ent[v], sai[v]: a equipe de v ocupa as posições ent[v]..sai[v]
int relogio = 0;
vector<long long> bit;                         // Fenwick tree sobre as posições 1..n

void dfs(int v) {
    ent[v] = ++relogio;                        // v ganha a próxima posição
    for (int u : filhos[v]) dfs(u);
    sai[v] = relogio;                          // a última posição usada dentro da equipe de v
}

void atualiza(int k, long long x) {
    for (int i = k; i <= n; i += i & -i) bit[i] += x;
}

long long soma(int k) {
    long long s = 0;
    for (int i = k; i > 0; i -= i & -i) s += bit[i];
    return s;
}

int main() {
    int q;
    cin >> n >> q;
    vector<long long> salario(n + 1);
    for (int v = 1; v <= n; v++) cin >> salario[v];
    filhos.resize(n + 1);
    for (int v = 2; v <= n; v++) {
        int chefe;
        cin >> chefe;
        filhos[chefe].push_back(v);
    }
    ent.assign(n + 1, 0);
    sai.assign(n + 1, 0);
    dfs(1);                                    // o funcionário 1 é o diretor
    bit.assign(n + 1, 0);

    while (q--) {
        char tipo;
        int v;
        cin >> tipo >> v;
        if (tipo == 'B') {                     // B v x: todos da equipe de v ganham x
            long long x;
            cin >> x;
            atualiza(ent[v], x);               // a partir da posição de v, todos ganham x...
            atualiza(sai[v] + 1, -x);          // ...e a partir do fim da equipe, deixam de ganhar
        } else {                               // Q v: o salário atual de v
            cout << salario[v] + soma(ent[v]) << "\n";
        }
    }
}
