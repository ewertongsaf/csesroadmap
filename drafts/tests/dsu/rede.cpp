#include <bits/stdc++.h>
using namespace std;

vector<int> pai, tam;                          // pai[x] = quem está acima de x; tam[r] = tamanho do grupo da raiz r

// Devolve o representante (a raiz) do grupo de x, encurtando o caminho na volta.
int acha(int x) {
    if (pai[x] == x) return x;                 // x é a raiz do próprio grupo
    return pai[x] = acha(pai[x]);              // pendura x direto na raiz
}

// Junta os grupos de a e b. Devolve false se já eram o mesmo grupo.
bool une(int a, int b) {
    a = acha(a);
    b = acha(b);
    if (a == b) return false;
    if (tam[a] < tam[b]) swap(a, b);           // a passa a ser a raiz do grupo maior
    pai[b] = a;                                // o menor entra debaixo do maior
    tam[a] += tam[b];
    return true;
}

int main() {
    int n, q;
    cin >> n >> q;
    pai.resize(n + 1);
    tam.assign(n + 1, 1);
    for (int x = 1; x <= n; x++) pai[x] = x;   // no começo, cada computador é um grupo sozinho

    while (q--) {
        char tipo;
        int a, b;
        cin >> tipo >> a >> b;
        if (tipo == 'L') une(a, b);                                       // liga a e b com um cabo
        else cout << (acha(a) == acha(b) ? "SIM" : "NAO") << "\n";        // P: a e b estão conectados?
    }
}
