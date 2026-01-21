import { z } from 'zod';

const foodSchema = z.object({
  name: z.string().min(1, 'El nombre del alimento es requerido'),
  quantity: z.string().min(1, 'La cantidad es requerida'),
  calories: z.number().optional(),
  notes: z.string().optional(),
});

const mealSchema = z.object({
  type: z.enum(['BREAKFAST', 'MORNING_SNACK', 'LUNCH', 'AFTERNOON_SNACK', 'DINNER', 'EVENING_SNACK']),
  name: z.string().min(1, 'El nombre de la comida es requerido'),
  description: z.string().optional(),
  calories: z.number().optional(),
  protein: z.number().optional(),
  carbs: z.number().optional(),
  fats: z.number().optional(),
  time: z.string().optional(),
  foods: z.array(foodSchema).optional(),
});

const dailyMealSchema = z.object({
  dayNumber: z.number().min(1),
  dayName: z.string().min(1),
  meals: z.array(mealSchema),
});

const recommendationSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  category: z.string().min(1, 'La categoría es requerida'),
});

export const createPlanSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().optional(),
  patientId: z.string().min(1, 'El paciente es requerido'),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  dailyMeals: z.array(dailyMealSchema).optional(),
  recommendations: z.array(recommendationSchema).optional(),
});

export const updatePlanSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  startDate: z.string().transform((str) => new Date(str)).optional(),
  endDate: z.string().transform((str) => new Date(str)).optional(),
  isActive: z.boolean().optional(),
  dailyMeals: z.array(dailyMealSchema).optional(),
  recommendations: z.array(recommendationSchema).optional(),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;

