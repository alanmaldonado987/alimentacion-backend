import prisma from '../../config/prisma.js';
import { NotFoundError, ForbiddenError } from '../../utils/errors.js';
import { CreatePlanInput, UpdatePlanInput } from './plans.schema.js';
import type { MealPlan, DailyMeal, Meal, Food, Recommendation } from '@prisma/client';

type FullMealPlan = MealPlan & {
  dailyMeals: (DailyMeal & {
    meals: (Meal & { foods: Food[] })[];
  })[];
  recommendations: Recommendation[];
  patient: { id: string; name: string; email: string };
  doctor: { id: string; name: string; email: string };
};

export class PlansService {
  async createPlan(doctorId: string, data: CreatePlanInput): Promise<FullMealPlan> {
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
      include: {
        patients: {
          where: { id: data.patientId },
        },
      },
    });

    if (!doctor || doctor.patients.length === 0) {
      throw new NotFoundError('Paciente no encontrado o no asignado a este doctor');
    }

    const plan = await prisma.mealPlan.create({
      data: {
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        doctorId,
        patientId: data.patientId,
        dailyMeals: data.dailyMeals
          ? {
              create: data.dailyMeals.map((dm) => ({
                dayNumber: dm.dayNumber,
                dayName: dm.dayName,
                meals: {
                  create: dm.meals.map((meal) => ({
                    type: meal.type,
                    name: meal.name,
                    description: meal.description,
                    calories: meal.calories,
                    protein: meal.protein,
                    carbs: meal.carbs,
                    fats: meal.fats,
                    time: meal.time,
                    foods: meal.foods
                      ? {
                          create: meal.foods.map((food) => ({
                            name: food.name,
                            quantity: food.quantity,
                            calories: food.calories,
                            notes: food.notes,
                          })),
                        }
                      : undefined,
                  })),
                },
              })),
            }
          : undefined,
        recommendations: data.recommendations
          ? {
              create: data.recommendations.map((rec) => ({
                title: rec.title,
                description: rec.description,
                priority: rec.priority || 'MEDIUM',
                category: rec.category,
              })),
            }
          : undefined,
      },
      include: {
        dailyMeals: {
          include: {
            meals: {
              include: { foods: true },
            },
          },
          orderBy: { dayNumber: 'asc' },
        },
        recommendations: true,
        patient: {
          select: { id: true, name: true, email: true },
        },
        doctor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return plan;
  }

  async getPlansByDoctor(doctorId: string): Promise<FullMealPlan[]> {
    return prisma.mealPlan.findMany({
      where: { doctorId },
      include: {
        dailyMeals: {
          include: {
            meals: {
              include: { foods: true },
            },
          },
          orderBy: { dayNumber: 'asc' },
        },
        recommendations: true,
        patient: {
          select: { id: true, name: true, email: true },
        },
        doctor: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPlansByPatient(patientId: string): Promise<FullMealPlan[]> {
    return prisma.mealPlan.findMany({
      where: { patientId },
      include: {
        dailyMeals: {
          include: {
            meals: {
              include: { foods: true },
            },
          },
          orderBy: { dayNumber: 'asc' },
        },
        recommendations: true,
        patient: {
          select: { id: true, name: true, email: true },
        },
        doctor: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPlanById(planId: string, userId: string, userRole: string): Promise<FullMealPlan> {
    const plan = await prisma.mealPlan.findUnique({
      where: { id: planId },
      include: {
        dailyMeals: {
          include: {
            meals: {
              include: { foods: true },
              orderBy: { type: 'asc' },
            },
          },
          orderBy: { dayNumber: 'asc' },
        },
        recommendations: true,
        patient: {
          select: { id: true, name: true, email: true },
        },
        doctor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!plan) {
      throw new NotFoundError('Plan no encontrado');
    }

    if (userRole === 'DOCTOR' && plan.doctorId !== userId) {
      throw new ForbiddenError('No tienes acceso a este plan');
    }

    if (userRole === 'PATIENT' && plan.patientId !== userId) {
      throw new ForbiddenError('No tienes acceso a este plan');
    }

    return plan;
  }

  async updatePlan(
    planId: string,
    doctorId: string,
    data: UpdatePlanInput
  ): Promise<FullMealPlan> {
    const plan = await prisma.mealPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundError('Plan no encontrado');
    }

    if (plan.doctorId !== doctorId) {
      throw new ForbiddenError('No tienes permisos para editar este plan');
    }

    if (data.dailyMeals) {
      await prisma.dailyMeal.deleteMany({
        where: { mealPlanId: planId },
      });
    }

    if (data.recommendations) {
      await prisma.recommendation.deleteMany({
        where: { mealPlanId: planId },
      });
    }

    const updated = await prisma.mealPlan.update({
      where: { id: planId },
      data: {
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive,
        dailyMeals: data.dailyMeals
          ? {
              create: data.dailyMeals.map((dm) => ({
                dayNumber: dm.dayNumber,
                dayName: dm.dayName,
                meals: {
                  create: dm.meals.map((meal) => ({
                    type: meal.type,
                    name: meal.name,
                    description: meal.description,
                    calories: meal.calories,
                    protein: meal.protein,
                    carbs: meal.carbs,
                    fats: meal.fats,
                    time: meal.time,
                    foods: meal.foods
                      ? {
                          create: meal.foods.map((food) => ({
                            name: food.name,
                            quantity: food.quantity,
                            calories: food.calories,
                            notes: food.notes,
                          })),
                        }
                      : undefined,
                  })),
                },
              })),
            }
          : undefined,
        recommendations: data.recommendations
          ? {
              create: data.recommendations.map((rec) => ({
                title: rec.title,
                description: rec.description,
                priority: rec.priority || 'MEDIUM',
                category: rec.category,
              })),
            }
          : undefined,
      },
      include: {
        dailyMeals: {
          include: {
            meals: {
              include: { foods: true },
            },
          },
          orderBy: { dayNumber: 'asc' },
        },
        recommendations: true,
        patient: {
          select: { id: true, name: true, email: true },
        },
        doctor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return updated;
  }

  async deletePlan(planId: string, doctorId: string): Promise<void> {
    const plan = await prisma.mealPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundError('Plan no encontrado');
    }

    if (plan.doctorId !== doctorId) {
      throw new ForbiddenError('No tienes permisos para eliminar este plan');
    }

    await prisma.mealPlan.delete({
      where: { id: planId },
    });
  }

  async getDoctorStats(doctorId: string) {
    const [patientsCount, plansCount, activePlansCount] = await Promise.all([
      prisma.user.count({
        where: {
          role: 'PATIENT',
          doctors: { some: { id: doctorId } },
        },
      }),
      prisma.mealPlan.count({
        where: { doctorId },
      }),
      prisma.mealPlan.count({
        where: { doctorId, isActive: true },
      }),
    ]);

    return {
      patientsCount,
      plansCount,
      activePlansCount,
    };
  }

  async getPatientStats(patientId: string) {
    const [plansCount, activePlansCount] = await Promise.all([
      prisma.mealPlan.count({
        where: { patientId },
      }),
      prisma.mealPlan.count({
        where: { patientId, isActive: true },
      }),
    ]);

    const currentPlan = await prisma.mealPlan.findFirst({
      where: {
        patientId,
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
      include: {
        doctor: {
          select: { id: true, name: true },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    return {
      plansCount,
      activePlansCount,
      currentPlan,
    };
  }
}

export const plansService = new PlansService();

