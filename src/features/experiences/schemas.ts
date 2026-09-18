import { z } from 'zod';

export const ideaSchema = z.object({
  title: z.string().trim().min(1, 'El título es obligatorio').max(80, 'Máximo 80 caracteres'),
  description: z.string().trim().max(500, 'Máximo 500 caracteres').optional(),
  categoryId: z.string().optional(),
  placeId: z.string().optional(),
  budgetLevel: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
});

export type IdeaFormValues = z.infer<typeof ideaSchema>;

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Usa el formato AAAA-MM-DD');

export const planSchema = z.object({
  placeId: z.string().min(1, 'Elige un lugar'),
  plannedAt: isoDate,
});

export type PlanFormValues = z.infer<typeof planSchema>;

export const completeSchema = z.object({
  placeId: z.string().min(1, 'Elige un lugar'),
  completedAt: isoDate,
});

export type CompleteFormValues = z.infer<typeof completeSchema>;

export const placeSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(80, 'Máximo 80 caracteres'),
  city: z.string().trim().max(80).optional(),
});

export type PlaceFormValues = z.infer<typeof placeSchema>;
