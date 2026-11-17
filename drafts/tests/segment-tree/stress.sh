#!/usr/bin/env bash
# Compila tudo com avisos, confere o exemplo do texto e compara com a força bruta em entradas aleatórias.
set -e
cd "$(dirname "$0")"
F="-std=c++17 -O2 -Wall -Wextra -Wshadow"
for p in postos postos_contest brute demos; do g++ $F $p.cpp -o /tmp/sg_$p; done
EX='8 6\n5 3 8 6 2 7 4 6\nQ 1 8\nQ 3 4\nM 5 9\nQ 3 7\nM 2 7\nQ 1 4\n'
ESP="2 6 4 5 "
if [ "$(printf "$EX" | /tmp/sg_postos | tr '\n' ' ')" = "$ESP" ] && [ "$(printf "$EX" | /tmp/sg_postos_contest | tr '\n' ' ')" = "$ESP" ]; then echo "exemplo ok"; else echo "EXEMPLO DO TEXTO FALHOU"; exit 1; fi
for s in $(seq 1 500); do
  python3 -c "
import random; random.seed($s); n=random.randint(1,13); q=random.randint(1,30)
print(n,q); print(*[random.randint(1,30) for _ in range(n)])
for _ in range(q):
    if random.random()<0.4: print('M', random.randint(1,n), random.randint(1,30))
    else:
        a=random.randint(1,n); b=random.randint(a,n); print('Q', a, b)" > /tmp/in
  a=$(/tmp/sg_postos < /tmp/in); b=$(/tmp/sg_brute < /tmp/in); c=$(/tmp/sg_postos_contest < /tmp/in)
  [ "$a" = "$b" ] && [ "$a" = "$c" ] || { echo "DIFERENTE na semente $s"; cat /tmp/in; exit 1; }
done
echo "stress ok (500 casos)"
python3 -c "
import random; random.seed(1); n=200000; print(n, n); print(*[random.randint(1,10**9) for _ in range(n)])
for i in range(n):
    if i%2: print('M', random.randint(1,n), random.randint(1,10**9))
    else: print('Q', random.randint(1,1000), random.randint(199000,n))" > /tmp/in
echo "grande (2e5 valores, 2e5 eventos): $(/tmp/sg_postos < /tmp/in | wc -l) respostas, iguais às do contest: $([ "$(/tmp/sg_postos < /tmp/in | md5sum)" = "$(/tmp/sg_postos_contest < /tmp/in | md5sum)" ] && echo sim || echo NAO)"
/tmp/sg_demos
