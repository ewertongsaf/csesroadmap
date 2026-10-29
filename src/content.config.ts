import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// content/modules/<slug>.mdx. O slug precisa existir em data/modules.ts (status: 'written').
const modules = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './content/modules' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

export const collections = { modules };
