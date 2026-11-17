#!/usr/bin/env bash
# Compila tudo com avisos, confere o exemplo do texto e compara com a força bruta em entradas aleatórias.
set -e
cd "$(dirname "$0")"
F="-std=c++17 -O2 -Wall -Wextra -Wshadow"
for p in calor calor_contest brute demos persistente; do g++ $F $p.cpp -o /tmp/lz_$p; done
EX='8 7\n2 6 1 8 3 5 4 7\nQ 1 8\nS 1 4 3\nQ 3 6\nS 5 8 -2\nS 2 7 4\nQ 5 8\nQ 1 2\n'
ESP="8 11 7 13 "
if [ "$(printf "$EX" | /tmp/lz_calor | tr '\n' ' ')" = "$ESP" ] && [ "$(printf "$EX" | /tmp/lz_calor_contest | tr '\n' ' ')" = "$ESP" ]; then echo "exemplo ok"; else echo "EXEMPLO DO TEXTO FALHOU"; printf "$EX" | /tmp/lz_calor | tr '\n' ' '; exit 1; fi
for s in $(seq 1 500); do
  python3 -c "
import random; random.seed($s); n=random.randint(1,13); q=random.randint(1,30)
print(n,q); print(*[random.randint(-9,9) for _ in range(n)])
for _ in range(q):
    a=random.randint(1,n); b=random.randint(a,n)
    if random.random()<0.5: print('S', a, b, random.randint(-5,5))
    else: print('Q', a, b)" > /tmp/in
  a=$(/tmp/lz_calor < /tmp/in); b=$(/tmp/lz_brute < /tmp/in); c=$(/tmp/lz_calor_contest < /tmp/in)
  [ "$a" = "$b" ] && [ "$a" = "$c" ] || { echo "DIFERENTE na semente $s"; cat /tmp/in; exit 1; }
done
echo "stress ok (500 casos)"
python3 -c "
import random; random.seed(1); n=200000; print(n, n); print(*[random.randint(-10**9,10**9) for _ in range(n)])
for i in range(n):
    a=random.randint(1,n); b=random.randint(a,n)
    if i%2: print('S', a, b, random.randint(-10**9,10**9))
    else: print('Q', a, b)" > /tmp/in
echo "grande (2e5 dias, 2e5 eventos, somas de até 1e9): $(/tmp/lz_calor < /tmp/in | wc -l) respostas, iguais às do contest: $([ "$(/tmp/lz_calor < /tmp/in | md5sum)" = "$(/tmp/lz_calor_contest < /tmp/in | md5sum)" ] && echo sim || echo NAO)"
/tmp/lz_demos
/tmp/lz_persistente
