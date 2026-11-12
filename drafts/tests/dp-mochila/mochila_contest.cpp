#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
#define rep(i,a,b) for(int i=(a);i<(b);i++)
void fastio(){ ios::sync_with_stdio(false); cin.tie(nullptr); }

int main(){
    fastio();
    int n, C; cin >> n >> C;
    vector<ll> melhor(C + 1, 0);
    rep(i, 0, n) {
        int tam, nota; cin >> tam >> nota;
        for (int c = C; c >= tam; c--) melhor[c] = max(melhor[c], melhor[c - tam] + nota);
    }
    cout << melhor[C] << "\n";
}
