// Confere os números citados no texto da aula (traços, contraexemplos, repetidos com pares, árvore de contagens, quiz).
#include <bits/stdc++.h>
#include <ext/pb_ds/assoc_container.hpp>
using namespace std; using namespace __gnu_pbds;
template <class T> using oset = tree<T, null_type, less<T>, rb_tree_tag, tree_order_statistics_node_update>;
int main() {
    { oset<int> s; vector<pair<char,int>> ops = {{'I',50},{'I',20},{'I',80},{'I',30},{'K',2},{'C',60},{'R',30},{'K',2},{'I',10},{'C',30},{'K',4}};
      for (auto [t, x] : ops) { printf("%c %d ->", t, x); if (t == 'I') s.insert(x); else if (t == 'R') s.erase(x); else if (t == 'K') printf(" resp %d (errado sem o -1: %s) |", *s.find_by_order(x - 1), s.find_by_order(x) == s.end() ? "end()" : to_string(*s.find_by_order(x)).c_str()); else printf(" resp %d |", (int)s.order_of_key(x)); printf(" conteudo:"); for (int y : s) printf(" %d", y); puts(""); } }
    { oset<int> s = {}; for (int x : {20, 30, 50, 80}) s.insert(x); printf("{20,30,50,80}: find_by_order(0..3) ="); for (int i = 0; i < 4; i++) printf(" %d", *s.find_by_order(i)); printf("; find_by_order(4)==end: %d\n", s.find_by_order(4) == s.end());
      printf("order_of_key(20)=%d (50)=%d (60)=%d (5)=%d (99)=%d\n", (int)s.order_of_key(20), (int)s.order_of_key(50), (int)s.order_of_key(60), (int)s.order_of_key(5), (int)s.order_of_key(99)); }
    // repetidos
    { oset<int> s; for (int x : {20, 20, 50}) s.insert(x); printf("inserindo 20, 20, 50 num oset<int>: tamanho %d; find_by_order(2)==end: %d\n", (int)s.size(), s.find_by_order(2) == s.end());
      oset<pair<int,int>> p; int id = 0; for (int x : {20, 20, 50}) p.insert({x, id++}); printf("com pares: tamanho %d; 3o menor = %d; menores que 50 = %d; menores que 20 = %d\n", (int)p.size(), p.find_by_order(2)->first, (int)p.order_of_key({50, 0}), (int)p.order_of_key({20, 0}));
      auto it = p.lower_bound({20, 0}); if (it != p.end() && it->first == 20) p.erase(it); printf("apos remover um 20: tamanho %d; 2o menor = %d\n", (int)p.size(), p.find_by_order(1)->first);
      // estresse do multiconjunto com pares
      mt19937 rng(3); for (int it2 = 0; it2 < 2000; it2++) { oset<pair<int,int>> o; multiset<int> ms; int nid = 0; for (int k = 0; k < 25; k++) { int tp = rng() % 4, x = rng() % 6 + 1;
            if (tp == 0) { o.insert({x, nid++}); ms.insert(x); }
            else if (tp == 1) { auto a = o.lower_bound({x, 0}); if (a != o.end() && a->first == x) o.erase(a); auto b = ms.find(x); if (b != ms.end()) ms.erase(b); }
            else if (tp == 2 && !ms.empty()) { int kk = rng() % ms.size(); auto b = ms.begin(); advance(b, kk); if (o.find_by_order(kk)->first != *b) { puts("PARES: DIFERENTE"); return 1; } }
            else { int c = 0; for (int y : ms) if (y < x) c++; if ((int)o.order_of_key({x, 0}) != c) { puts("PARES: DIFERENTE"); return 1; } } } } puts("pares: estresse ok"); }
    // árvore de contagens: I 5, I 2, I 8, I 3, K 2, C 6, R 3, K 2, I 1, I 5, K 4, C 5
    { int m = 8; vector<int> t(4 * m, 0);
      function<void(int,int,int,int,int)> muda = [&](int no, int l, int r, int v, int d) { if (l == r) { t[no] += d; return; } int mid = (l + r) / 2; if (v <= mid) muda(2*no, l, mid, v, d); else muda(2*no+1, mid+1, r, v, d); t[no] = t[2*no] + t[2*no+1]; };
      function<int(int,int,int,int,int)> conta = [&](int no, int l, int r, int a, int b) { if (b < l || r < a) return 0; if (a <= l && r <= b) return t[no]; int mid = (l + r) / 2; return conta(2*no, l, mid, a, b) + conta(2*no+1, mid+1, r, a, b); };
      function<int(int,int,int,int)> kes = [&](int no, int l, int r, int k) { if (l == r) { printf("   no %d (valor %d): chegou\n", no, l); return l; } int mid = (l + r) / 2; printf("   no %d (%d..%d), k=%d: esquerda tem %d -> %s\n", no, l, r, k, t[2*no], t[2*no] >= k ? "esquerda" : "direita"); if (t[2*no] >= k) return kes(2*no, l, mid, k); return kes(2*no+1, mid+1, r, k - t[2*no]); };
      vector<pair<char,int>> ops = {{'I',5},{'I',2},{'I',8},{'I',3},{'K',2},{'C',6},{'R',3},{'K',2},{'I',1},{'I',5},{'K',4},{'C',5}};
      for (auto [tp, x] : ops) { printf("%c %d:\n", tp, x); if (tp == 'I') muda(1, 1, m, x, 1); else if (tp == 'R') muda(1, 1, m, x, -1); else if (tp == 'K') printf("  = %d\n", kes(1, 1, m, x)); else printf("  = %d\n", conta(1, 1, m, 1, x - 1));
        printf("  folhas:"); for (int i = 8; i <= 15; i++) printf(" %d", t[i]); printf(" | nos 1..7:"); for (int i = 1; i <= 7; i++) printf(" %d", t[i]); puts(""); } 
      // quiz: K 3 neste estado (1,2,5,5,8)
      puts("quiz K 3:"); printf("  = %d\n", kes(1, 1, m, 3)); puts("quiz K 5:"); printf("  = %d\n", kes(1, 1, m, 5)); }
    { oset<int> s; for (int x : {7, 3, 9, 1}) s.insert(x); printf("quiz {7,3,9,1}: *find_by_order(2)=%d order_of_key(7)=%d order_of_key(4)=%d\n", *s.find_by_order(2), (int)s.order_of_key(7), (int)s.order_of_key(4)); s.insert(3); printf("quiz apos insert(3) de novo: size=%d\n", (int)s.size()); }
}
