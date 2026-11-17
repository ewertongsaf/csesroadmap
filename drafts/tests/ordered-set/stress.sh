#!/usr/bin/env bash
# Compila tudo com avisos, confere os exemplos do texto e compara com a força bruta em entradas aleatórias.
set -e
cd "$(dirname "$0")"
F="-std=c++17 -O2 -Wall -Wextra -Wshadow"
for p in placar placar_contest brute notas brute_notas demos; do g++ $F $p.cpp -o /tmp/os_$p; done
EX='11\nI 50\nI 20\nI 80\nI 30\nK 2\nC 60\nR 30\nK 2\nI 10\nC 30\nK 4\n'
ESP="30 3 50 2 80 "
EX2='8 12\nI 5\nI 2\nI 8\nI 3\nK 2\nC 6\nR 3\nK 2\nI 1\nI 5\nK 4\nC 5\n'
ESP2="3 3 5 5 2 "
if [ "$(printf "$EX" | /tmp/os_placar | tr '\n' ' ')" = "$ESP" ] && [ "$(printf "$EX" | /tmp/os_placar_contest | tr '\n' ' ')" = "$ESP" ] && [ "$(printf "$EX2" | /tmp/os_notas | tr '\n' ' ')" = "$ESP2" ]; then echo "exemplos ok"; else echo "EXEMPLO DO TEXTO FALHOU"; exit 1; fi
for s in $(seq 1 500); do
  python3 -c "
import random; random.seed($s); q=random.randint(1,40); S=set(); out=[]
for _ in range(q):
    t=random.choice('IIIRKC'); x=random.randint(1,12)
    if t=='K':
        if not S: continue
        x=random.randint(1,len(S))
    if t=='I': S.add(x)
    if t=='R': S.discard(x)
    out.append(f'{t} {x}')
print(len(out)); print('\n'.join(out))" > /tmp/in
  a=$(/tmp/os_placar < /tmp/in); b=$(/tmp/os_brute < /tmp/in); c=$(/tmp/os_placar_contest < /tmp/in)
  [ "$a" = "$b" ] && [ "$a" = "$c" ] || { echo "PLACAR DIFERENTE na semente $s"; cat /tmp/in; exit 1; }
  python3 -c "
import random; random.seed($s); m=random.randint(1,9); q=random.randint(1,40); S=[]; out=[]
for _ in range(q):
    t=random.choice('IIIRKC'); x=random.randint(1,m)
    if t=='K':
        if not S: continue
        x=random.randint(1,len(S))
    if t=='I': S.append(x)
    if t=='R' and x in S: S.remove(x)
    out.append(f'{t} {x}')
print(m, len(out)); print('\n'.join(out))" > /tmp/in
  a=$(/tmp/os_notas < /tmp/in); b=$(/tmp/os_brute_notas < /tmp/in)
  [ "$a" = "$b" ] || { echo "NOTAS DIFERENTE na semente $s"; cat /tmp/in; exit 1; }
done
echo "stress ok (500 casos de cada)"
python3 -c "
import random; random.seed(1); q=200000; print(q)
for i in range(q//2): print('I', random.randint(1,10**9))
for i in range(q//2): print('K', random.randint(1,90000))" > /tmp/in
echo "grande (1e5 inserções, 1e5 perguntas K): $(/tmp/os_placar < /tmp/in | wc -l) respostas"
/tmp/os_demos
