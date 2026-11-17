// O trecho de Floyd do texto da aula, copiado, e testado contra uma simulação com vetor de visitados.
#include <bits/stdc++.h>
using namespace std;
int n;
vector<int> suc;

// A partir de x: quantos passos até entrar no ciclo (mu) e o comprimento do ciclo (lambda).
pair<int, int> floyd(int x) {
    int t = suc[x], l = suc[suc[x]];           // tartaruga anda 1, lebre anda 2
    while (t != l) {
        t = suc[t];
        l = suc[suc[l]];
    }
    int mu = 0;
    t = x;                                     // a tartaruga volta ao início; a lebre fica no encontro
    while (t != l) {                           // agora as duas andam 1 por vez
        t = suc[t];
        l = suc[l];
        mu++;
    }
    int lambda = 1;
    l = suc[t];                                // t está na entrada do ciclo; dá uma volta contando
    while (l != t) {
        l = suc[l];
        lambda++;
    }
    return {mu, lambda};
}

int main() {
    n = 8; suc = {0, 2, 3, 4, 5, 3, 1, 6, 4};
    for (int x = 1; x <= n; x++) { auto [m, l] = floyd(x); printf("x=%d mu=%d lambda=%d\n", x, m, l); }
    mt19937 rng(9);
    for (int it = 0; it < 3000; it++) {
        n = rng() % 12 + 1; suc.assign(n + 1, 0); for (int v = 1; v <= n; v++) suc[v] = rng() % n + 1;
        for (int x = 1; x <= n; x++) {
            vector<int> quando(n + 1, -1); int v = x, passo = 0; while (quando[v] < 0) { quando[v] = passo++; v = suc[v]; }
            int mu = quando[v], lambda = passo - quando[v];
            if (floyd(x) != make_pair(mu, lambda)) { puts("FLOYD DIFERENTE"); return 1; }
        }
    }
    puts("floyd: estresse ok");
}
