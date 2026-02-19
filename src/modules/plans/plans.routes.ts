import { Router } from 'express';
import { plansController } from './plans.controller.js';
import { validateBody } from '../../middlewares/validate.middleware.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { createPlanSchema, updatePlanSchema, addMealSchema, updateMealSchema } from './plans.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', plansController.getPlans.bind(plansController));

router.get('/:id', plansController.getPlanById.bind(plansController));

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

router.get('/stats/doctor', authorize('DOCTOR'), plansController.getDoctorStats.bind(plansController));
router.get('/stats/patient', authorize('PATIENT'), plansController.getPatientStats.bind(plansController));

router.post(
  '/:planId/meals',
  authorize('DOCTOR'),
  validateBody(addMealSchema),
  plansController.addMeal.bind(plansController)
);

router.put(
  '/:planId/meals/:mealId',
  authorize('DOCTOR'),
  validateBody(updateMealSchema),
  plansController.updateMeal.bind(plansController)
);

router.delete(
  '/:planId/meals/:mealId',
  authorize('DOCTOR'),
  plansController.deleteMeal.bind(plansController)
);

export default router;

