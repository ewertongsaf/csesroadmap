#!/usr/bin/env bash
# Compila tudo com avisos, confere o exemplo do texto e compara com a força bruta em árvores aleatórias.
set -e
cd "$(dirname "$0")"
ulimit -s unlimited 2>/dev/null || ulimit -s 1000000   # como nos juízes: pilha grande para a recursão
F="-std=c++17 -O2 -Wall -Wextra -Wshadow"
for p in encontro encontro_contest brute demos barracas; do g++ $F $p.cpp -o /tmp/dt_$p; done
EX='8\n2 1 3 1 2 1 4 1\n1 2 3\n1 3 2\n2 4 4\n2 5 1\n3 6 5\n6 7 2\n6 8 1\n'
ESP=$(printf "$EX" | /tmp/dt_brute)
if [ "$(printf "$EX" | /tmp/dt_encontro)" = "$ESP" ] && [ "$(printf "$EX" | /tmp/dt_encontro_contest)" = "$ESP" ]; then echo "exemplo ok: $ESP"; else echo "EXEMPLO DO TEXTO FALHOU"; exit 1; fi
for s in $(seq 1 500); do
  python3 -c "
import random; random.seed($s); n=random.randint(1,12); print(n); print(*[random.randint(0,9) for _ in range(n)])
p=list(range(1,n+1)); random.shuffle(p)
e=[(p[random.randint(0,v-2)], p[v-1], random.randint(0,9)) for v in range(2,n+1)]; random.shuffle(e)
[print(*x) for x in e]" > /tmp/in
  a=$(/tmp/dt_encontro < /tmp/in); b=$(/tmp/dt_brute < /tmp/in); c=$(/tmp/dt_encontro_contest < /tmp/in)
  [ "$a" = "$b" ] && [ "$a" = "$c" ] || { echo "DIFERENTE na semente $s"; cat /tmp/in; exit 1; }
done
echo "stress ok (500 árvores, numeração embaralhada)"
python3 -c "
n=200000; print(n); print(*[1000]*n)
for v in range(2,n+1): print(v-1, v, 1000)" > /tmp/in
R=$(/tmp/dt_encontro < /tmp/in | tr ' ' '\n' | head -1)
E=$(python3 -c "n=200000; print(1000*1000*n*(n-1)//2)")
[ "$R" = "$E" ] && echo "grande (caminho de 2e5, população e trilhas de 1000): custo da clareira 1 = $R, igual à fórmula" || { echo "GRANDE ERRADO: $R vs $E"; exit 1; }
/tmp/dt_demos
/tmp/dt_barracas
