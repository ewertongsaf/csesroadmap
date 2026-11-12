#!/usr/bin/env bash
# Compila tudo com avisos, confere o exemplo do texto e compara com a força bruta em entradas aleatórias.
set -e
cd "$(dirname "$0")"
F="-std=c++17 -O2 -Wall -Wextra -Wshadow"
for p in noticia noticia_contest brute demos; do g++ $F $p.cpp -o /tmp/bf_$p; done
EX='7 6\n1 2\n1 3\n2 4\n3 4\n4 5\n5 6\n'
if [ "$(printf "$EX" | /tmp/bf_noticia)" = "0 1 1 2 3 4 -1" ] && [ "$(printf "$EX" | /tmp/bf_noticia_contest)" = "0 1 1 2 3 4 -1" ]; then echo "exemplo ok"; else echo "EXEMPLO DO TEXTO FALHOU"; exit 1; fi
for s in $(seq 1 500); do
  python3 -c "
import random; random.seed($s); n=random.randint(1,12); m=random.randint(0,16)
es=set()
for _ in range(m):
    a=random.randint(1,n); b=random.randint(1,n)
    if a!=b: es.add((min(a,b),max(a,b)))
print(n,len(es))
for a,b in es: print(a,b) if random.random()<0.5 else print(b,a)" > /tmp/in
  a=$(/tmp/bf_noticia < /tmp/in); b=$(/tmp/bf_brute < /tmp/in); c=$(/tmp/bf_noticia_contest < /tmp/in)
  [ "$a" = "$b" ] && [ "$a" = "$c" ] || { echo "DIFERENTE na semente $s: $a | $b | $c"; cat /tmp/in; exit 1; }
done
echo "stress ok (500 casos)"
/tmp/bf_demos
