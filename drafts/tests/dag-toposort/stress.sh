#!/usr/bin/env bash
# Compila tudo com avisos, confere os exemplos do texto e compara com a força bruta em entradas aleatórias.
set -e
cd "$(dirname "$0")"
F="-std=c++17 -O2 -Wall -Wextra -Wshadow"
for p in tarefas tarefas_contest brute demos; do g++ $F $p.cpp -o /tmp/tp_$p; done
EX='6 6\n3 2 4 1 2 3\n1 3\n2 3\n2 4\n3 5\n4 5\n4 6\n'
EX2='6 7\n3 2 4 1 2 3\n1 3\n2 3\n2 4\n3 5\n4 5\n4 6\n5 2\n'
if [ "$(printf "$EX" | /tmp/tp_tarefas)" = "9" ] && [ "$(printf "$EX" | /tmp/tp_tarefas_contest)" = "9" ] && [ "$(printf "$EX2" | /tmp/tp_tarefas)" = "IMPOSSIVEL" ]; then echo "exemplos ok"; else echo "EXEMPLO DO TEXTO FALHOU"; exit 1; fi
for s in $(seq 1 600); do
  python3 -c "
import random; random.seed($s); n=random.randint(1,8); m=random.randint(0,11)
perm=list(range(1,n+1)); random.shuffle(perm); es=set()
for _ in range(m):
    i=random.randrange(n); j=random.randrange(n)
    if i==j: continue
    if $s%3: i,j=min(i,j),max(i,j)   # dois terços dos casos sem ciclo
    es.add((perm[i],perm[j]))
print(n,len(es)); print(*[random.randint(1,10**9 if $s%5==0 else 9) for _ in range(n)])
for a,b in es: print(a,b)" > /tmp/in
  a=$(/tmp/tp_tarefas < /tmp/in); b=$(/tmp/tp_brute < /tmp/in); c=$(/tmp/tp_tarefas_contest < /tmp/in)
  [ "$a" = "$b" ] && [ "$a" = "$c" ] || { echo "DIFERENTE na semente $s: $a | $b | $c"; cat /tmp/in; exit 1; }
done
echo "stress ok (600 casos)"
/tmp/tp_demos
