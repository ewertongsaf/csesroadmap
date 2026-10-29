// Formato de data/hints/<milestone>.yaml, compartilhado entre o site e o validador.
//
// problems:
//   1068:
//     hints:            # 1 a 3, da observação à ideia do algoritmo. Nunca código da solução.
//       - "..."
//     pitfalls:         # armadilhas específicas deste problema (opcional)
//       - "..."
import { z } from 'zod';
import { parse } from 'yaml';

export const problemHintsSchema = z.object({
  hints: z.array(z.string().min(1)).min(1).max(3),
  pitfalls: z.array(z.string().min(1)).default([]),
});

export const hintFileSchema = z.object({
  problems: z.record(z.string().regex(/^\d+$/), problemHintsSchema),
});

export type ProblemHints = z.infer<typeof problemHintsSchema>;

/** Lê o YAML de um milestone e devolve id -> dicas. Lança erro com o nome do arquivo se o formato estiver errado. */
export function parseHintFile(text: string, fileName: string): Map<number, ProblemHints> {
  const result = hintFileSchema.safeParse(parse(text) ?? { problems: {} });
  if (!result.success) throw new Error(`${fileName}: ${z.prettifyError(result.error)}`);
  return new Map(Object.entries(result.data.problems).map(([id, h]) => [Number(id), h]));
}
