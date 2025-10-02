import { Router } from 'express';
import { OnboardingController } from '../controllers/onboardingController';
import { validateOnboarding, validateEmployeeNumber, validateSearchParams } from '../validators/onboarding';
import { validationResult } from 'express-validator';

const router = Router();
const onboardingController = new OnboardingController();

// Middleware para manejar errores de validación
const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Rutas de onboarding
router.post('/onboardings', 
  validateOnboarding, 
  handleValidationErrors, 
  onboardingController.createOnboarding
);

router.get('/onboardings', 
  validateSearchParams, 
  handleValidationErrors, 
  onboardingController.searchOnboardings
);

router.get('/onboardings/export', 
  validateSearchParams, 
  handleValidationErrors, 
  onboardingController.exportOnboardings
);

router.get('/onboardings/:employeeNumber', 
  validateEmployeeNumber, 
  handleValidationErrors, 
  onboardingController.getOnboarding
);

router.put('/onboardings/:employeeNumber', 
  validateEmployeeNumber,
  validateOnboarding, 
  handleValidationErrors, 
  onboardingController.updateOnboarding
);

router.delete('/onboardings/:employeeNumber', 
  validateEmployeeNumber, 
  handleValidationErrors, 
  onboardingController.deleteOnboarding
);

// Ruta para obtener el catálogo de software
router.get('/software-catalog', onboardingController.getSoftwareCatalog);

export default router;


