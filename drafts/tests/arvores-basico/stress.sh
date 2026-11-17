#!/usr/bin/env bash
# Compila tudo com avisos, confere o exemplo do texto e compara com a força bruta em árvores aleatórias.
set -e
cd "$(dirname "$0")"
ulimit -s unlimited 2>/dev/null || ulimit -s 1000000   # como nos juízes: pilha grande para a recursão
F="-std=c++17 -O2 -Wall -Wextra -Wshadow"
for p in parque parque_contest brute demos enraiza; do g++ $F $p.cpp -o /tmp/ar_$p; done
EX='8\n1 2 3\n1 3 2\n2 4 4\n2 5 1\n3 6 5\n6 7 2\n6 8 1\n'
ESP="16 1 9 "
if [ "$(printf "$EX" | /tmp/ar_parque | tr '\n' ' ')" = "$ESP" ] && [ "$(printf "$EX" | /tmp/ar_parque_contest | tr '\n' ' ')" = "$ESP" ]; then echo "exemplo ok"; else echo "EXEMPLO DO TEXTO FALHOU"; printf "$EX" | /tmp/ar_parque; exit 1; fi
for s in $(seq 1 500); do
  python3 -c "
import random; random.seed($s); n=random.randint(1,12); print(n)
for v in range(2,n+1): print(random.randint(1,v-1), v, random.randint(0,9))" > /tmp/in
  python3 -c "
import random,sys; random.seed($s+7); L=open('/tmp/in').read().split('\n'); h=L[0]; e=[x for x in L[1:] if x.strip()]; random.shuffle(e)
p=list(range(1,int(h)+1)); random.shuffle(p); m={i+1:p[i] for i in range(len(p))}
print(h); [print(m[int(x.split()[0])], m[int(x.split()[1])], x.split()[2]) for x in e]" > /tmp/in2
  for f in /tmp/in /tmp/in2; do
    a=$(/tmp/ar_parque < $f); b=$(/tmp/ar_brute < $f); c=$(/tmp/ar_parque_contest < $f)
    [ "$a" = "$b" ] && [ "$a" = "$c" ] || { echo "DIFERENTE na semente $s"; cat $f; echo "$a / $b / $c"; exit 1; }
  done
done
echo "stress ok (1000 árvores, numeração embaralhada, pesos 0 a 9)"
python3 -c "
n=200000; print(n)
for v in range(2,n+1): print(v-1, v, 10**9)" > /tmp/in
echo "grande (caminho de 2e5 clareiras, trilhas de 1e9): $(/tmp/ar_parque < /tmp/in)"
python3 -c "
import random; random.seed(3); n=200000; print(n)
for v in range(2,n+1): print(random.randint(max(1,v-3),v-1), v, random.randint(1,10**9))" > /tmp/in
echo "grande (árvore aleatória funda): $(/tmp/ar_parque < /tmp/in) | contest: $(/tmp/ar_parque_contest < /tmp/in)"
/tmp/ar_demos
/tmp/ar_enraiza
