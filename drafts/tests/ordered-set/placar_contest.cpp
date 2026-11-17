#include <bits/stdc++.h>
#include <ext/pb_ds/assoc_container.hpp>
using namespace std;
using namespace __gnu_pbds;
template <class T> using oset = tree<T, null_type, less<T>, rb_tree_tag, tree_order_statistics_node_update>;
void fastio(){ ios::sync_with_stdio(false); cin.tie(nullptr); }

int main(){
    fastio();
    int q; cin >> q;
    oset<int> s;
    while (q--) {
        char t; int x; cin >> t >> x;
        if (t == 'I') s.insert(x);
        else if (t == 'R') s.erase(x);
        else if (t == 'K') cout << *s.find_by_order(x - 1) << "\n";
        else cout << s.order_of_key(x) << "\n";
    }
}
