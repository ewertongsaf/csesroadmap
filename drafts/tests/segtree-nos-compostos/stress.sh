#!/usr/bin/env bash
# Compila tudo com avisos, confere o exemplo do texto e compara com a força bruta em entradas aleatórias.
set -e
cd "$(dirname "$0")"
F="-std=c++17 -O2 -Wall -Wextra -Wshadow"
for p in sensor sensor_contest brute demos; do g++ $F $p.cpp -o /tmp/nc_$p; done
EX='8 7\n3 5 7 4 6 8 9 2\nQ 1 8\nQ 2 5\nM 4 8\nQ 1 8\nM 5 9\nQ 1 8\nQ 3 6\n'
ESP="4 2 4 5 3 "
if [ "$(printf "$EX" | /tmp/nc_sensor | tr '\n' ' ')" = "$ESP" ] && [ "$(printf "$EX" | /tmp/nc_sensor_contest | tr '\n' ' ')" = "$ESP" ]; then echo "exemplo ok"; else echo "EXEMPLO DO TEXTO FALHOU"; printf "$EX" | /tmp/nc_sensor | tr '\n' ' '; exit 1; fi
for s in $(seq 1 500); do
  python3 -c "
import random; random.seed($s); n=random.randint(1,13); q=random.randint(1,30)
print(n,q); print(*[random.randint(-5,5) for _ in range(n)])
for _ in range(q):
    if random.random()<0.4: print('M', random.randint(1,n), random.randint(-5,5))
    else:
        a=random.randint(1,n); b=random.randint(a,n); print('Q', a, b)" > /tmp/in
  a=$(/tmp/nc_sensor < /tmp/in); b=$(/tmp/nc_brute < /tmp/in); c=$(/tmp/nc_sensor_contest < /tmp/in)
  [ "$a" = "$b" ] && [ "$a" = "$c" ] || { echo "DIFERENTE na semente $s"; cat /tmp/in; exit 1; }
done
echo "stress ok (500 casos, com temperaturas negativas)"
python3 -c "
import random; random.seed(1); n=200000; print(n, n); print(*range(1, n+1))
for i in range(n):
    if i%2: print('M', random.randint(1,n), random.randint(1,n))
    else: print('Q', random.randint(1,1000), random.randint(199000,n))" > /tmp/in
echo "grande (2e5 dias, 2e5 eventos): $(/tmp/nc_sensor < /tmp/in | wc -l) respostas, iguais às do contest: $([ "$(/tmp/nc_sensor < /tmp/in | md5sum)" = "$(/tmp/nc_sensor_contest < /tmp/in | md5sum)" ] && echo sim || echo NAO)"
/tmp/nc_demos
