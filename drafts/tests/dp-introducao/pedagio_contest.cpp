#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
#define rep(i,a,b) for(int i=(a);i<(b);i++)
void fastio(){ ios::sync_with_stdio(false); cin.tie(nullptr); }

int main(){
    fastio();
    int n; cin >> n;
    vector<ll> c(n + 1), custo(n + 1, 0);
    rep(i, 1, n + 1) cin >> c[i];
    rep(i, 1, n + 1) {
        ll melhor = custo[i - 1];
        if (i >= 2) melhor = min(melhor, custo[i - 2]);
        custo[i] = melhor + c[i];
    }
    cout << custo[n] << "\n";
}
