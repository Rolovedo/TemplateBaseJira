// Controlador para gestión de desarrolladores
import DevelopersService from './developers.service.js';
import { logger } from '../../../common/utils/logger.js';

class DevelopersController {

    /**
     * Obtener lista de desarrolladores
     */
    async getDevelopers(req, res) {
        try {
            const { role, level, maxWorkload } = req.query;
            
            const filters = {};
            if (role) filters.role = role;
            if (level) filters.level = level;
            if (maxWorkload) filters.maxWorkload = parseInt(maxWorkload);

            const developers = await DevelopersService.getDevelopers(filters);

            res.json({
                success: true,
                data: developers,
                total: developers.length
            });

        } catch (error) {
            logger.error('Error obteniendo desarrolladores:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener desarrollador por ID
     */
    async getDeveloperById(req, res) {
        try {
            const { id } = req.params;
            const developer = await DevelopersService.getDeveloperById(parseInt(id));

            if (!developer) {
                return res.status(404).json({
                    success: false,
                    message: 'Desarrollador no encontrado'
                });
            }

            res.json({
                success: true,
                data: developer
            });

        } catch (error) {
            logger.error('Error obteniendo desarrollador:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Crear nuevo desarrollador
     */
    async createDeveloper(req, res) {
        try {
            const { userId, ...developerData } = req.body;
            
            const developer = await DevelopersService.upsertDeveloper(userId, developerData);

            res.status(201).json({
                success: true,
                message: 'Desarrollador creado exitosamente',
                data: developer
            });

        } catch (error) {
            logger.error('Error creando desarrollador:', error);
            
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    success: false,
                    message: 'El usuario ya tiene un perfil de desarrollador'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Actualizar desarrollador
     */
    async updateDeveloper(req, res) {
        try {
            const { id } = req.params;
            const developerData = req.body;
            
            const developer = await DevelopersService.upsertDeveloper(parseInt(id), developerData);

            if (!developer) {
                return res.status(404).json({
                    success: false,
                    message: 'Desarrollador no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Desarrollador actualizado exitosamente',
                data: developer
            });

        } catch (error) {
            logger.error('Error actualizando desarrollador:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Desactivar desarrollador
     */
    async deactivateDeveloper(req, res) {
        try {
            const { id } = req.params;
            
            const result = await DevelopersService.deactivateDeveloper(parseInt(id));

            res.json({
                success: true,
                message: 'Desarrollador desactivado exitosamente',
                data: result
            });

        } catch (error) {
            logger.error('Error desactivando desarrollador:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener estadísticas del equipo
     */
    async getTeamStatistics(req, res) {
        try {
            const statistics = await DevelopersService.getTeamStatistics();

            res.json({
                success: true,
                data: statistics
            });

        } catch (error) {
            logger.error('Error obteniendo estadísticas del equipo:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener desarrolladores recomendados para una tarea
     */
    async getRecommendedDevelopers(req, res) {
        try {
            const { requiredSkills, estimatedHours, priority } = req.query;
            
            const taskData = {
                requiredSkills: requiredSkills ? JSON.parse(requiredSkills) : [],
                estimatedHours: estimatedHours ? parseInt(estimatedHours) : 0,
                priority: priority || 'medium'
            };

            const recommendations = await DevelopersService.getRecommendedDevelopers(taskData);

            res.json({
                success: true,
                data: recommendations
            });

        } catch (error) {
            logger.error('Error obteniendo recomendaciones:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Verificar disponibilidad de desarrollador
     */
    async checkAvailability(req, res) {
        try {
            const { id } = req.params;
            const { additionalHours = 0 } = req.query;
            
            const availability = await DevelopersService.checkAvailability(
                parseInt(id), 
                parseInt(additionalHours)
            );

            res.json({
                success: true,
                data: availability
            });

        } catch (error) {
            logger.error('Error verificando disponibilidad:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener historial de tareas de un desarrollador
     */
    async getDeveloperHistory(req, res) {
        try {
            const { id } = req.params;
            const { limit = 20 } = req.query;
            
            const history = await DevelopersService.getDeveloperTaskHistory(
                parseInt(id), 
                parseInt(limit)
            );

            res.json({
                success: true,
                data: history
            });

        } catch (error) {
            logger.error('Error obteniendo historial del desarrollador:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

export default new DevelopersController();
