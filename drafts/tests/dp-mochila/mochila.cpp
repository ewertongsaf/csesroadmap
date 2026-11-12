#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, C;
    cin >> n >> C;
    vector<int> tam(n), nota(n);
    for (int i = 0; i < n; i++) cin >> tam[i] >> nota[i];

    // melhor[c] = maior soma de notas usando no máximo c GB, com os arquivos já considerados
    vector<long long> melhor(C + 1, 0);        // caso base: sem arquivo nenhum, a soma é 0
    for (int i = 0; i < n; i++) {              // um arquivo de cada vez...
        for (int c = C; c >= tam[i]; c--) {    // ...e as capacidades de TRÁS PARA FRENTE
            melhor[c] = max(melhor[c],                       // não levo o arquivo i
                            melhor[c - tam[i]] + nota[i]);   // levo: sobram c - tam[i] GB
        }
    }
    cout << melhor[C] << "\n";
}
