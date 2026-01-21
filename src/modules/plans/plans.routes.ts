import { Router } from 'express';
import { plansController } from './plans.controller.js';
import { validateBody } from '../../middlewares/validate.middleware.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { createPlanSchema, updatePlanSchema } from './plans.schema.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get plans (both doctor and patient can access)
router.get('/', plansController.getPlans.bind(plansController));

// Get specific plan
router.get('/:id', plansController.getPlanById.bind(plansController));

// Doctor-only routes
router.post(
  '/',
  authorize('DOCTOR'),
  validateBody(createPlanSchema),
  plansController.createPlan.bind(plansController)
);

router.put(
  '/:id',
  authorize('DOCTOR'),
  validateBody(updatePlanSchema),
  plansController.updatePlan.bind(plansController)
);

router.delete(
  '/:id',
  authorize('DOCTOR'),
  plansController.deletePlan.bind(plansController)
);

// Stats endpoints
router.get('/stats/doctor', authorize('DOCTOR'), plansController.getDoctorStats.bind(plansController));
router.get('/stats/patient', authorize('PATIENT'), plansController.getPatientStats.bind(plansController));

export default router;

