#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
#define rep(i,a,b) for(int i=(a);i<(b);i++)
void fastio(){ ios::sync_with_stdio(false); cin.tie(nullptr); }
const int LOG = 30;

int main(){
    fastio();
    int n, q; cin >> n >> q;
    vector<vector<int>> up(LOG, vector<int>(n + 1));
    vector<vector<ll>> s(LOG, vector<ll>(n + 1));
    rep(v,1,n+1) cin >> up[0][v];
    rep(v,1,n+1) cin >> s[0][v];
    rep(j,1,LOG) rep(v,1,n+1) { up[j][v] = up[j-1][up[j-1][v]]; s[j][v] = s[j-1][v] + s[j-1][up[j-1][v]]; }
    while (q--) {
        int x; ll k; cin >> x >> k; ll p = 0;
        rep(j,0,LOG) if (k >> j & 1) { p += s[j][x]; x = up[j][x]; }
        cout << x << " " << p << "\n";
    }
}
