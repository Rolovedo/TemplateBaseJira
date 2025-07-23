// Rutas para gestión de desarrolladores en Jira
import { Router } from "express";
import DevelopersController from "./developers.controller.js";
import { authenticateToken } from "../../../common/middlewares/auth.middleware.js";
import { validateRequest } from "../../../common/middlewares/validation.middleware.js";
import { body, param, query } from "express-validator";

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// Validaciones
const createDeveloperValidation = [
    body('userId').isInt().withMessage('ID de usuario debe ser un número'),
    body('role').isIn(['developer', 'supervisor', 'admin']).withMessage('Rol inválido'),
    body('level').isIn(['junior', 'semi-senior', 'senior', 'tech-lead', 'architect']).withMessage('Nivel inválido'),
    body('skills').isArray().optional().withMessage('Habilidades debe ser un array'),
    body('maxCapacity').isInt({ min: 1, max: 80 }).withMessage('Capacidad máxima debe estar entre 1 y 80 horas'),
    body('efficiencyRating').isFloat({ min: 0, max: 1 }).optional().withMessage('Rating de eficiencia debe estar entre 0 y 1'),
    body('phone').isMobilePhone().optional().withMessage('Teléfono inválido')
];

const updateDeveloperValidation = [
    param('id').isInt().withMessage('ID debe ser un número'),
    ...createDeveloperValidation.slice(1) // Excluir userId ya que viene del parámetro
];

// Rutas CRUD
router.get('/', DevelopersController.getDevelopers);
router.get('/statistics', DevelopersController.getTeamStatistics);
router.get('/recommendations', DevelopersController.getRecommendedDevelopers);
router.get('/:id', DevelopersController.getDeveloperById);
router.get('/:id/availability', DevelopersController.checkAvailability);
router.get('/:id/history', DevelopersController.getDeveloperHistory);

router.post('/', createDeveloperValidation, validateRequest, DevelopersController.createDeveloper);
router.put('/:id', updateDeveloperValidation, validateRequest, DevelopersController.updateDeveloper);
router.delete('/:id', DevelopersController.deactivateDeveloper);

export default router;
