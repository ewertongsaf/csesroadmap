#!/usr/bin/env bash
# Compila tudo com avisos, confere o exemplo do texto e compara com a força bruta em hierarquias aleatórias.
set -e
cd "$(dirname "$0")"
ulimit -s unlimited 2>/dev/null || ulimit -s 1000000   # como nos juízes: pilha grande para a recursão
F="-std=c++17 -O2 -Wall -Wextra -Wshadow"
for p in bonus bonus_contest brute demos; do g++ $F $p.cpp -o /tmp/et_$p; done
EX='8 8\n10 7 8 5 4 6 3 2\n1 1 2 2 3 6 6\nQ 7\nB 3 5\nQ 7\nB 2 2\nB 1 1\nQ 5\nQ 6\nQ 1\n'
ESP=$(printf "$EX" | /tmp/et_brute | tr '\n' ' ')
if [ "$(printf "$EX" | /tmp/et_bonus | tr '\n' ' ')" = "$ESP" ] && [ "$(printf "$EX" | /tmp/et_bonus_contest | tr '\n' ' ')" = "$ESP" ]; then echo "exemplo ok: $ESP"; else echo "EXEMPLO DO TEXTO FALHOU"; exit 1; fi
for s in $(seq 1 500); do
  python3 -c "
import random; random.seed($s); n=random.randint(1,12); q=random.randint(1,25); print(n,q)
print(*[random.randint(1,20) for _ in range(n)]); print(*[random.randint(1,v-1) for v in range(2,n+1)])
for _ in range(q):
    if random.random()<0.5: print('B', random.randint(1,n), random.randint(-5,9))
    else: print('Q', random.randint(1,n))" > /tmp/in
  a=$(/tmp/et_bonus < /tmp/in); b=$(/tmp/et_brute < /tmp/in); c=$(/tmp/et_bonus_contest < /tmp/in)
  [ "$a" = "$b" ] && [ "$a" = "$c" ] || { echo "DIFERENTE na semente $s"; cat /tmp/in; exit 1; }
done
echo "stress ok (500 hierarquias)"
python3 -c "
n=200000; print(n, n); print(*[10**9]*n); print(*range(1,n))
for i in range(n):
    print('B', 1, 10**9) if i%2==0 else print('Q', n)" > /tmp/in
R=$(/tmp/et_bonus < /tmp/in | tail -1); E=$(python3 -c "print(10**9 + 100000*10**9)")
[ "$R" = "$E" ] && echo "grande (cadeia de 2e5 funcionários, 1e5 bônus para todos): último salário $R, igual à conta" || { echo "GRANDE ERRADO: $R vs $E"; exit 1; }
/tmp/et_demos
