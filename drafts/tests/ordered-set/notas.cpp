#include <bits/stdc++.h>
using namespace std;

int m;                                         // os valores vão de 1 a m
vector<int> arv;                               // arv[no] = quantos valores guardados caem no trecho do nó

// Soma d (+1 ou -1) à quantidade do valor v.
void muda(int no, int l, int r, int v, int d) {
    if (l == r) {
        arv[no] += d;
        return;
    }
    int mid = (l + r) / 2;
    if (v <= mid) muda(2 * no, l, mid, v, d);
    else muda(2 * no + 1, mid + 1, r, v, d);
    arv[no] = arv[2 * no] + arv[2 * no + 1];
}

// Quantos valores guardados estão entre a e b.
int conta(int no, int l, int r, int a, int b) {
    if (b < l || r < a) return 0;
    if (a <= l && r <= b) return arv[no];
    int mid = (l + r) / 2;
    return conta(2 * no, l, mid, a, b) + conta(2 * no + 1, mid + 1, r, a, b);
}

// O k-ésimo menor valor guardado (1 <= k <= total).
int kesimo(int no, int l, int r, int k) {
    if (l == r) return l;                      // folha: é este valor
    int mid = (l + r) / 2;
    if (arv[2 * no] >= k) return kesimo(2 * no, l, mid, k);          // os k menores cabem na esquerda
    return kesimo(2 * no + 1, mid + 1, r, k - arv[2 * no]);          // pula todos os da esquerda
}

int main() {
    int q;
    cin >> m >> q;
    arv.assign(4 * m, 0);

    while (q--) {
        char tipo;
        int x;
        cin >> tipo >> x;
        if (tipo == 'I') muda(1, 1, m, x, +1);                       // I x: entra uma nota x (pode repetir)
        else if (tipo == 'R') {                                      // R x: sai uma nota x, se houver
            if (conta(1, 1, m, x, x) > 0) muda(1, 1, m, x, -1);
        }
        else if (tipo == 'K') cout << kesimo(1, 1, m, x) << "\n";    // K k: a k-ésima menor nota
        else cout << conta(1, 1, m, 1, x - 1) << "\n";               // C x: quantas notas são menores que x
    }
}
