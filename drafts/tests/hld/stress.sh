#!/usr/bin/env bash
# Compila tudo com avisos, confere o exemplo do texto e compara com a força bruta em árvores aleatórias.
set -e
cd "$(dirname "$0")"
ulimit -s unlimited 2>/dev/null || ulimit -s 1000000   # como nos juízes: pilha grande para a recursão
F="-std=c++17 -O2 -Wall -Wextra -Wshadow"
for p in trilhas trilhas_contest brute demos; do g++ $F $p.cpp -o /tmp/hl_$p; done
EX='12 7\n1 2 4\n2 3 1\n3 4 3\n4 5 2\n5 6 5\n6 7 1\n3 8 2\n8 9 6\n5 10 3\n10 11 2\n1 12 7\nQ 7 9\nQ 11 12\nM 8 1\nQ 7 9\nM 5 8\nQ 6 10\nQ 4 4\n'
ESP=$(printf "$EX" | /tmp/hl_brute | tr '\n' ' ')
if [ "$(printf "$EX" | /tmp/hl_trilhas | tr '\n' ' ')" = "$ESP" ] && [ "$(printf "$EX" | /tmp/hl_trilhas_contest | tr '\n' ' ')" = "$ESP" ]; then echo "exemplo ok: $ESP"; else echo "EXEMPLO DO TEXTO FALHOU"; exit 1; fi
for s in $(seq 1 500); do
  python3 -c "
import random; random.seed($s); n=random.randint(2,14); q=random.randint(1,25); print(n,q)
p=list(range(1,n+1)); random.shuffle(p)
for v in range(2,n+1): print(p[random.randint(max(0,v-4),v-2)], p[v-1], random.randint(1,20))
for _ in range(q):
    if random.random()<0.4: print('M', random.randint(1,n-1), random.randint(1,20))
    else: print('Q', random.randint(1,n), random.randint(1,n))" > /tmp/in
  a=$(/tmp/hl_trilhas < /tmp/in); b=$(/tmp/hl_brute < /tmp/in); c=$(/tmp/hl_trilhas_contest < /tmp/in)
  [ "$a" = "$b" ] && [ "$a" = "$c" ] || { echo "DIFERENTE na semente $s"; cat /tmp/in; exit 1; }
done
echo "stress ok (500 árvores, numeração embaralhada)"
python3 -c "
import random; random.seed(6); n=200000; print(n, n)
for v in range(2,n+1): print(v-1, v, random.randint(1,10**9))
for i in range(n):
    if i%2: print('M', random.randint(1,n-1), random.randint(1,10**9))
    else: print('Q', random.randint(1,n), random.randint(1,n))" > /tmp/in
echo "grande (caminho de 2e5, 1e5 mudanças e 1e5 perguntas): $(/tmp/hl_trilhas < /tmp/in | wc -l) respostas, iguais às do contest: $([ "$(/tmp/hl_trilhas < /tmp/in | md5sum)" = "$(/tmp/hl_trilhas_contest < /tmp/in | md5sum)" ] && echo sim || echo NAO)"
/tmp/hl_demos
