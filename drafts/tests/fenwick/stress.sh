#!/usr/bin/env bash
# Compila tudo com avisos, confere o exemplo do texto e compara com a força bruta em entradas aleatórias.
set -e
cd "$(dirname "$0")"
F="-std=c++17 -O2 -Wall -Wextra -Wshadow"
for p in deposito deposito_contest brute demos; do g++ $F $p.cpp -o /tmp/fw_$p; done
EX='8 7\n3 1 4 1 5 9 2 6\nS 1 7\nA 3 2\nS 1 7\nS 4 7\nA 6 -4\nS 4 7\nS 3 3\n'
ESP="25 27 17 13 6 "
if [ "$(printf "$EX" | /tmp/fw_deposito | tr '\n' ' ')" = "$ESP" ] && [ "$(printf "$EX" | /tmp/fw_deposito_contest | tr '\n' ' ')" = "$ESP" ]; then echo "exemplo ok"; else echo "EXEMPLO DO TEXTO FALHOU"; exit 1; fi
for s in $(seq 1 500); do
  python3 -c "
import random; random.seed($s); n=random.randint(1,12); q=random.randint(1,30)
print(n,q); print(*[random.randint(-20,20) for _ in range(n)])
for _ in range(q):
    if random.random()<0.4: print('A', random.randint(1,n), random.randint(-20,20))
    else:
        a=random.randint(1,n); b=random.randint(a,n); print('S', a, b)" > /tmp/in
  a=$(/tmp/fw_deposito < /tmp/in); b=$(/tmp/fw_brute < /tmp/in); c=$(/tmp/fw_deposito_contest < /tmp/in)
  [ "$a" = "$b" ] && [ "$a" = "$c" ] || { echo "DIFERENTE na semente $s"; cat /tmp/in; exit 1; }
done
echo "stress ok (500 casos)"
python3 -c "
import random; random.seed(1); n=200000; print(n, n); print(*[10**9]*n)
for i in range(n):
    if i%2: print('A', random.randint(1,n), 10**9)
    else: print('S', 1, n)" > /tmp/in
echo "grande (2e5 valores de 1e9, 2e5 eventos), última soma: $(/tmp/fw_deposito < /tmp/in | tail -1)"
/tmp/fw_demos
