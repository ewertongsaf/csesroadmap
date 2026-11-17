#include <bits/stdc++.h>
using namespace std;

int n;
vector<long long> bit;                         // bit[i] = soma de um bloco de (i & -i) posições que termina em i

// Soma x à posição k.
void atualiza(int k, long long x) {
    for (int i = k; i <= n; i += i & -i)       // passa por todos os blocos que contêm a posição k
        bit[i] += x;
}

// Devolve a soma das posições 1 a k.
long long soma(int k) {
    long long s = 0;
    for (int i = k; i > 0; i -= i & -i)        // junta os blocos que, lado a lado, cobrem 1..k
        s += bit[i];
    return s;
}

int main() {
    int q;
    cin >> n >> q;
    bit.assign(n + 1, 0);                      // posições de 1 a n; a casa 0 não é usada
    for (int i = 1; i <= n; i++) {
        long long x;
        cin >> x;
        atualiza(i, x);                        // monta a estrutura somando um valor por vez
    }

    while (q--) {
        char tipo;
        cin >> tipo;
        if (tipo == 'A') {                     // A k x: chegam x caixas à prateleira k
            int k;
            long long x;
            cin >> k >> x;
            atualiza(k, x);
        } else {                               // S a b: quantas caixas da prateleira a até a b?
            int a, b;
            cin >> a >> b;
            cout << soma(b) - soma(a - 1) << "\n";
        }
    }
}
