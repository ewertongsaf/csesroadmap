#!/usr/bin/env bash
# Compila tudo com avisos, confere o exemplo do texto e compara com a força bruta em árvores aleatórias.
set -e
cd "$(dirname "$0")"
ulimit -s unlimited 2>/dev/null || ulimit -s 1000000   # como nos juízes: pilha grande para a recursão
F="-std=c++17 -O2 -Wall -Wextra -Wshadow"
for p in trilhas trilhas_contest brute demos; do g++ $F $p.cpp -o /tmp/bl_$p; done
EX='12 5\n1 2 4\n2 3 1\n3 4 3\n4 5 2\n5 6 5\n6 7 1\n3 8 2\n8 9 6\n5 10 3\n10 11 2\n1 12 7\n7 11\n9 7\n11 12\n6 9\n10 4\n'
ESP=$(printf "$EX" | /tmp/bl_brute | tr '\n' ' ')
if [ "$(printf "$EX" | /tmp/bl_trilhas | tr '\n' ' ')" = "$ESP" ] && [ "$(printf "$EX" | /tmp/bl_trilhas_contest | tr '\n' ' ')" = "$ESP" ]; then echo "exemplo ok: $ESP"; else echo "EXEMPLO DO TEXTO FALHOU"; exit 1; fi
for s in $(seq 1 500); do
  python3 -c "
import random; random.seed($s); n=random.randint(1,14); q=random.randint(1,20); print(n,q)
p=list(range(1,n+1)); random.shuffle(p)
e=[(p[random.randint(max(0,v-3),v-2)], p[v-1], random.randint(0,9)) for v in range(2,n+1)]; random.shuffle(e)
[print(*x) for x in e]
for _ in range(q): print(random.randint(1,n), random.randint(1,n))" > /tmp/in
  a=$(/tmp/bl_trilhas < /tmp/in); b=$(/tmp/bl_brute < /tmp/in); c=$(/tmp/bl_trilhas_contest < /tmp/in)
  [ "$a" = "$b" ] && [ "$a" = "$c" ] || { echo "DIFERENTE na semente $s"; cat /tmp/in; exit 1; }
done
echo "stress ok (500 árvores fundas, numeração embaralhada)"
python3 -c "
import random; random.seed(2); n=200000; print(n, n)
for v in range(2,n+1): print(v-1, v, 10**9)
for _ in range(n): print(random.randint(1,n), random.randint(1,n))" > /tmp/in
R=$(/tmp/bl_trilhas < /tmp/in | head -3 | tr '\n' ' ')
E=$(python3 -c "
import random; random.seed(2); n=200000
qs=[(random.randint(1,n), random.randint(1,n)) for _ in range(n)]
print(' '.join(str(abs(a-b)*10**9) for a,b in qs[:3]))")
[ "$R" = "$E " ] && echo "grande (caminho de 2e5, trilhas de 1e9, 2e5 perguntas): as primeiras respostas batem com |a-b|·1e9" || { echo "GRANDE ERRADO: $R vs $E"; exit 1; }
/tmp/bl_demos
