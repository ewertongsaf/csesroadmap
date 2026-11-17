#include <bits/stdc++.h>
using namespace std;

int n;
vector<vector<pair<int, int>>> adj;            // (vizinho, número da trilha)
vector<int> custo;                             // custo de cada trilha
vector<int> pai, prof, tam, pesado;            // pesado[v] = o filho de v com a maior subárvore (0 se não tem)
vector<int> cabeca, pos;                       // cabeca[v] = o topo da cadeia de v; pos[v] = a posição de v no vetor
vector<int> trilhaAcima;                       // trilhaAcima[v] = a trilha entre v e o pai dele
vector<int> arv;                               // segment tree de máximo sobre as posições
int proxPos = 0;

void dfs1(int v, int p) {                      // pai, profundidade, tamanho e filho pesado
    pai[v] = p;
    tam[v] = 1;
    for (auto [u, id] : adj[v]) {
        if (u == p) continue;
        prof[u] = prof[v] + 1;
        trilhaAcima[u] = id;
        dfs1(u, v);
        tam[v] += tam[u];
        if (pesado[v] == 0 || tam[u] > tam[pesado[v]]) pesado[v] = u;
    }
}

void dfs2(int v, int c) {                      // numera as posições, o filho pesado primeiro
    cabeca[v] = c;
    pos[v] = ++proxPos;
    if (pesado[v]) dfs2(pesado[v], c);         // o filho pesado continua a mesma cadeia
    for (auto [u, id] : adj[v])
        if (u != pai[v] && u != pesado[v]) dfs2(u, u);   // cada filho leve começa uma cadeia nova
}

void muda(int no, int l, int r, int k, int x) {
    if (l == r) {
        arv[no] = x;
        return;
    }
    int m = (l + r) / 2;
    if (k <= m) muda(2 * no, l, m, k, x);
    else muda(2 * no + 1, m + 1, r, k, x);
    arv[no] = max(arv[2 * no], arv[2 * no + 1]);
}

int consulta(int no, int l, int r, int a, int b) {
    if (b < l || r < a) return 0;              // custos são positivos: 0 nunca ganha o máximo
    if (a <= l && r <= b) return arv[no];
    int m = (l + r) / 2;
    return max(consulta(2 * no, l, m, a, b), consulta(2 * no + 1, m + 1, r, a, b));
}

// Maior custo de trilha no caminho entre a e b.
int maiorNoCaminho(int a, int b) {
    int res = 0;
    while (cabeca[a] != cabeca[b]) {           // enquanto estão em cadeias diferentes
        if (prof[cabeca[a]] < prof[cabeca[b]]) swap(a, b);   // a é o da cadeia cujo topo é mais fundo
        res = max(res, consulta(1, 1, n, pos[cabeca[a]], pos[a]));   // o trecho de a até o topo da cadeia
        a = pai[cabeca[a]];                    // sobe para a cadeia de cima
    }
    if (prof[a] > prof[b]) swap(a, b);         // agora estão na mesma cadeia; a é o mais alto (o LCA)
    if (a != b) res = max(res, consulta(1, 1, n, pos[a] + 1, pos[b]));   // pos[a] + 1: a trilha acima do LCA não está no caminho
    return res;
}

int main() {
    int q;
    cin >> n >> q;
    adj.resize(n + 1);
    custo.resize(n);
    for (int i = 1; i <= n - 1; i++) {
        int a, b;
        cin >> a >> b >> custo[i];
        adj[a].push_back({b, i});
        adj[b].push_back({a, i});
    }
    pai.assign(n + 1, 0); prof.assign(n + 1, 0); tam.assign(n + 1, 0); pesado.assign(n + 1, 0);
    cabeca.assign(n + 1, 0); pos.assign(n + 1, 0); trilhaAcima.assign(n + 1, 0);
    dfs1(1, 0);
    dfs2(1, 1);
    arv.assign(4 * n, 0);
    for (int v = 2; v <= n; v++) muda(1, 1, n, pos[v], custo[trilhaAcima[v]]);   // cada trilha mora no vértice de baixo

    // a qual vértice cada trilha pertence: o de baixo
    vector<int> baixo(n);
    for (int v = 2; v <= n; v++) baixo[trilhaAcima[v]] = v;

    while (q--) {
        char tipo;
        int x, y;
        cin >> tipo >> x >> y;
        if (tipo == 'M') muda(1, 1, n, pos[baixo[x]], y);      // M i c: a trilha i passa a custar c
        else cout << maiorNoCaminho(x, y) << "\n";             // Q a b: a trilha mais cara entre a e b
    }
}
