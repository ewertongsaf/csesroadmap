#include <bits/stdc++.h>
using namespace std;

const int INF = INT_MAX;                       // "nenhum valor": nunca ganha de ninguém num mínimo
int n;
vector<int> v, arv;                            // v = os preços; arv[no] = menor preço do trecho de que o nó cuida

// Monta o nó "no", que cuida das posições l a r.
void monta(int no, int l, int r) {
    if (l == r) {                              // folha: uma posição só
        arv[no] = v[l];
        return;
    }
    int m = (l + r) / 2;
    monta(2 * no, l, m);                       // filho da esquerda: l a m
    monta(2 * no + 1, m + 1, r);               // filho da direita: m+1 a r
    arv[no] = min(arv[2 * no], arv[2 * no + 1]);
}

// A posição k passa a valer x.
void muda(int no, int l, int r, int k, int x) {
    if (l == r) {
        arv[no] = x;
        return;
    }
    int m = (l + r) / 2;
    if (k <= m) muda(2 * no, l, m, k, x);      // k está na metade esquerda
    else muda(2 * no + 1, m + 1, r, k, x);     // ou na direita
    arv[no] = min(arv[2 * no], arv[2 * no + 1]);   // na volta, refaz o mínimo deste nó
}

// Menor valor entre as posições a e b.
int consulta(int no, int l, int r, int a, int b) {
    if (b < l || r < a) return INF;            // o nó está todo fora do trecho pedido
    if (a <= l && r <= b) return arv[no];      // o nó está todo dentro: usa o valor pronto
    int m = (l + r) / 2;                       // está parcialmente dentro: pergunta aos dois filhos
    int esq = consulta(2 * no, l, m, a, b);
    int dir = consulta(2 * no + 1, m + 1, r, a, b);
    return min(esq, dir);
}

int main() {
    int q;
    cin >> n >> q;
    v.resize(n + 1);
    arv.resize(4 * n);                         // 4n casas sempre bastam
    for (int i = 1; i <= n; i++) cin >> v[i];
    monta(1, 1, n);                            // o nó 1 é a raiz e cuida de tudo

    while (q--) {
        char tipo;
        int x, y;
        cin >> tipo >> x >> y;
        if (tipo == 'M') muda(1, 1, n, x, y);                    // M k x: o posto k passa a cobrar x
        else cout << consulta(1, 1, n, x, y) << "\n";            // Q a b: menor preço entre os postos a e b
    }
}
