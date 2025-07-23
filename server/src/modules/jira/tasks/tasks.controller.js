import { validationResult } from "express-validator";
import * as tasksService from "./tasks.service.js";
import whatsappService from "../notifications/whatsapp.service.js";
import { logger } from "../../../common/utils/logger.js";

// Obtener todas las tareas
export const getTasks = async (req, res) => {
    try {
        const { status, priority, category, assigneeId, page = 1, limit = 50 } = req.query;
        
        const filters = {
            status,
            priority,
            category,
            assigneeId,
            page: parseInt(page),
            limit: parseInt(limit)
        };

        const result = await tasksService.getTasks(filters);
        
        res.json({
            success: true,
            data: result.tasks,
            pagination: {
                total: result.total,
                page: filters.page,
                limit: filters.limit,
                totalPages: Math.ceil(result.total / filters.limit)
            }
        });
    } catch (error) {
        logger.error("Error getting tasks:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener las tareas",
            error: error.message
        });
    }
};

// Obtener una tarea por ID
export const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await tasksService.getTaskById(id);
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Tarea no encontrada"
            });
        }

        res.json({
            success: true,
            data: task
        });
    } catch (error) {
        logger.error("Error getting task by ID:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener la tarea",
            error: error.message
        });
    }
};

// Crear una nueva tarea
export const createTask = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Datos inválidos",
                errors: errors.array()
            });
        }

        const taskData = {
            ...req.body,
            createdBy: req.user.id,
            createdAt: new Date()
        };

        const newTask = await tasksService.createTask(taskData);
        
        // Si la tarea tiene alta prioridad y está asignada, enviar notificación
        if (newTask.priority === 'very-high' || newTask.priority === 'high') {
            if (newTask.assigneeId) {
                await sendTaskAssignmentNotification(newTask);
            }
        }

        res.status(201).json({
            success: true,
            message: "Tarea creada exitosamente",
            data: newTask
        });
    } catch (error) {
        logger.error("Error creating task:", error);
        res.status(500).json({
            success: false,
            message: "Error al crear la tarea",
            error: error.message
        });
    }
};

// Actualizar una tarea
export const updateTask = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Datos inválidos",
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const taskData = {
            ...req.body,
            updatedBy: req.user.id,
            updatedAt: new Date()
        };

        const updatedTask = await tasksService.updateTask(id, taskData);
        
        if (!updatedTask) {
            return res.status(404).json({
                success: false,
                message: "Tarea no encontrada"
            });
        }

        res.json({
            success: true,
            message: "Tarea actualizada exitosamente",
            data: updatedTask
        });
    } catch (error) {
        logger.error("Error updating task:", error);
        res.status(500).json({
            success: false,
            message: "Error al actualizar la tarea",
            error: error.message
        });
    }
};

// Eliminar una tarea
export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await tasksService.deleteTask(id);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Tarea no encontrada"
            });
        }

        res.json({
            success: true,
            message: "Tarea eliminada exitosamente"
        });
    } catch (error) {
        logger.error("Error deleting task:", error);
        res.status(500).json({
            success: false,
            message: "Error al eliminar la tarea",
            error: error.message
        });
    }
};

// Actualizar estado de una tarea
export const updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, requestChangeReason } = req.body;
        const userId = req.user.id;

        // Verificar si el usuario puede cambiar el estado
        const canChange = await tasksService.canUserChangeTaskStatus(id, userId, status);
        
        if (!canChange.allowed) {
            // Si es un desarrollador tratando de cambiar desde "inProgress", solicitar aprobación
            if (canChange.requiresApproval) {
                const changeRequest = await tasksService.createTaskChangeRequest({
                    taskId: id,
                    userId,
                    fromStatus: canChange.currentStatus,
                    toStatus: status,
                    reason: requestChangeReason || "Cambio de estado solicitado",
                    requestedAt: new Date()
                });

                // Enviar notificación de WhatsApp al jefe
                await sendTaskChangeNotification(changeRequest);

                return res.json({
                    success: true,
                    message: "Solicitud de cambio enviada. Esperando aprobación del jefe de programadores.",
                    data: { requiresApproval: true, requestId: changeRequest.id }
                });
            }

            return res.status(403).json({
                success: false,
                message: canChange.message
            });
        }

        const updatedTask = await tasksService.updateTaskStatus(id, status, userId);
        
        res.json({
            success: true,
            message: "Estado de tarea actualizado exitosamente",
            data: updatedTask
        });
    } catch (error) {
        logger.error("Error updating task status:", error);
        res.status(500).json({
            success: false,
            message: "Error al actualizar el estado de la tarea",
            error: error.message
        });
    }
};

