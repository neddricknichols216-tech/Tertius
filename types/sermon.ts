import { z } from 'zod';

export const MovementSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  content: z.string(),
  priority: z.enum(['must', 'normal', 'optional']).default('normal'),
  locked: z.boolean().default(false),
  order: z.number().int().nonnegative().default(0),
});

export type Movement = z.infer<typeof MovementSchema>;

export const MasterSermonSchema = z.object({
  title: z.string().optional(),
  bigIdea: z.string().optional(),
  desiredResponse: z.string().optional(),
  movements: z.array(MovementSchema).default([]),
});

export type MasterSermon = z.infer<typeof MasterSermonSchema>;

export const SermonRecordSchema = z.object({
  id: z.string().optional(),
  user_id: z.string().optional(),
  title: z.string().optional(),
  primary_passage: z.string().optional(),
  series: z.string().optional(),
  sermon_date: z.string().optional(),
  audience: z.string().optional(),
  raw_notes: z.any().optional(),
  master_sermon: MasterSermonSchema.optional(),
  locked: z.boolean().optional(),
});

export type SermonRecord = z.infer<typeof SermonRecordSchema>;
