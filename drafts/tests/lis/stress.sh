#!/usr/bin/env bash
# Compila tudo com avisos, confere o exemplo do texto e compara com a força bruta em entradas aleatórias.
set -e
cd "$(dirname "$0")"
F="-std=c++17 -O2 -Wall -Wextra -Wshadow"
for p in lis lis_contest quad brute demos; do g++ $F $p.cpp -o /tmp/lis_$p; done
EX='8\n5 2 2 7 3 3 8 3\n'
if [ "$(printf "$EX" | /tmp/lis_lis)" = "5" ] && [ "$(printf "$EX" | /tmp/lis_lis_contest)" = "5" ] && [ "$(printf "$EX" | /tmp/lis_quad)" = "5" ]; then echo "exemplo ok"; else echo "EXEMPLO DO TEXTO FALHOU"; exit 1; fi
for s in $(seq 1 500); do
  python3 -c "
import random; random.seed($s); n=random.randint(1,15)
print(n); print(*[random.randint(1, 10**9 if $s%5==0 else 6) for _ in range(n)])" > /tmp/in
  a=$(/tmp/lis_lis < /tmp/in); b=$(/tmp/lis_brute < /tmp/in); c=$(/tmp/lis_lis_contest < /tmp/in); d=$(/tmp/lis_quad < /tmp/in)
  [ "$a" = "$b" ] && [ "$a" = "$c" ] && [ "$a" = "$d" ] || { echo "DIFERENTE na semente $s"; cat /tmp/in; exit 1; }
done
echo "stress ok (500 casos)"
/tmp/lis_demos
