#!/usr/bin/env bash
# Compila tudo com avisos, confere o exemplo do texto e compara com a força bruta em entradas aleatórias.
set -e
cd "$(dirname "$0")"
F="-std=c++17 -O2 -Wall -Wextra -Wshadow"
for p in loja loja_contest brute demos; do g++ $F $p.cpp -o /tmp/qo_$p; done
EX='8 6\n4 7 2 9 5 3 8 6\n2 6 5\n1 8 3\n3 7 8\n1 4 6\n5 8 5\n4 4 8\n'
ESP="10 5 18 6 8 0 "
if [ "$(printf "$EX" | /tmp/qo_loja | tr '\n' ' ')" = "$ESP" ] && [ "$(printf "$EX" | /tmp/qo_loja_contest | tr '\n' ' ')" = "$ESP" ]; then echo "exemplo ok"; else echo "EXEMPLO DO TEXTO FALHOU"; printf "$EX" | /tmp/qo_loja | tr '\n' ' '; exit 1; fi
for s in $(seq 1 500); do
  python3 -c "
import random; random.seed($s); n=random.randint(1,12); q=random.randint(1,25)
print(n,q); print(*[random.randint(1,9) for _ in range(n)])
for _ in range(q):
    a=random.randint(1,n); b=random.randint(a,n); print(a, b, random.randint(0,10))" > /tmp/in
  a=$(/tmp/qo_loja < /tmp/in); b=$(/tmp/qo_brute < /tmp/in); c=$(/tmp/qo_loja_contest < /tmp/in)
  [ "$a" = "$b" ] && [ "$a" = "$c" ] || { echo "DIFERENTE na semente $s"; cat /tmp/in; exit 1; }
done
echo "stress ok (500 casos, com preços repetidos e limites iguais aos preços)"
python3 -c "
import random; random.seed(1); n=200000; print(n, n); print(*[random.randint(1,10**9) for _ in range(n)])
for i in range(n):
    a=random.randint(1,n); b=random.randint(a,n); print(a, b, random.randint(1,10**9))" > /tmp/in
echo "grande (2e5 produtos de até 1e9, 2e5 perguntas): $(/tmp/qo_loja < /tmp/in | wc -l) respostas, iguais às do contest: $([ "$(/tmp/qo_loja < /tmp/in | md5sum)" = "$(/tmp/qo_loja_contest < /tmp/in | md5sum)" ] && echo sim || echo NAO)"
/tmp/qo_demos
