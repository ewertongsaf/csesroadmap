#!/usr/bin/env bash
# Compila tudo com avisos, confere os exemplos do texto e compara com a força bruta em entradas aleatórias.
set -e
cd "$(dirname "$0")"
F="-std=c++17 -O2 -Wall -Wextra -Wshadow"
for p in pedagios pedagios_contest pedagios_brute todos demos; do g++ $F $p.cpp -o /tmp/bfw_$p; done
EX='5 5\n4 5 1\n2 4 2\n3 2 -3\n1 2 4\n1 3 5\n'
EX2='5 6\n4 5 1\n2 4 2\n3 2 -3\n1 2 4\n1 3 5\n5 3 -1\n'
EX3='4 5 3\n1 2 3\n2 3 1\n1 3 7\n3 4 2\n4 1 4\n1 3\n3 2\n4 4\n'
if [ "$(printf "$EX" | /tmp/bfw_pedagios)" = "0 2 5 4 5" ] && [ "$(printf "$EX" | /tmp/bfw_pedagios_contest)" = "0 2 5 4 5" ] && [ "$(printf "$EX2" | /tmp/bfw_pedagios)" = "CICLO NEGATIVO" ] && [ "$(printf "$EX3" | /tmp/bfw_todos | tr '\n' ' ')" = "4 9 0 " ]; then echo "exemplos ok"; else echo "EXEMPLO DO TEXTO FALHOU"; exit 1; fi
for s in $(seq 1 600); do
  python3 -c "
import random; random.seed($s); n=random.randint(1,7); m=random.randint(0,10)
es=[]
for _ in range(m):
    a=random.randint(1,n); b=random.randint(1,n)
    if a!=b: es.append((a,b,random.randint(-4 if $s%2 else -1, 9)))
print(n,len(es))
for e in es: print(*e)" > /tmp/in
  a=$(/tmp/bfw_pedagios < /tmp/in); b=$(/tmp/bfw_pedagios_brute < /tmp/in); c=$(/tmp/bfw_pedagios_contest < /tmp/in)
  [ "$a" = "$b" ] && [ "$a" = "$c" ] || { echo "DIFERENTE na semente $s: $a | $b | $c"; cat /tmp/in; exit 1; }
done
echo "stress Bellman-Ford ok (600 casos)"
# Floyd-Warshall contra um Bellman-Ford por origem (pesos não negativos e também negativos sem ciclo negativo)
python3 - <<'PY'
import random, subprocess
random.seed(4); ok=0
for t in range(300):
    n=random.randint(1,7); es=[]
    for _ in range(random.randint(0,12)):
        a,b=random.randint(1,n),random.randint(1,n)
        if a!=b: es.append((a,b,random.randint(0,9)))
    qs=[(random.randint(1,n),random.randint(1,n)) for _ in range(6)]
    inp=f"{n} {len(es)} {len(qs)}\n"+"".join(f"{a} {b} {w}\n" for a,b,w in es)+"".join(f"{a} {b}\n" for a,b in qs)
    out=subprocess.run(['/tmp/bfw_todos'],input=inp,capture_output=True,text=True).stdout.split()
    INF=10**18
    for (a,b),o in zip(qs,out):
        d=[INF]*(n+1); d[a]=0
        for _ in range(n):
            for x,y,w in es:
                if d[x]<INF and d[x]+w<d[y]: d[y]=d[x]+w
        assert o==('x' if d[b]==INF else str(d[b])),(inp,a,b,o,d[b])
    ok+=1
print("stress Floyd-Warshall ok (%d casos)"%ok)
PY
/tmp/bfw_demos
