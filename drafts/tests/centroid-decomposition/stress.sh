#!/usr/bin/env bash
# Compila tudo com avisos, confere o exemplo do texto e compara com a força bruta em árvores aleatórias.
set -e
cd "$(dirname "$0")"
ulimit -s unlimited 2>/dev/null || ulimit -s 1000000   # como nos juízes: pilha grande para a recursão
F="-std=c++17 -O2 -Wall -Wextra -Wshadow"
for p in postos postos_contest brute demos; do g++ $F $p.cpp -o /tmp/cd_$p; done
EX='12 7\n1 2\n2 3\n3 4\n4 5\n5 6\n6 7\n3 8\n8 9\n5 10\n10 11\n1 12\nQ 9\nA 7\nQ 9\nQ 11\nA 9\nQ 8\nQ 12\n'
ESP=$(printf "$EX" | /tmp/cd_brute | tr '\n' ' ')
if [ "$(printf "$EX" | /tmp/cd_postos | tr '\n' ' ')" = "$ESP" ] && [ "$(printf "$EX" | /tmp/cd_postos_contest | tr '\n' ' ')" = "$ESP" ]; then echo "exemplo ok: $ESP"; else echo "EXEMPLO DO TEXTO FALHOU"; exit 1; fi
for s in $(seq 1 500); do
  python3 -c "
import random; random.seed($s); n=random.randint(1,15); q=random.randint(1,25); print(n,q)
p=list(range(1,n+1)); random.shuffle(p)
for v in range(2,n+1): print(p[random.randint(0,v-2)], p[v-1])
for _ in range(q): print(random.choice('AQQ'), random.randint(1,n))" > /tmp/in
  a=$(/tmp/cd_postos < /tmp/in); b=$(/tmp/cd_brute < /tmp/in); c=$(/tmp/cd_postos_contest < /tmp/in)
  [ "$a" = "$b" ] && [ "$a" = "$c" ] || { echo "DIFERENTE na semente $s"; cat /tmp/in; exit 1; }
done
echo "stress ok (500 árvores, numeração embaralhada)"
python3 -c "
import random; random.seed(2); n=200000; print(n, n)
for v in range(2,n+1): print(v-1, v)
for i in range(n): print('A' if i%3==0 else 'Q', random.randint(1,n))" > /tmp/in
echo "grande (caminho de 2e5, 2e5 eventos): $(/tmp/cd_postos < /tmp/in | wc -l) respostas, iguais às do contest: $([ "$(/tmp/cd_postos < /tmp/in | md5sum)" = "$(/tmp/cd_postos_contest < /tmp/in | md5sum)" ] && echo sim || echo NAO)"
/tmp/cd_demos
