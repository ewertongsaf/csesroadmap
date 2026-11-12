#!/usr/bin/env bash
# Compila tudo com avisos, confere o exemplo do texto e compara com a força bruta em entradas aleatórias.
set -e
cd "$(dirname "$0")"
F="-std=c++17 -O2 -Wall -Wextra -Wshadow"
for p in grupos grupos_contest brute demos; do g++ $F $p.cpp -o /tmp/gd_$p; done
EX='8 6\n1 2\n1 3\n2 4\n3 4\n5 6\n6 7\n'
if [ "$(printf "$EX" | /tmp/gd_grupos)" = "3 4" ] && [ "$(printf "$EX" | /tmp/gd_grupos_contest)" = "3 4" ]; then echo "exemplo ok"; else echo "EXEMPLO DO TEXTO FALHOU"; exit 1; fi
for s in $(seq 1 500); do
  python3 -c "
import random; random.seed($s); n=random.randint(1,12); m=random.randint(0,14)
es=set()
for _ in range(m):
    a=random.randint(1,n); b=random.randint(1,n)
    if a!=b: es.add((min(a,b),max(a,b)))
print(n,len(es))
for a,b in es: print(a,b) if random.random()<0.5 else print(b,a)" > /tmp/in
  a=$(/tmp/gd_grupos < /tmp/in); b=$(/tmp/gd_brute < /tmp/in); c=$(/tmp/gd_grupos_contest < /tmp/in)
  [ "$a" = "$b" ] && [ "$a" = "$c" ] || { echo "DIFERENTE na semente $s: $a | $b | $c"; cat /tmp/in; exit 1; }
done
echo "stress ok (500 casos)"
python3 -c "print(100000, 99999); [print(i, i+1) for i in range(1, 100000)]" > /tmp/in; echo "cadeia de 1e5: $(/tmp/gd_grupos < /tmp/in)"
/tmp/gd_demos
