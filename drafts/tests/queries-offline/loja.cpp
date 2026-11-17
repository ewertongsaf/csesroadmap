#include <bits/stdc++.h>
using namespace std;

int n;
vector<long long> bit;                         // Fenwick tree: soma dos preços já "acesos" em cada posição

void atualiza(int k, long long x) {
    for (int i = k; i <= n; i += i & -i) bit[i] += x;
}

long long soma(int k) {
    long long s = 0;
    for (int i = k; i > 0; i -= i & -i) s += bit[i];
    return s;
}

struct Pergunta {
    int a, b, x;                               // trecho a..b, preço máximo x
    int id;                                    // posição da pergunta na entrada
};

int main() {
    int q;
    cin >> n >> q;
    vector<pair<int, int>> itens(n);           // (preço, posição) de cada produto
    for (int i = 1; i <= n; i++) {
        cin >> itens[i - 1].first;
        itens[i - 1].second = i;
    }
    vector<Pergunta> pergs(q);
    for (int j = 0; j < q; j++) {
        cin >> pergs[j].a >> pergs[j].b >> pergs[j].x;
        pergs[j].id = j;
    }

    sort(itens.begin(), itens.end());          // produtos do mais barato para o mais caro
    sort(pergs.begin(), pergs.end(), [](const Pergunta& p, const Pergunta& r) {
        return p.x < r.x;                      // perguntas do menor limite para o maior
    });

    bit.assign(n + 1, 0);
    vector<long long> resp(q);
    int prox = 0;                              // próximo produto ainda apagado
    for (const Pergunta& p : pergs) {
        while (prox < n && itens[prox].first <= p.x) {         // acende tudo que custa até x
            atualiza(itens[prox].second, itens[prox].first);
            prox++;
        }
        resp[p.id] = soma(p.b) - soma(p.a - 1);                // só os acesos contam
    }

    for (int j = 0; j < q; j++) cout << resp[j] << "\n";      // na ordem da entrada
}
