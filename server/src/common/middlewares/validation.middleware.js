// Middleware de validación para las rutas de Tablero
import { validationResult } from "express-validator";
import { logger } from "../utils/logger.js";

/**
 * Middleware para procesar los resultados de validación
 */
export const validateRequest = (req, res, next) => {
    try {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => ({
                field: error.path || error.param,
                message: error.msg,
                value: error.value
            }));

            logger.warn('Errores de validación:', errorMessages);

            return res.status(400).json({
                success: false,
                message: 'Errores de validación',
                errors: errorMessages
            });
        }

        next();
    } catch (error) {
        logger.error('Error en middleware de validación:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para validar IDs numéricos
 */
export const validateId = (req, res, next) => {
    const id = req.params.id;
    
    if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
        return res.status(400).json({
            success: false,
            message: 'ID inválido'
        });
    }

    req.params.id = parseInt(id);
    next();
};

/**
 * Middleware para validar parámetros de paginación
 */
export const validatePagination = (req, res, next) => {
    try {
        const { page = 1, limit = 10, sortBy = 'fecha_creacion', sortOrder = 'DESC' } = req.query;

        // Validar página
        const pageNum = parseInt(page);
        if (isNaN(pageNum) || pageNum < 1) {
            return res.status(400).json({
                success: false,
                message: 'Número de página inválido'
            });
        }

        // Validar límite
        const limitNum = parseInt(limit);
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
            return res.status(400).json({
                success: false,
                message: 'Límite de resultados inválido (1-100)'
            });
        }

        // Validar campo de ordenamiento
        const allowedSortFields = [
            'titulo', 'prioridad', 'estado', 'fecha_creacion', 
            'fecha_actualizacion', 'fecha_vencimiento'
        ];
        
        if (!allowedSortFields.includes(sortBy)) {
            return res.status(400).json({
                success: false,
                message: 'Campo de ordenamiento inválido'
            });
        }

        // Validar orden
        if (!['ASC', 'DESC'].includes(sortOrder.toUpperCase())) {
            return res.status(400).json({
                success: false,
                message: 'Orden de clasificación inválido (ASC/DESC)'
            });
        }

        // Agregar valores validados a la request
        req.pagination = {
            page: pageNum,
            limit: limitNum,
            offset: (pageNum - 1) * limitNum,
            sortBy,
            sortOrder: sortOrder.toUpperCase()
        };

        next();
    } catch (error) {
        logger.error('Error validando paginación:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para validar filtros de tareas
 */
export const validateTaskFilters = (req, res, next) => {
    try {
        const { estado, prioridad, categoria, asignado_a } = req.query;

        // Validar estado
        if (estado) {
            const validStates = ['pendiente', 'por-hacer', 'en-progreso', 'revision', 'completada'];
            if (!validStates.includes(estado)) {
                return res.status(400).json({
                    success: false,
                    message: 'Estado de tarea inválido'
                });
            }
        }

        // Validar prioridad
        if (prioridad) {
            const validPriorities = ['baja', 'media', 'alta', 'muy-alta'];
            if (!validPriorities.includes(prioridad)) {
                return res.status(400).json({
                    success: false,
                    message: 'Prioridad de tarea inválida'
                });
            }
        }

        // Validar categoría
        if (categoria) {
            const validCategories = ['frontend', 'backend', 'base-datos', 'devops', 'testing', 'documentacion'];
            if (!validCategories.includes(categoria)) {
                return res.status(400).json({
                    success: false,
                    message: 'Categoría de tarea inválida'
                });
            }
        }

        // Validar asignado_a
        if (asignado_a && (isNaN(parseInt(asignado_a)) || parseInt(asignado_a) <= 0)) {
            return res.status(400).json({
                success: false,
                message: 'ID de usuario asignado inválido'
            });
        }

        next();
    } catch (error) {
        logger.error('Error validando filtros:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para sanitizar datos de entrada
 */
export const sanitizeInput = (req, res, next) => {
    try {
        // Función para limpiar strings
        const sanitizeString = (str) => {
            if (typeof str !== 'string') return str;
            return str.trim().replace(/[<>]/g, '');
        };

        // Sanitizar body
        if (req.body && typeof req.body === 'object') {
            for (const [key, value] of Object.entries(req.body)) {
                if (typeof value === 'string') {
                    req.body[key] = sanitizeString(value);
                }
            }
        }

        // Sanitizar query params
        if (req.query && typeof req.query === 'object') {
            for (const [key, value] of Object.entries(req.query)) {
                if (typeof value === 'string') {
                    req.query[key] = sanitizeString(value);
                }
            }
        }

        next();
    } catch (error) {
        logger.error('Error sanitizando entrada:', error);
        next();
    }
};
