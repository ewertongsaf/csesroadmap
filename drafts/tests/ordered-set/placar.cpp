#include <bits/stdc++.h>
#include <ext/pb_ds/assoc_container.hpp>       // as estruturas extras do GCC
using namespace std;
using namespace __gnu_pbds;

// Um set que também sabe a posição de cada elemento na ordem.
template <class T>
using ordered_set = tree<T, null_type, less<T>, rb_tree_tag, tree_order_statistics_node_update>;

int main() {
    int q;
    cin >> q;
    ordered_set<int> s;

    while (q--) {
        char tipo;
        int x;
        cin >> tipo >> x;
        if (tipo == 'I') s.insert(x);                            // I x: entra a pontuação x
        else if (tipo == 'R') s.erase(x);                        // R x: sai a pontuação x
        else if (tipo == 'K') cout << *s.find_by_order(x - 1) << "\n";   // K k: a k-ésima menor (a contagem interna começa em 0)
        else cout << s.order_of_key(x) << "\n";                  // C x: quantas são menores que x
    }
}
