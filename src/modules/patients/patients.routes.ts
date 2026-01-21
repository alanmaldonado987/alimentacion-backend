import { Router } from 'express';
import { patientsController } from './patients.controller.js';
import { validateBody } from '../../middlewares/validate.middleware.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { createPatientSchema, updatePatientSchema } from './patients.schema.js';

const router = Router();

router.use(authenticate, authorize('DOCTOR'));

router.post('/', validateBody(createPatientSchema), patientsController.createPatient.bind(patientsController));
router.get('/', patientsController.getMyPatients.bind(patientsController));
router.get('/:id', patientsController.getPatientById.bind(patientsController));
router.put('/:id', validateBody(updatePatientSchema), patientsController.updatePatient.bind(patientsController));
router.delete('/:id', patientsController.deletePatient.bind(patientsController));
router.post('/assign', patientsController.assignPatient.bind(patientsController));

export default router;

