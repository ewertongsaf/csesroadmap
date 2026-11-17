#!/usr/bin/env python3
"""Mede uma aula (content/modules/<slug>.mdx) contra o padrão de qualidade de docs/padrao-aulas.md.

Uso: python3 scripts/lesson-metrics.py <slug> [<slug> ...]   (sem argumentos: as aulas de referência)
"""
import re, sys, os, glob

REF = ['dp-introducao', 'dp-mochila', 'dp-grid-strings', 'lis', 'grafos-dfs', 'bfs', 'dijkstra',
       'bellman-ford-floyd', 'dag-toposort', 'dsu', 'mst', 'fenwick', 'segment-tree', 'ordered-set']

def metrics(slug):
    src = open(f'content/modules/{slug}.mdx', encoding='utf8').read()
    body = src.split('---', 2)[2]
    code_blocks = re.findall(r'```cpp\n(.*?)```', body, re.S)
    nocode = re.sub(r'```.*?```', '', body, flags=re.S)
    nocode_noquiz = nocode.split('<Quiz')[0]
    quiz = body.split('<Quiz')[1] if '<Quiz' in body else ''
    h2 = re.findall(r'^## (.+)$', body, re.M)
    paras = [p for p in re.split(r'\n\s*\n', nocode_noquiz) if p.strip() and not p.lstrip().startswith(('|', '#', '<', '-', '>', '$$', 'import')) and not re.match(r'\s*\d+\. ', p)]
    words = [len(p.split()) for p in paras]
    tests = os.path.isdir(f'drafts/tests/{slug}')
    m = {
        'palavras': len(nocode_noquiz.split()),
        'secoes': len(h2),
        'tabelas': len(re.findall(r'^\|[-| :]+\|\s*$', body, re.M)),
        'tente': body.count('<Callout type="tente">'),
        'viz': len(re.findall(r'<\w+Viz\b|<\w+(Playground|Lab|Calculator)\b', body)),
        'cpp': len(code_blocks),
        'mains': sum('int main' in c for c in code_blocks),
        'linhas_main': max([c.count('\n') for c in code_blocks if 'int main' in c] or [0]),
        'formulas': len(re.findall(r'\$\$', body)) // 2,
        'quiz': quiz.count("q: '"),
        'quiz_code': quiz.count("code: '"),
        'para_depois': body.count('class="para-depois"'),
        'armadilhas': len(re.findall(r'^- \*\*', body.split('## Armadilhas')[1].split('\n## ')[0], re.M)) if '## Armadilhas' in body else 0,
        'contraex': len(re.findall(r'errad|em vez de|daria|responderia|contraexemplo', nocode_noquiz, re.I)),
        'paragrafo_max': max(words or [0]),
        'testes': tests and os.path.exists(f'drafts/tests/{slug}/stress.sh'),
        'secoes_obrig': all(any(k in h for h in h2) for k in ['Motivação', 'Código', 'Armadilhas', 'Referências', 'Mini-quiz']),
        'fecha': 'Entrada' in body and 'Saída' in body,
        'contest': 'formato de contest' in body,
    }
    return m

if __name__ == '__main__':
    slugs = sys.argv[1:] or REF
    cols = ['palavras', 'secoes', 'tabelas', 'tente', 'viz', 'cpp', 'mains', 'linhas_main', 'formulas', 'quiz', 'quiz_code', 'armadilhas', 'contraex', 'paragrafo_max']
    print(f"{'aula':22}" + ''.join(f'{c[:9]:>10}' for c in cols) + '  ok?')
    rows = []
    for s in slugs:
        m = metrics(s); rows.append(m)
        flags = ''.join(['T' if m['testes'] else '-', 'S' if m['secoes_obrig'] else '-', 'F' if m['fecha'] else '-', 'C' if m['contest'] else '-', 'D' if m['para_depois'] else '-'])
        print(f'{s:22}' + ''.join(f'{m[c]:>10}' for c in cols) + '  ' + flags)
    if len(rows) > 1:
        print(f"{'média':22}" + ''.join(f'{sum(r[c] for r in rows)/len(rows):>10.1f}' for c in cols))
        print(f"{'mínimo':22}" + ''.join(f'{min(r[c] for r in rows):>10}' for c in cols))
    print('\nok?: T=testes em drafts/tests, S=seções obrigatórias, F=fecha com entrada/saída, C=versão de contest, D=bloco "para depois"')
