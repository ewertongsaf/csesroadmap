#!/usr/bin/env bash
# Compila tudo com avisos, confere o exemplo do texto e compara com a força bruta em entradas aleatórias.
set -e
cd "$(dirname "$0")"
F="-std=c++17 -O2 -Wall -Wextra -Wshadow"
for p in entregas entregas_contest brute demos; do g++ $F $p.cpp -o /tmp/dj_$p; done
EX='5 6\n1 2 7\n1 3 2\n3 2 3\n2 4 1\n3 4 8\n4 5 2\n'
if [ "$(printf "$EX" | /tmp/dj_entregas)" = "0 5 2 6 8" ] && [ "$(printf "$EX" | /tmp/dj_entregas_contest)" = "0 5 2 6 8" ]; then echo "exemplo ok"; else echo "EXEMPLO DO TEXTO FALHOU"; exit 1; fi
for s in $(seq 1 500); do
  python3 -c "
import random; random.seed($s); n=random.randint(1,10); m=random.randint(0,18)
print(n,m)
for _ in range(m): print(random.randint(1,n), random.randint(1,n), random.randint(0 if $s%7==0 else 1, 10**9 if $s%5==0 else 12))" > /tmp/in
  a=$(/tmp/dj_entregas < /tmp/in); b=$(/tmp/dj_brute < /tmp/in); c=$(/tmp/dj_entregas_contest < /tmp/in)
  [ "$a" = "$b" ] && [ "$a" = "$c" ] || { echo "DIFERENTE na semente $s: $a | $b | $c"; cat /tmp/in; exit 1; }
done
echo "stress ok (500 casos)"
python3 -c "
import random; random.seed(9); n=100000; m=200000
print(n,m)
for i in range(1,n): print(i,i+1,10**9)
for _ in range(m-n+1): print(random.randint(1,n), random.randint(1,n), random.randint(1,10**9))" > /tmp/in
echo "grande (1e5 vertices, 2e5 estradas): ultima distancia = $(/tmp/dj_entregas < /tmp/in | awk '{print $NF}')"
/tmp/dj_demos
