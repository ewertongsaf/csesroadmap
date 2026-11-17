#include <bits/stdc++.h>
using namespace std;

// O resumo de um trecho de dias.
struct No {
    int tam;                                   // quantos dias o trecho tem
    int pre;                                   // maior subida que começa no primeiro dia do trecho
    int suf;                                   // maior subida que termina no último dia do trecho
    int best;                                  // maior subida em qualquer lugar do trecho
    int ini, fim;                              // temperatura do primeiro e do último dia
};

// O resumo de um dia sozinho.
No folha(int t) {
    return {1, 1, 1, 1, t, t};
}

// O resumo do trecho A seguido do trecho B.
No junta(No A, No B) {
    bool liga = A.fim < B.ini;                 // a subida pode passar de A para B?
    No R;
    R.tam = A.tam + B.tam;
    R.ini = A.ini;
    R.fim = B.fim;
    R.pre = A.pre;
    if (A.pre == A.tam && liga) R.pre = A.tam + B.pre;    // A sobe inteiro e continua em B
    R.suf = B.suf;
    if (B.suf == B.tam && liga) R.suf = B.tam + A.suf;    // B sobe inteiro e começa ainda em A
    R.best = max(A.best, B.best);
    if (liga) R.best = max(R.best, A.suf + B.pre);         // a subida que atravessa o meio
    return R;
}

int n;
vector<int> t;                                 // temperaturas, de 1 a n
vector<No> arv;

void monta(int no, int l, int r) {
    if (l == r) {
        arv[no] = folha(t[l]);
        return;
    }
    int m = (l + r) / 2;
    monta(2 * no, l, m);
    monta(2 * no + 1, m + 1, r);
    arv[no] = junta(arv[2 * no], arv[2 * no + 1]);
}

void muda(int no, int l, int r, int k, int x) {
    if (l == r) {
        arv[no] = folha(x);
        return;
    }
    int m = (l + r) / 2;
    if (k <= m) muda(2 * no, l, m, k, x);
    else muda(2 * no + 1, m + 1, r, k, x);
    arv[no] = junta(arv[2 * no], arv[2 * no + 1]);
}

// Resumo das posições a a b (o trecho pedido sempre cruza o nó atual).
No consulta(int no, int l, int r, int a, int b) {
    if (a <= l && r <= b) return arv[no];      // o nó está todo dentro
    int m = (l + r) / 2;
    if (b <= m) return consulta(2 * no, l, m, a, b);           // só a metade esquerda interessa
    if (a > m) return consulta(2 * no + 1, m + 1, r, a, b);    // só a direita
    No esq = consulta(2 * no, l, m, a, b);                     // as duas: junta na ordem
    No dir = consulta(2 * no + 1, m + 1, r, a, b);
    return junta(esq, dir);
}

int main() {
    int q;
    cin >> n >> q;
    t.resize(n + 1);
    arv.resize(4 * n);
    for (int i = 1; i <= n; i++) cin >> t[i];
    monta(1, 1, n);

    while (q--) {
        char tipo;
        int x, y;
        cin >> tipo >> x >> y;
        if (tipo == 'M') muda(1, 1, n, x, y);                        // M k x: o dia k passa a ter temperatura x
        else cout << consulta(1, 1, n, x, y).best << "\n";           // Q a b: maior subida entre os dias a e b
    }
}
