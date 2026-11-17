#include <bits/stdc++.h>
using namespace std;

int n;
vector<long long> t;                           // temperaturas, de 1 a n
vector<long long> arv;                         // arv[no] = maior temperatura do trecho do nó, já contando o que foi somado nele
vector<long long> pend;                        // pend[no] = quanto ainda falta somar nos filhos do nó

void monta(int no, int l, int r) {
    if (l == r) {
        arv[no] = t[l];
        return;
    }
    int m = (l + r) / 2;
    monta(2 * no, l, m);
    monta(2 * no + 1, m + 1, r);
    arv[no] = max(arv[2 * no], arv[2 * no + 1]);
}

// Soma x ao trecho inteiro do nó, sem descer: o máximo sobe x, e os filhos ficam devendo x.
void aplica(int no, long long x) {
    arv[no] += x;
    pend[no] += x;
}

// Passa a conta pendente do nó para os dois filhos.
void empurra(int no) {
    if (pend[no] != 0) {
        aplica(2 * no, pend[no]);
        aplica(2 * no + 1, pend[no]);
        pend[no] = 0;
    }
}

// Soma x a todas as posições de a a b.
void soma(int no, int l, int r, int a, int b, long long x) {
    if (b < l || r < a) return;                // todo fora: nada a fazer
    if (a <= l && r <= b) {                    // todo dentro: anota e para aqui
        aplica(no, x);
        return;
    }
    empurra(no);                               // vai descer: antes, os filhos recebem o que estava pendente
    int m = (l + r) / 2;
    soma(2 * no, l, m, a, b, x);
    soma(2 * no + 1, m + 1, r, a, b, x);
    arv[no] = max(arv[2 * no], arv[2 * no + 1]);
}

// Maior valor entre as posições a e b.
long long consulta(int no, int l, int r, int a, int b) {
    if (b < l || r < a) return LLONG_MIN;      // todo fora: nunca ganha um máximo
    if (a <= l && r <= b) return arv[no];      // todo dentro: o valor já está certo
    empurra(no);                               // vai descer: os filhos precisam estar em dia
    int m = (l + r) / 2;
    return max(consulta(2 * no, l, m, a, b), consulta(2 * no + 1, m + 1, r, a, b));
}

int main() {
    int q;
    cin >> n >> q;
    t.resize(n + 1);
    arv.assign(4 * n, 0);
    pend.assign(4 * n, 0);
    for (int i = 1; i <= n; i++) cin >> t[i];
    monta(1, 1, n);

    while (q--) {
        char tipo;
        cin >> tipo;
        if (tipo == 'S') {                     // S a b x: soma x graus aos dias a..b
            int a, b;
            long long x;
            cin >> a >> b >> x;
            soma(1, 1, n, a, b, x);
        } else {                               // Q a b: maior temperatura entre os dias a e b
            int a, b;
            cin >> a >> b;
            cout << consulta(1, 1, n, a, b) << "\n";
        }
    }
}
