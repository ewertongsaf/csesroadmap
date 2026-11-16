// Confere os números citados no texto da aula (traços das operações, alturas, caminho comprimido, ordem inversa, quiz).
#include <bits/stdc++.h>
using namespace std;

struct D { vector<int> pai, tam; bool porTam, comprime; long long passos = 0;
    D(int n, bool t, bool c) : pai(n + 1), tam(n + 1, 1), porTam(t), comprime(c) { iota(pai.begin(), pai.end(), 0); }
    int acha(int x) { passos++; if (pai[x] == x) return x; int r = acha(pai[x]); if (comprime) pai[x] = r; return r; }
    bool une(int a, int b) { a = acha(a); b = acha(b); if (a == b) return false; if (porTam && tam[a] < tam[b]) swap(a, b); if (!porTam) { pai[a] = b; tam[b] += tam[a]; } else { pai[b] = a; tam[a] += tam[b]; } return true; }
    int altura(int x) { int h = 0; while (pai[x] != x) { x = pai[x]; h++; } return h; }
    void mostra(const char* t, int n) { printf("%-26s pai:", t); for (int i = 1; i <= n; i++) printf(" %d", pai[i]); printf(" | tam das raizes:"); for (int i = 1; i <= n; i++) if (pai[i] == i) printf(" %d(%d)", i, tam[i]); puts(""); } };

int main() {
    // exemplo da aula, com união por tamanho e compressão
    { D d(6, true, true); d.mostra("inicio", 6);
      vector<tuple<char,int,int>> ops = {{'L',1,2},{'L',3,4},{'P',1,3},{'L',2,3},{'P',1,4},{'L',5,6},{'P',4,6},{'L',6,1},{'P',4,6},{'L',2,5}};
      for (auto [t, a, b] : ops) { char nome[40]; if (t == 'L') { bool r = d.une(a, b); snprintf(nome, sizeof nome, "L %d %d%s", a, b, r ? "" : " (ja juntos)"); } else snprintf(nome, sizeof nome, "P %d %d -> %s", a, b, d.acha(a) == d.acha(b) ? "SIM" : "NAO"); d.mostra(nome, 6); } }
    // sem cuidado: une "raiz de a debaixo da raiz de b" numa sequência ruim -> cadeia
    { int n = 8; D ruim(n, false, false), bom(n, true, false);
      for (int i = 1; i < n; i++) { ruim.une(1, i + 1); bom.une(1, i + 1); }
      int hr = 0, hb = 0; for (int i = 1; i <= n; i++) { hr = max(hr, ruim.altura(i)); hb = max(hb, bom.altura(i)); }
      ruim.mostra("ruim: L 1 2, L 1 3, ...", n); bom.mostra("por tamanho, mesma seq.", n); printf("altura: ruim=%d, por tamanho=%d\n", hr, hb);
      int N = 100000; D r2(N, false, false), b2(N, true, false), c2(N, true, true); for (int i = 1; i < N; i++) { r2.une(1, i + 1); b2.une(1, i + 1); c2.une(1, i + 1); }
      r2.passos = b2.passos = c2.passos = 0; for (int i = 0; i < N; i++) { r2.acha(1); b2.acha(1); c2.acha(1); }
      printf("1e5 perguntas sobre o vertice 1 apos 1e5 unioes: passos ruim=%lld, por tamanho=%lld, tamanho+compressao=%lld\n", r2.passos, b2.passos, c2.passos); }
    // pior altura com união por tamanho: juntar sempre grupos iguais
    { int n = 8; D d(n, true, false); d.une(1,2); d.une(3,4); d.une(5,6); d.une(7,8); d.une(1,3); d.une(5,7); d.une(1,5); int h = 0; for (int i = 1; i <= n; i++) h = max(h, d.altura(i)); d.mostra("grupos iguais (n=8)", n); printf("altura maxima com 8 = %d (log2 8 = 3)\n", h); }
    // compressão: cadeia 1<-2<-3<-4<-5 (pai[5]=4,...), acha(5)
    { D d(5, false, true); d.pai = {0, 1, 1, 2, 3, 4}; d.mostra("antes de acha(5)", 5); d.acha(5); d.mostra("depois de acha(5)", 5); }
    // ordem inversa: arestas removidas
    { // grafo final após remoções: começa com 1-2, 2-3, 3-4; remove 2-3, depois remove 1-2; perguntas entre remoções
      puts("ordem inversa: arestas 1-2, 2-3, 3-4; eventos: P 1 4, remove 2-3, P 1 4, remove 1-2, P 1 2");
      D d(4, true, true); d.une(3, 4); vector<string> resp; // estado final: só 3-4
      resp.push_back(d.acha(1) == d.acha(2) ? "SIM" : "NAO"); d.une(1, 2); resp.push_back(d.acha(1) == d.acha(4) ? "SIM" : "NAO"); d.une(2, 3); resp.push_back(d.acha(1) == d.acha(4) ? "SIM" : "NAO");
      reverse(resp.begin(), resp.end()); printf("respostas na ordem original:"); for (auto& s : resp) printf(" %s", s.c_str()); puts(""); }
    // quiz
    { D d(5, true, true); d.une(1, 2); d.une(3, 4); d.une(2, 4); d.mostra("quiz: L12 L34 L24", 5); d.une(5, 4); d.mostra("quiz: + L54", 5); }
    { D d(4, true, true); d.une(1, 2); d.une(2, 1); d.une(3, 4); int g = 0; for (int i = 1; i <= 4; i++) if (d.pai[i] == i) g++; printf("quiz grupos: %d\n", g); }
}
