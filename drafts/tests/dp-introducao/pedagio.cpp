#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<long long> c(n + 1);
    for (int i = 1; i <= n; i++) cin >> c[i];

    // custo[i] = menor total de moedas para estar em cima do degrau i
    vector<long long> custo(n + 1);
    custo[0] = 0;                              // caso base: o chão é de graça
    for (int i = 1; i <= n; i++) {             // ordem: do degrau 1 até o n
        long long melhor = custo[i - 1];       // cheguei com um passo de 1
        if (i >= 2) melhor = min(melhor, custo[i - 2]);   // ou com um passo de 2
        custo[i] = melhor + c[i];              // e pago o pedágio do degrau i
    }
    cout << custo[n] << "\n";                  // a resposta mora no estado n
}
