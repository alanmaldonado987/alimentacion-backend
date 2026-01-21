import prisma from '../../config/prisma.js';
import { hashPassword } from '../../utils/password.js';
import { ConflictError, NotFoundError, ForbiddenError } from '../../utils/errors.js';
import { CreatePatientInput, UpdatePatientInput } from './patients.schema.js';
import type { User } from '@prisma/client';

type PatientWithoutPassword = Omit<User, 'password'>;

export class PatientsService {
  async createPatient(
    doctorId: string,
    data: CreatePatientInput
  ): Promise<PatientWithoutPassword> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('El email ya está registrado');
    }

    const hashedPassword = await hashPassword(data.password);

    const patient = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        phone: data.phone,
        role: 'PATIENT',
        doctors: {
          connect: { id: doctorId },
        },
      },
    });

    const { password: _, ...patientWithoutPassword } = patient;
    return patientWithoutPassword;
  }

  async getMyPatients(doctorId: string): Promise<PatientWithoutPassword[]> {
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
      include: {
        patients: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            avatar: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!doctor) {
      throw new NotFoundError('Doctor no encontrado');
    }

    return doctor.patients;
  }

  async getPatientById(
    doctorId: string,
    patientId: string
  ): Promise<PatientWithoutPassword> {
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
      include: {
        patients: {
          where: { id: patientId },
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            avatar: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!doctor || doctor.patients.length === 0) {
      throw new NotFoundError('Paciente no encontrado');
    }

    return doctor.patients[0];
  }

  async updatePatient(
    doctorId: string,
    patientId: string,
    data: UpdatePatientInput
  ): Promise<PatientWithoutPassword> {
    await this.getPatientById(doctorId, patientId);

    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email,
          id: { not: patientId },
        },
      });

      if (existingUser) {
        throw new ConflictError('El email ya está en uso');
      }
    }

    const updated = await prisma.user.update({
      where: { id: patientId },
      data,
    });

    const { password: _, ...patientWithoutPassword } = updated;
    return patientWithoutPassword;
  }

  async deletePatient(doctorId: string, patientId: string): Promise<void> {
    await this.getPatientById(doctorId, patientId);

    await prisma.user.delete({
      where: { id: patientId },
    });
  }

  async assignPatientToDoctor(
    doctorId: string,
    patientEmail: string
  ): Promise<PatientWithoutPassword> {
    const patient = await prisma.user.findUnique({
      where: { email: patientEmail },
    });

    if (!patient || patient.role !== 'PATIENT') {
      throw new NotFoundError('Paciente no encontrado');
    }

    await prisma.user.update({
      where: { id: doctorId },
      data: {
        patients: {
          connect: { id: patient.id },
        },
      },
    });

    const { password: _, ...patientWithoutPassword } = patient;
    return patientWithoutPassword;
  }

  async getPatientsWithPlansCount(doctorId: string) {
    const patients = await prisma.user.findMany({
      where: {
        role: 'PATIENT',
        doctors: {
          some: { id: doctorId },
        },
      },
      include: {
        _count: {
          select: { patientPlans: true },
        },
      },
    });

    return patients.map(({ password: _, ...patient }) => ({
      ...patient,
      plansCount: patient._count.patientPlans,
    }));
  }
}

export const patientsService = new PatientsService();

