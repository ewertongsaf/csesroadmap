#!/usr/bin/env bash
# Compila tudo com avisos, confere o exemplo do texto e compara com a força bruta em entradas aleatórias.
set -e
cd "$(dirname "$0")"
F="-std=c++17 -O2 -Wall -Wextra -Wshadow"
for p in fibra fibra_contest brute demos; do g++ $F $p.cpp -o /tmp/ms_$p; done
EX='5 7\n1 2 4\n1 3 2\n2 3 1\n2 4 5\n3 4 8\n3 5 10\n4 5 3\n'
if [ "$(printf "$EX" | /tmp/ms_fibra)" = "11" ] && [ "$(printf "$EX" | /tmp/ms_fibra_contest)" = "11" ] && [ "$(printf '4 2\n1 2 3\n3 4 1\n' | /tmp/ms_fibra)" = "IMPOSSIVEL" ]; then echo "exemplos ok"; else echo "EXEMPLO DO TEXTO FALHOU"; exit 1; fi
for s in $(seq 1 500); do
  python3 -c "
import random; random.seed($s); n=random.randint(1,7); m=random.randint(0,11)
print(n,m)
for _ in range(m):
    a=random.randint(1,n); b=random.randint(1,n)
    print(a,b,random.randint(1,10**9 if $s%5==0 else 9))" > /tmp/in
  a=$(/tmp/ms_fibra < /tmp/in); b=$(/tmp/ms_brute < /tmp/in); c=$(/tmp/ms_fibra_contest < /tmp/in)
  [ "$a" = "$b" ] && [ "$a" = "$c" ] || { echo "DIFERENTE na semente $s: $a | $b | $c"; cat /tmp/in; exit 1; }
done
echo "stress ok (500 casos)"
/tmp/ms_demos
