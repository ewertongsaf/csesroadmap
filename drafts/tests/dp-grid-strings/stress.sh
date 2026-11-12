#!/usr/bin/env bash
# Compila tudo com avisos, confere os exemplos do texto e compara com a força bruta em entradas aleatórias.
set -e
cd "$(dirname "$0")"
F="-std=c++17 -O2 -Wall -Wextra -Wshadow"
for p in grid grid_contest grid_brute palavras palavras_brute demos; do g++ $F $p.cpp -o /tmp/gs_$p; done
EX='3 4\n1 4 8 6\n6 9 1 8\n3 4 1 5\n'
if [ "$(printf "$EX" | /tmp/gs_grid)" = "32" ] && [ "$(printf "$EX" | /tmp/gs_grid_contest)" = "32" ] && [ "$(echo 'casa saco' | /tmp/gs_palavras)" = "4" ]; then echo "exemplos ok"; else echo "EXEMPLO DO TEXTO FALHOU"; exit 1; fi
for s in $(seq 1 400); do
  python3 -c "
import random; random.seed($s); n=random.randint(1,6); m=random.randint(1,6)
print(n,m)
lo = -9 if $s%3==0 else 0
for _ in range(n): print(*[random.randint(lo, 10**9 if $s%5==0 else 9) for _ in range(m)])" > /tmp/in
  a=$(/tmp/gs_grid < /tmp/in); b=$(/tmp/gs_grid_brute < /tmp/in); c=$(/tmp/gs_grid_contest < /tmp/in)
  [ "$a" = "$b" ] && [ "$a" = "$c" ] || { echo "GRID DIFERENTE na semente $s: $a $b $c"; cat /tmp/in; exit 1; }
  python3 -c "
import random; random.seed($s)
print(''.join(random.choice('abc') for _ in range(random.randint(1,10))), ''.join(random.choice('abc') for _ in range(random.randint(1,10))))" > /tmp/in
  a=$(/tmp/gs_palavras < /tmp/in); b=$(/tmp/gs_palavras_brute < /tmp/in)
  [ "$a" = "$b" ] || { echo "PALAVRAS DIFERENTE na semente $s"; cat /tmp/in; exit 1; }
done
echo "stress ok (400 casos de cada)"
/tmp/gs_demos
