#!/usr/bin/env bash
# Compila tudo com avisos, confere o exemplo do texto e compara com a força bruta em entradas aleatórias.
set -e
cd "$(dirname "$0")"
F="-std=c++17 -O2 -Wall -Wextra -Wshadow"
g++ $F mochila.cpp -o /tmp/moc && g++ $F mochila_contest.cpp -o /tmp/mocc && g++ $F brute.cpp -o /tmp/mocb && g++ $F demos.cpp -o /tmp/mocd
EX='4 10\n6 8\n4 10\n7 11\n2 6\n'
if [ "$(printf "$EX" | /tmp/moc)" = "18" ] && [ "$(printf "$EX" | /tmp/mocc)" = "18" ]; then echo "exemplo ok"; else echo "EXEMPLO DO TEXTO FALHOU"; exit 1; fi
for s in $(seq 1 500); do
  python3 -c "
import random; random.seed($s); n=random.randint(1,14); C=random.randint(1,40)
print(n,C)
for _ in range(n): print(random.randint(1,15), random.randint(1,10**9 if $s%4==0 else 20))" > /tmp/in
  a=$(/tmp/moc < /tmp/in); b=$(/tmp/mocb < /tmp/in); c=$(/tmp/mocc < /tmp/in)
  [ "$a" = "$b" ] && [ "$a" = "$c" ] || { echo "DIFERENTE na semente $s"; cat /tmp/in; exit 1; }
done
echo "stress ok (500 casos)"
/tmp/mocd
