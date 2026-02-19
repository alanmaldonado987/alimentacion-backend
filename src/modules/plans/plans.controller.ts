import { Request, Response, NextFunction } from 'express';
import { plansService } from './plans.service.js';
import { sendSuccess } from '../../utils/response.js';

export class PlansController {
  async createPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctorId = req.user!.userId;
      const plan = await plansService.createPlan(doctorId, req.body);
      sendSuccess(res, plan, 'Plan creado exitosamente', 201);
    } catch (error) {
      next(error);
    }
  }

  async getPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, role } = req.user!;
      
      const plans = role === 'DOCTOR'
        ? await plansService.getPlansByDoctor(userId)
        : await plansService.getPlansByPatient(userId);
      
      sendSuccess(res, plans);
    } catch (error) {
      next(error);
    }
  }

  async getPlanById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, role } = req.user!;
      const { id } = req.params;
      const plan = await plansService.getPlanById(id, userId, role);
      sendSuccess(res, plan);
    } catch (error) {
      next(error);
    }
  }

  async updatePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctorId = req.user!.userId;
      const { id } = req.params;
      const plan = await plansService.updatePlan(id, doctorId, req.body);
      sendSuccess(res, plan, 'Plan actualizado exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async deletePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctorId = req.user!.userId;
      const { id } = req.params;
      await plansService.deletePlan(id, doctorId);
      sendSuccess(res, null, 'Plan eliminado exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async getDoctorStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctorId = req.user!.userId;
      const stats = await plansService.getDoctorStats(doctorId);
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }

  async getPatientStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const patientId = req.user!.userId;
      const stats = await plansService.getPatientStats(patientId);
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }

  async addMeal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctorId = req.user!.userId;
      const { planId } = req.params;
      const plan = await plansService.addMeal(planId, doctorId, req.body);
      sendSuccess(res, plan, 'Comida agregada exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async updateMeal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctorId = req.user!.userId;
      const { planId, mealId } = req.params;
      const plan = await plansService.updateMeal(planId, mealId, doctorId, req.body);
      sendSuccess(res, plan, 'Comida actualizada exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async deleteMeal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctorId = req.user!.userId;
      const { planId, mealId } = req.params;
      const plan = await plansService.deleteMeal(planId, mealId, doctorId);
      sendSuccess(res, plan, 'Comida eliminada exitosamente');
    } catch (error) {
      next(error);
    }
  }
}

export const plansController = new PlansController();

