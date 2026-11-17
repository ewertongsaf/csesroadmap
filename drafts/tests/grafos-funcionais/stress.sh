#!/usr/bin/env bash
# Compila tudo com avisos, confere o exemplo do texto e compara com a força bruta em grafos aleatórios.
set -e
cd "$(dirname "$0")"
F="-std=c++17 -O2 -Wall -Wextra -Wshadow"
for p in correio correio_contest brute demos floyd; do g++ $F $p.cpp -o /tmp/gf_$p; done
EX='8 5\n2 3 4 5 3 1 6 4\n5 1 2 4 3 6 2 7\n7 4\n1 10\n8 5\n6 1\n3 1000000000\n'
ESP=$(python3 -c "
S=[0,2,3,4,5,3,1,6,4]; C=[0,5,1,2,4,3,6,2,7]
def f(x,k):
    p=0
    while k:
        if k>3000 and x in (3,4,5):
            ciclo=C[3]+C[4]+C[5]; v=k//3; p+=v*ciclo; k-=v*3
            continue
        p+=C[x]; x=S[x]; k-=1
    return f'{x} {p}'
print(' '.join(f(x,k) for x,k in [(7,4),(1,10),(8,5),(6,1),(3,10**9)]))")
if [ "$(printf "$EX" | /tmp/gf_correio | tr '\n' ' ')" = "$ESP " ] && [ "$(printf "$EX" | /tmp/gf_correio_contest | tr '\n' ' ')" = "$ESP " ]; then echo "exemplo ok: $ESP"; else echo "EXEMPLO DO TEXTO FALHOU: $(printf "$EX" | /tmp/gf_correio | tr '\n' ' ') vs $ESP"; exit 1; fi
for s in $(seq 1 500); do
  python3 -c "
import random; random.seed($s); n=random.randint(1,12); q=random.randint(1,15); print(n,q)
print(*[random.randint(1,n) for _ in range(n)]); print(*[random.randint(0,9) for _ in range(n)])
for _ in range(q): print(random.randint(1,n), random.randint(0,3000))" > /tmp/in
  a=$(/tmp/gf_correio < /tmp/in); b=$(/tmp/gf_brute < /tmp/in); c=$(/tmp/gf_correio_contest < /tmp/in)
  [ "$a" = "$b" ] && [ "$a" = "$c" ] || { echo "DIFERENTE na semente $s"; cat /tmp/in; exit 1; }
done
echo "stress ok (500 grafos, k até 3000, contra a simulação passo a passo)"
python3 -c "
import random; random.seed(5); n=200000; print(n, n); print(*[random.randint(1,n) for _ in range(n)]); print(*[10**6]*n)
for _ in range(n): print(random.randint(1,n), 10**9)" > /tmp/in
echo "grande (2e5 cidades, 2e5 perguntas com k = 1e9, pedágio 1e6): primeira resposta $(/tmp/gf_correio < /tmp/in | head -1) (o pedágio tem de ser 1e15)"
/tmp/gf_demos
/tmp/gf_floyd
