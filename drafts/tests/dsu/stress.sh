#!/usr/bin/env bash
# Compila tudo com avisos, confere o exemplo do texto e compara com a força bruta em entradas aleatórias.
set -e
cd "$(dirname "$0")"
F="-std=c++17 -O2 -Wall -Wextra -Wshadow"
for p in rede rede_contest brute demos; do g++ $F $p.cpp -o /tmp/ds_$p; done
EX='6 10\nL 1 2\nL 3 4\nP 1 3\nL 2 3\nP 1 4\nL 5 6\nP 4 6\nL 6 1\nP 4 6\nL 2 5\n'
if [ "$(printf "$EX" | /tmp/ds_rede | tr '\n' ' ')" = "NAO SIM NAO SIM " ] && [ "$(printf "$EX" | /tmp/ds_rede_contest | tr '\n' ' ')" = "NAO SIM NAO SIM " ]; then echo "exemplo ok"; else echo "EXEMPLO DO TEXTO FALHOU"; exit 1; fi
for s in $(seq 1 500); do
  python3 -c "
import random; random.seed($s); n=random.randint(1,12); q=random.randint(1,30)
print(n,q)
for _ in range(q): print(random.choice('LLP'), random.randint(1,n), random.randint(1,n))" > /tmp/in
  a=$(/tmp/ds_rede < /tmp/in); b=$(/tmp/ds_brute < /tmp/in); c=$(/tmp/ds_rede_contest < /tmp/in)
  [ "$a" = "$b" ] && [ "$a" = "$c" ] || { echo "DIFERENTE na semente $s"; cat /tmp/in; exit 1; }
done
echo "stress ok (500 casos)"
python3 -c "
n=200000; print(n, 2*n)
for i in range(1,n): print('L', i, i+1)
for i in range(n+1): print('P', 1, n)" > /tmp/in
echo "grande (2e5 computadores em cadeia, 2e5 perguntas): $(/tmp/ds_rede < /tmp/in | sort | uniq -c | tr '\n' ' ')"
/tmp/ds_demos
