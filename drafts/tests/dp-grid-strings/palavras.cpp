#include <bits/stdc++.h>
using namespace std;

int main() {
    string a, b;
    cin >> a >> b;
    int n = a.size(), m = b.size();

    // d[i][j] = menor número de operações (apagar ou inserir uma letra)
    //           para transformar as i primeiras letras de a nas j primeiras letras de b
    vector<vector<int>> d(n + 1, vector<int>(m + 1));
    for (int i = 0; i <= n; i++) d[i][0] = i;      // para virar a palavra vazia: apagar as i letras
    for (int j = 0; j <= m; j++) d[0][j] = j;      // a partir da vazia: inserir as j letras
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            if (a[i - 1] == b[j - 1])              // a i-ésima letra de a é a[i-1]
                d[i][j] = d[i - 1][j - 1];         // últimas letras iguais: não custam nada
            else
                d[i][j] = 1 + min(d[i - 1][j],     // apago a última letra de a
                                  d[i][j - 1]);    // insiro a última letra de b
        }
    }
    cout << d[n][m] << "\n";
}
