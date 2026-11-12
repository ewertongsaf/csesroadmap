#include <bits/stdc++.h>
using namespace std;
int main() {   // a DP direta, O(n^2)
    int n; cin >> n; vector<int> a(n); for (int& x : a) cin >> x;
    vector<int> L(n, 1); int best = 0;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < i; j++) if (a[j] <= a[i]) L[i] = max(L[i], L[j] + 1);
        best = max(best, L[i]);
    }
    cout << best << "\n";
}
