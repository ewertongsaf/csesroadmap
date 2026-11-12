#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];

    // fim[k] = menor valor final possível de uma sequência que nunca cai, de tamanho k + 1
    vector<int> fim;
    for (int i = 0; i < n; i++) {
        // primeira posição com valor MAIOR que a[i] (a busca binária do módulo de busca binária)
        int pos = upper_bound(fim.begin(), fim.end(), a[i]) - fim.begin();
        if (pos == (int)fim.size()) fim.push_back(a[i]);   // a[i] estende a maior sequência
        else fim[pos] = a[i];                              // a[i] melhora o final do tamanho pos + 1
    }
    cout << fim.size() << "\n";
}
