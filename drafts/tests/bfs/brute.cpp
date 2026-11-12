#include <bits/stdc++.h>
using namespace std;
int main() {   // simula minuto a minuto: quem sabe conta para todos os amigos
    int n, m; cin >> n >> m; vector<pair<int,int>> es(m); for (auto& e : es) cin >> e.first >> e.second;
    vector<int> t(n + 1, -1); t[1] = 0;
    for (int minuto = 1; minuto <= n; minuto++) {
        vector<int> novo;
        for (auto [a, b] : es) { if (t[a] != -1 && t[a] < minuto && t[b] == -1) novo.push_back(b); if (t[b] != -1 && t[b] < minuto && t[a] == -1) novo.push_back(a); }
        for (int x : novo) t[x] = minuto;
    }
    for (int u = 1; u <= n; u++) cout << t[u] << " \n"[u == n];
}
