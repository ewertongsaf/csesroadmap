#include <bits/stdc++.h>
using namespace std;

vector<int> pai, tam;
int acha(int x) { return pai[x] == x ? x : pai[x] = acha(pai[x]); }
bool une(int a, int b) {
    a = acha(a);
    b = acha(b);
    if (a == b) return false;                  // já estavam no mesmo grupo
    if (tam[a] < tam[b]) swap(a, b);
    pai[b] = a;
    tam[a] += tam[b];
    return true;
}

int main() {
    int n, m;
    cin >> n >> m;
    // cada trecho é {custo, a, b}: com o custo na frente, ordenar o vetor ordena por custo
    vector<array<long long, 3>> trechos(m);
    for (auto& t : trechos) cin >> t[1] >> t[2] >> t[0];
    sort(trechos.begin(), trechos.end());

    pai.resize(n + 1);
    tam.assign(n + 1, 1);
    for (int x = 1; x <= n; x++) pai[x] = x;

    long long total = 0;
    int usados = 0;
    for (auto& t : trechos) {                  // do mais barato para o mais caro
        if (une(t[1], t[2])) {                 // liga dois grupos diferentes: entra
            total += t[0];
            usados++;
        }                                      // senão fecharia um ciclo: fica de fora
    }

    if (usados < n - 1) cout << "IMPOSSIVEL\n";   // não deu para ligar todo mundo
    else cout << total << "\n";
}
