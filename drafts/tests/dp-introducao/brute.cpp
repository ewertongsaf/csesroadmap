#include <bits/stdc++.h>
using namespace std;
int n; vector<long long> c;
long long go(int i) {            // menor custo para ir do degrau i até o n, testando todos os caminhos
    if (i == n) return 0;
    long long r = go(i + 1) + c[i + 1];
    if (i + 2 <= n) r = min(r, go(i + 2) + c[i + 2]);
    return r;
}
int main() { cin >> n; c.resize(n + 1); for (int i = 1; i <= n; i++) cin >> c[i]; cout << go(0) << "\n"; }
