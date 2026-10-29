// "Checklist antes de submeter". Texto em markdown (renderizado no build).

export interface ChecklistItem {
  title: string;
  why: string;
  /** Trecho curto em C++ mostrando o erro e/ou a correção. */
  code?: string;
}

export const checklist: ChecklistItem[] = [
  {
    title: '`(int)v.size()` em subtrações e comparações',
    why: '`size()` devolve `size_t` (sem sinal). Com o vetor vazio, `v.size() - 1` vira 18446744073709551615, e o laço roda "para sempre" ou acessa memória inválida. Use `sz(v)` do template.',
    code: `for (int i = 0; i < v.size() - 1; i++)    // vetor vazio: underflow
for (int i = 0; i < sz(v) - 1; i++)       // ok: compara ints`,
  },
  {
    title: '`set` vs `multiset` quando pode haver repetição',
    why: '`set` descarta duplicatas sem avisar. E, num `multiset`, `ms.erase(x)` apaga **todas** as cópias de `x`. Para apagar uma só, apague pelo iterador.',
    code: `ms.erase(x);              // apaga TODAS as cópias
ms.erase(ms.find(x));     // apaga uma (confira que find != end)`,
  },
  {
    title: 'Backtracking: desfazer o estado',
    why: 'Todo `push_back` precisa de um `pop_back` na volta, e todo `seen[v] = true` de um `seen[v] = false`, senão os ramos seguintes enxergam lixo do ramo anterior.',
    code: `path.pb(v); seen[v] = true;
dfs(v);
path.pop_back(); seen[v] = false;   // desfaz na mesma ordem inversa`,
  },
  {
    title: 'Incremento do laço (`i++` vs `i += 2`)',
    why: 'Copiar um laço e trocar só o corpo é a forma mais comum de pular ou repetir elementos. Releia o cabeçalho de todo laço que não seja o `rep` padrão.',
  },
  {
    title: '`<` vs `<=` nas bordas',
    why: 'Pergunte em cada comparação: o caso de igualdade entra ou não? Teste mentalmente com n = 1 e com os dois valores iguais. Em busca binária, escreva o invariante (`lo` sempre válido, `hi` sempre inválido) antes do código.',
  },
  {
    title: 'Containers não inicializados / não limpos entre casos de teste',
    why: 'Com `t` casos de teste, todo vetor/set/map global precisa ser limpo (ou declarado dentro do laço). E variável local sem inicialização (`int ans;`) tem lixo.',
    code: `int t; cin >> t;
while (t--) {
    adj.assign(n + 1, {});   // limpa a cada caso
    ...
}`,
  },
  {
    title: 'Variáveis sombreadas',
    why: 'Um `int n` declarado de novo dentro de uma função ou laço esconde o `n` global, e o global fica 0. Compile com `-Wshadow` para o compilador avisar.',
    code: `int n;                        // global
int main() { int n; cin >> n; ... }   // o global continua 0!`,
  },
  {
    title: '`long long` onde há produto ou soma grande',
    why: '`int` vai até ~2,1·10^9. Somar 2·10^5 valores de até 10^9, ou multiplicar dois valores de 10^5, já estoura. A conta é feita no tipo dos operandos: `a * b` com dois `int` estoura **antes** de virar `long long`.',
    code: `ll x = a * b;          // a, b int: estoura antes da atribuição
ll x = (ll)a * b;      // ok`,
  },
  {
    title: '`"\\n"` em vez de `endl`',
    why: '`endl` força um flush a cada linha e pode transformar AC em TLE com 10^5 linhas de saída. Use `"\\n"`. Exceção: problemas **interativos**, em que você precisa do flush.',
  },
  {
    title: 'Não misturar duas abordagens na mesma função',
    why: 'Se você mudou de ideia no meio (ex.: de greedy para DP), apague a primeira versão. Restos da abordagem antiga, como uma variável que ninguém atualiza mais ou um `break` antigo, são bugs silenciosos.',
  },
];