// Asignar tarea a un desarrollador
export const assignTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { assigneeId, collaborators, priority, dueDate, estimatedHours, notes } = req.body;

        const assignmentData = {
            assigneeId,
            collaborators: collaborators || [],
            priority,
            dueDate,
            estimatedHours,
            notes,
            assignedBy: req.user.id,
            assignedAt: new Date()
        };

        const result = await tasksService.assignTask(id, assignmentData);
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.message
            });
        }

        // Enviar notificación al desarrollador asignado
        await sendTaskAssignmentNotification(result.task);

        res.json({
            success: true,
            message: "Tarea asignada exitosamente",
            data: result.task
        });
    } catch (error) {
        logger.error("Error assigning task:", error);
        res.status(500).json({
            success: false,
            message: "Error al asignar la tarea",
            error: error.message
        });
    }
};

// Agregar colaborador a una tarea
export const addCollaborator = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        const result = await tasksService.addCollaborator(id, userId);
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.message
            });
        }

        res.json({
            success: true,
            message: "Colaborador agregado exitosamente",
            data: result.task
        });
    } catch (error) {
        logger.error("Error adding collaborator:", error);
        res.status(500).json({
            success: false,
            message: "Error al agregar colaborador",
            error: error.message
        });
    }
};

// Remover colaborador de una tarea
export const removeCollaborator = async (req, res) => {
    try {
        const { id, userId } = req.params;

        const result = await tasksService.removeCollaborator(id, userId);
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.message
            });
        }

        res.json({
            success: true,
            message: "Colaborador removido exitosamente",
            data: result.task
        });
    } catch (error) {
        logger.error("Error removing collaborator:", error);
        res.status(500).json({
            success: false,
            message: "Error al remover colaborador",
            error: error.message
        });
    }
};

// Obtener tareas por desarrollador
export const getTasksByDeveloper = async (req, res) => {
    try {
        const { developerId } = req.params;
        const { includeCollaborations = false } = req.query;

        const tasks = await tasksService.getTasksByDeveloper(developerId, includeCollaborations);
        
        res.json({
            success: true,
            data: tasks
        });
    } catch (error) {
        logger.error("Error getting tasks by developer:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener las tareas del desarrollador",
            error: error.message
        });
    }
};

// Obtener tareas por estado
export const getTasksByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const tasks = await tasksService.getTasksByStatus(status);
        
        res.json({
            success: true,
            data: tasks
        });
    } catch (error) {
        logger.error("Error getting tasks by status:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener las tareas por estado",
            error: error.message
        });
    }
};

// Solicitar cambio de tarea
export const requestTaskChange = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const userId = req.user.id;

        const changeRequest = await tasksService.createTaskChangeRequest({
            taskId: id,
            userId,
            reason,
            requestedAt: new Date()
        });

        // Enviar notificación de WhatsApp
        await sendTaskChangeNotification(changeRequest);

        res.json({
            success: true,
            message: "Solicitud de cambio enviada exitosamente",
            data: changeRequest
        });
    } catch (error) {
        logger.error("Error requesting task change:", error);
        res.status(500).json({
            success: false,
            message: "Error al solicitar cambio de tarea",
            error: error.message
        });
    }
};

// Funciones auxiliares para notificaciones
const sendTaskAssignmentNotification = async (task) => {
    try {
        const message = `🔔 NUEVA TAREA ASIGNADA\n\n` +
            `Título: ${task.title}\n` +
            `Prioridad: ${task.priority}\n` +
            `Fecha límite: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No definida'}\n` +
            `Horas estimadas: ${task.estimatedHours}h\n\n` +
            `Revisa los detalles en el tablero Jira.`;

        await whatsappService.sendNotification({
            phone: task.assignee.phone,
            message,
            taskId: task.id,
            type: 'task_assignment'
        });
    } catch (error) {
        logger.error("Error sending assignment notification:", error);
    }
};

const sendTaskChangeNotification = async (changeRequest) => {
    try {
        const message = `🔄 SOLICITUD DE CAMBIO DE TAREA\n\n` +
            `Desarrollador: ${changeRequest.user.name}\n` +
            `Tarea: ${changeRequest.task.title}\n` +
            `Razón: ${changeRequest.reason}\n\n` +
            `¿Aprobar el cambio?\n` +
            `Responde: APROBAR o RECHAZAR`;

        // Enviar al jefe de programadores
        const supervisorPhone = process.env.SUPERVISOR_PHONE || "+57300123456";
        
        await whatsappService.sendNotification({
            phone: supervisorPhone,
            message,
            taskId: changeRequest.taskId,
            changeRequestId: changeRequest.id,
            type: 'task_change_request'
        });
    } catch (error) {
        logger.error("Error sending change notification:", error);
    }
};
