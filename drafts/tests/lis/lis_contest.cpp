#include <bits/stdc++.h>
using namespace std;
typedef vector<int> vi;
#define rep(i,a,b) for(int i=(a);i<(b);i++)
#define all(x) (x).begin(),(x).end()
#define sz(x) (int)(x).size()
void fastio(){ ios::sync_with_stdio(false); cin.tie(nullptr); }

int main(){
    fastio();
    int n; cin >> n;
    vi fim;
    rep(i, 0, n) {
        int x; cin >> x;
        auto it = upper_bound(all(fim), x);    // troque por lower_bound para "estritamente crescente"
        if (it == fim.end()) fim.push_back(x);
        else *it = x;
    }
    cout << sz(fim) << "\n";
}
