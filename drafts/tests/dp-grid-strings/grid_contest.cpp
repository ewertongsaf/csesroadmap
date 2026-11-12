#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
#define rep(i,a,b) for(int i=(a);i<(b);i++)
void fastio(){ ios::sync_with_stdio(false); cin.tie(nullptr); }

int main(){
    fastio();
    int n, m; cin >> n >> m;
    const ll NEG = -1e18;
    // moldura: linha 0 e coluna 0 são "impossível", e as casas reais vão de 1 a n e de 1 a m
    vector<vector<ll>> melhor(n + 1, vector<ll>(m + 1, NEG));
    rep(i, 1, n + 1) rep(j, 1, m + 1) {
        ll x; cin >> x;
        ll antes = (i == 1 && j == 1) ? 0 : max(melhor[i - 1][j], melhor[i][j - 1]);
        melhor[i][j] = antes + x;
    }
    cout << melhor[n][m] << "\n";
}
