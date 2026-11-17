// O trecho da árvore persistente, copiado do texto da aula, mais uma consulta e um teste contra cópias do vetor.
#include <bits/stdc++.h>
using namespace std;

const int MAX = 4000000;                       // nós: os da versão inicial mais (log n + 1) por mudança
int esq[MAX], dir[MAX];                        // filhos de cada nó
long long val[MAX];                            // soma do trecho do nó
int criados = 0;

int novo(int e, int d, long long v) {          // cria um nó e devolve o número dele
    criados++;
    esq[criados] = e;
    dir[criados] = d;
    val[criados] = v;
    return criados;
}

// Cria a versão em que a posição k vale x, a partir da versão cuja raiz é "ant". Devolve a raiz nova.
int muda(int ant, int l, int r, int k, long long x) {
    if (l == r) return novo(0, 0, x);
    int m = (l + r) / 2;
    if (k <= m) {
        int e = muda(esq[ant], l, m, k, x);    // copia o lado do caminho
        return novo(e, dir[ant], val[e] + val[dir[ant]]);   // e reaproveita o outro
    }
    int d = muda(dir[ant], m + 1, r, k, x);
    return novo(esq[ant], d, val[esq[ant]] + val[d]);
}

long long consulta(int no, int l, int r, int a, int b) {
    if (b < l || r < a) return 0;
    if (a <= l && r <= b) return val[no];
    int m = (l + r) / 2;
    return consulta(esq[no], l, m, a, b) + consulta(dir[no], m + 1, r, a, b);
}

int monta(const vector<long long>& v, int l, int r) {
    if (l == r) return novo(0, 0, v[l]);
    int m = (l + r) / 2;
    int e = monta(v, l, m), d = monta(v, m + 1, r);
    return novo(e, d, val[e] + val[d]);
}

int main() {
    vector<long long> v = {0, 1, 2, 3, 4};
    vector<int> raiz = {monta(v, 1, 4)};
    raiz.push_back(muda(raiz[0], 1, 4, 2, 5));
    raiz.push_back(muda(raiz[1], 1, 4, 4, 0));
    raiz.push_back(muda(raiz[0], 1, 4, 1, 9));
    for (int i = 0; i < 4; i++) printf("v%d raiz %d (filhos %d, %d) soma %lld\n", i, raiz[i], esq[raiz[i]], dir[raiz[i]], consulta(raiz[i], 1, 4, 1, 4));
    printf("nos criados: %d\n", criados);
    mt19937 rng(8);
    for (int it = 0; it < 2000; it++) {
        criados = 0;
        int n = rng() % 9 + 1;
        vector<long long> w(n + 1);
        for (int i = 1; i <= n; i++) w[i] = rng() % 20;
        vector<vector<long long>> copia = {w};
        vector<int> rz = {monta(w, 1, n)};
        for (int o = 0; o < 20; o++) {
            int ver = rng() % rz.size();
            if (rng() % 2) {
                int k = rng() % n + 1; long long x = rng() % 20;
                rz.push_back(muda(rz[ver], 1, n, k, x));
                copia.push_back(copia[ver]); copia.back()[k] = x;
            } else {
                int a = rng() % n + 1, b = rng() % n + 1; if (a > b) swap(a, b);
                long long s = 0; for (int i = a; i <= b; i++) s += copia[ver][i];
                if (consulta(rz[ver], 1, n, a, b) != s) { puts("PERSISTENTE DIFERENTE"); return 1; }
            }
        }
    }
    puts("persistente (trecho do texto): estresse ok");
}
