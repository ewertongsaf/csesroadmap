#!/usr/bin/env bash
# Compila tudo com avisos, confere o exemplo do texto e compara com a força bruta em hierarquias aleatórias.
set -e
cd "$(dirname "$0")"
ulimit -s unlimited 2>/dev/null || ulimit -s 1000000   # como nos juízes: pilha grande para a recursão
F="-std=c++17 -O2 -Wall -Wextra -Wshadow"
for p in torcida torcida_contest brute demos; do g++ $F $p.cpp -o /tmp/sl_$p; done
EX='8\n2 1 3 1 1 3 2 3\n1 1 2 2 3 6 6\n'
ESP=$(printf "$EX" | /tmp/sl_brute)
if [ "$(printf "$EX" | /tmp/sl_torcida)" = "$ESP" ] && [ "$(printf "$EX" | /tmp/sl_torcida_contest)" = "$ESP" ]; then echo "exemplo ok: $ESP"; else echo "EXEMPLO DO TEXTO FALHOU"; exit 1; fi
for s in $(seq 1 500); do
  python3 -c "
import random; random.seed($s); n=random.randint(1,14); print(n)
print(*[random.randint(1,4) for _ in range(n)]); print(*[random.randint(1,v-1) for v in range(2,n+1)])" > /tmp/in
  a=$(/tmp/sl_torcida < /tmp/in); b=$(/tmp/sl_brute < /tmp/in); c=$(/tmp/sl_torcida_contest < /tmp/in)
  [ "$a" = "$b" ] && [ "$a" = "$c" ] || { echo "DIFERENTE na semente $s"; cat /tmp/in; exit 1; }
done
echo "stress ok (500 hierarquias, poucos times: muitos empates)"
python3 -c "
n=200000; print(n); print(*range(1,n+1)); print(*range(1,n))" > /tmp/in
echo "grande (cadeia de 2e5, todos os times diferentes): primeira resposta $(/tmp/sl_torcida < /tmp/in | cut -d' ' -f1) (o menor time da empresa inteira é 1)"
/tmp/sl_demos
