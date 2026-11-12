#!/usr/bin/env bash
# Compila tudo com avisos, confere o exemplo do texto e compara com a força bruta em entradas aleatórias.
set -e
cd "$(dirname "$0")"
F="-std=c++17 -O2 -Wall -Wextra -Wshadow"
g++ $F pedagio.cpp -o /tmp/ped && g++ $F pedagio_contest.cpp -o /tmp/pedc && g++ $F brute.cpp -o /tmp/brute && g++ $F demos.cpp -o /tmp/demos
if [ "$(printf '6\n3 9 3 4 6 8\n' | /tmp/ped)" = "18" ] && [ "$(printf '6\n3 9 3 4 6 8\n' | /tmp/pedc)" = "18" ]; then echo "exemplo ok"; else echo "EXEMPLO DO TEXTO FALHOU"; exit 1; fi
for s in $(seq 1 500); do
  python3 -c "import random; random.seed($s); n=random.randint(1,18); print(n); print(*[random.randint(1,10**9 if $s%3==0 else 9) for _ in range(n)])" > /tmp/in
  a=$(/tmp/ped < /tmp/in); b=$(/tmp/brute < /tmp/in); c=$(/tmp/pedc < /tmp/in)
  [ "$a" = "$b" ] && [ "$a" = "$c" ] || { echo "DIFERENTE na semente $s"; cat /tmp/in; exit 1; }
done
echo "stress ok (500 casos)"
/tmp/demos
