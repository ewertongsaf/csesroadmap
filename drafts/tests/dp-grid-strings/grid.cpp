#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;
    vector<vector<long long>> moedas(n, vector<long long>(m));
    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++) cin >> moedas[i][j];

    // melhor[i][j] = maior total de moedas de um caminho do canto (0,0) até a casa (i,j)
    vector<vector<long long>> melhor(n, vector<long long>(m));
    for (int i = 0; i < n; i++) {              // linha por linha, de cima para baixo...
        for (int j = 0; j < m; j++) {          // ...e cada linha da esquerda para a direita
            long long antes = 0;                               // (0,0): não vim de lugar nenhum
            if (i > 0 && j > 0) antes = max(melhor[i - 1][j], melhor[i][j - 1]);
            else if (i > 0) antes = melhor[i - 1][j];          // primeira coluna: só de cima
            else if (j > 0) antes = melhor[i][j - 1];          // primeira linha: só da esquerda
            melhor[i][j] = antes + moedas[i][j];
        }
    }
    cout << melhor[n - 1][m - 1] << "\n";
}
