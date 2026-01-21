import { Request, Response, NextFunction } from 'express';
import { patientsService } from './patients.service.js';
import { sendSuccess } from '../../utils/response.js';

export class PatientsController {
  async createPatient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctorId = req.user!.userId;
      const patient = await patientsService.createPatient(doctorId, req.body);
      sendSuccess(res, patient, 'Paciente creado exitosamente', 201);
    } catch (error) {
      next(error);
    }
  }

  async getMyPatients(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctorId = req.user!.userId;
      const patients = await patientsService.getPatientsWithPlansCount(doctorId);
      sendSuccess(res, patients);
    } catch (error) {
      next(error);
    }
  }

  async getPatientById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctorId = req.user!.userId;
      const { id } = req.params;
      const patient = await patientsService.getPatientById(doctorId, id);
      sendSuccess(res, patient);
    } catch (error) {
      next(error);
    }
  }

  async updatePatient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctorId = req.user!.userId;
      const { id } = req.params;
      const patient = await patientsService.updatePatient(doctorId, id, req.body);
      sendSuccess(res, patient, 'Paciente actualizado exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async deletePatient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctorId = req.user!.userId;
      const { id } = req.params;
      await patientsService.deletePatient(doctorId, id);
      sendSuccess(res, null, 'Paciente eliminado exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async assignPatient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctorId = req.user!.userId;
      const { email } = req.body;
      const patient = await patientsService.assignPatientToDoctor(doctorId, email);
      sendSuccess(res, patient, 'Paciente asignado exitosamente');
    } catch (error) {
      next(error);
    }
  }
}

export const patientsController = new PatientsController();

