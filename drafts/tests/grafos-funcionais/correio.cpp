#include <bits/stdc++.h>
using namespace std;

const int LOG = 30;                            // 2^30 > 10^9: cobre qualquer k da entrada
int n;
vector<array<int, LOG>> up;                    // up[v][j] = cidade onde a carta está 2^j encaminhamentos depois de v
vector<array<long long, LOG>> soma;            // soma[v][j] = pedágio pago nesses 2^j encaminhamentos

int main() {
    int q;
    cin >> n >> q;
    up.assign(n + 1, {});
    soma.assign(n + 1, {});
    for (int v = 1; v <= n; v++) cin >> up[v][0];          // a próxima cidade de v
    for (int v = 1; v <= n; v++) cin >> soma[v][0];        // o pedágio de sair de v

    for (int j = 1; j < LOG; j++) {            // a coluna j inteira depende só da coluna j - 1
        for (int v = 1; v <= n; v++) {
            int meio = up[v][j - 1];           // onde a carta está depois da primeira metade
            up[v][j] = up[meio][j - 1];
            soma[v][j] = soma[v][j - 1] + soma[meio][j - 1];
        }
    }

    while (q--) {
        int x;
        long long k;
        cin >> x >> k;
        long long pago = 0;
        for (int j = 0; j < LOG; j++) {
            if (k >> j & 1) {                  // o bit j de k está ligado: 2^j encaminhamentos de uma vez
                pago += soma[x][j];            // primeiro soma o pedágio a partir de onde a carta está
                x = up[x][j];                  // depois move a carta
            }
        }
        cout << x << " " << pago << "\n";
    }
}
