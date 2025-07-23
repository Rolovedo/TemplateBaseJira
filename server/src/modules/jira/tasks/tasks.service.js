import { getConnection } from "../../../common/configs/db.config.js";
import logger from "../../../common/configs/winston.config.js";

// Obtener todas las tareas con filtros
export const getTasks = async (filters = {}) => {
    let connection;
    try {
        connection = await getConnection();
        
        let query = `
            SELECT 
                t.*,
                u_assignee.name as assignee_name,
                u_assignee.email as assignee_email,
                u_assignee.phone as assignee_phone,
                u_created.name as created_by_name,
                u_updated.name as updated_by_name,
                GROUP_CONCAT(
                    DISTINCT CONCAT(tc.user_id, ':', u_collab.name, ':', u_collab.email)
                ) as collaborators
            FROM jira_tasks t
            LEFT JOIN users u_assignee ON t.assignee_id = u_assignee.id
            LEFT JOIN users u_created ON t.created_by = u_created.id
            LEFT JOIN users u_updated ON t.updated_by = u_updated.id
            LEFT JOIN jira_task_collaborators tc ON t.id = tc.task_id
            LEFT JOIN users u_collab ON tc.user_id = u_collab.id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (filters.status) {
            query += ` AND t.status = ?`;
            params.push(filters.status);
        }
        
        if (filters.priority) {
            query += ` AND t.priority = ?`;
            params.push(filters.priority);
        }
        
        if (filters.category) {
            query += ` AND t.category = ?`;
            params.push(filters.category);
        }
        
        if (filters.assigneeId) {
            query += ` AND t.assignee_id = ?`;
            params.push(filters.assigneeId);
        }
        
        query += ` GROUP BY t.id ORDER BY t.created_at DESC`;
        
        if (filters.limit) {
            const offset = (filters.page - 1) * filters.limit;
            query += ` LIMIT ? OFFSET ?`;
            params.push(filters.limit, offset);
        }
        
        const [tasks] = await connection.execute(query, params);
        
        // Obtener el total para paginación
        let countQuery = `
            SELECT COUNT(DISTINCT t.id) as total
            FROM jira_tasks t
            WHERE 1=1
        `;
        const countParams = params.slice(0, -2); // Remover LIMIT y OFFSET
        
        if (filters.status) countQuery += ` AND t.status = ?`;
        if (filters.priority) countQuery += ` AND t.priority = ?`;
        if (filters.category) countQuery += ` AND t.category = ?`;
        if (filters.assigneeId) countQuery += ` AND t.assignee_id = ?`;
        
        const [countResult] = await connection.execute(countQuery, countParams);
        const total = countResult[0].total;
        
        // Formatear las tareas
        const formattedTasks = tasks.map(task => formatTask(task));
        
        return { tasks: formattedTasks, total };
    } catch (error) {
        logger.error("Error in getTasks service:", error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

// Obtener una tarea por ID
export const getTaskById = async (id) => {
    let connection;
    try {
        connection = await getConnection();
        
        const query = `
            SELECT 
                t.*,
                u_assignee.name as assignee_name,
                u_assignee.email as assignee_email,
                u_assignee.phone as assignee_phone,
                u_created.name as created_by_name,
                u_updated.name as updated_by_name,
                GROUP_CONCAT(
                    DISTINCT CONCAT(tc.user_id, ':', u_collab.name, ':', u_collab.email)
                ) as collaborators
            FROM jira_tasks t
            LEFT JOIN users u_assignee ON t.assignee_id = u_assignee.id
            LEFT JOIN users u_created ON t.created_by = u_created.id
            LEFT JOIN users u_updated ON t.updated_by = u_updated.id
            LEFT JOIN jira_task_collaborators tc ON t.id = tc.task_id
            LEFT JOIN users u_collab ON tc.user_id = u_collab.id
            WHERE t.id = ?
            GROUP BY t.id
        `;
        
        const [rows] = await connection.execute(query, [id]);
        
        if (rows.length === 0) {
            return null;
        }
        
        return formatTask(rows[0]);
    } catch (error) {
        logger.error("Error in getTaskById service:", error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

// Crear una nueva tarea
export const createTask = async (taskData) => {
    let connection;
    try {
        connection = await getConnection();
        await connection.beginTransaction();
        
        const {
            title,
            description,
            assigneeId,
            priority,
            status = 'backlog',
            category,
            dueDate,
            estimatedHours,
            requiredSkills,
            createdBy,
            createdAt
        } = taskData;
        
        const query = `
            INSERT INTO jira_tasks (
                title, description, assignee_id, priority, status, category,
                due_date, estimated_hours, required_skills, created_by, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await connection.execute(query, [
            title,
            description,
            assigneeId,
            priority,
            status,
            category,
            dueDate,
            estimatedHours,
            JSON.stringify(requiredSkills || []),
            createdBy,
            createdAt
        ]);
        
        const taskId = result.insertId;
        
        // Agregar colaboradores si los hay
        if (taskData.collaborators && taskData.collaborators.length > 0) {
            for (const collaboratorId of taskData.collaborators) {
                await connection.execute(
                    `INSERT INTO jira_task_collaborators (task_id, user_id) VALUES (?, ?)`,
                    [taskId, collaboratorId]
                );
            }
        }
        
        await connection.commit();
        
        // Obtener la tarea completa
        const newTask = await getTaskById(taskId);
        return newTask;
    } catch (error) {
        if (connection) await connection.rollback();
        logger.error("Error in createTask service:", error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

// Actualizar una tarea
export const updateTask = async (id, taskData) => {
    let connection;
    try {
        connection = await getConnection();
        await connection.beginTransaction();
        
        const {
            title,
            description,
            assigneeId,
            priority,
            status,
            category,
            dueDate,
            estimatedHours,
            actualHours,
            progress,
            requiredSkills,
            updatedBy,
            updatedAt
        } = taskData;
        
        const query = `
            UPDATE jira_tasks SET
                title = ?, description = ?, assignee_id = ?, priority = ?, status = ?,
                category = ?, due_date = ?, estimated_hours = ?, actual_hours = ?,
                progress = ?, required_skills = ?, updated_by = ?, updated_at = ?
            WHERE id = ?
        `;
        
        const [result] = await connection.execute(query, [
            title,
            description,
            assigneeId,
            priority,
            status,
            category,
            dueDate,
            estimatedHours,
            actualHours,
            progress,
            JSON.stringify(requiredSkills || []),
            updatedBy,
            updatedAt,
            id
        ]);
        
        if (result.affectedRows === 0) {
            await connection.rollback();
            return null;
        }
        
        // Actualizar colaboradores si se proporcionan
        if (taskData.collaborators !== undefined) {
            // Eliminar colaboradores existentes
            await connection.execute(`DELETE FROM jira_task_collaborators WHERE task_id = ?`, [id]);
            
            // Agregar nuevos colaboradores
            if (taskData.collaborators.length > 0) {
                for (const collaboratorId of taskData.collaborators) {
                    await connection.execute(
                        `INSERT INTO jira_task_collaborators (task_id, user_id) VALUES (?, ?)`,
                        [id, collaboratorId]
                    );
                }
            }
        }
        
        await connection.commit();
        
        // Obtener la tarea actualizada
        const updatedTask = await getTaskById(id);
        return updatedTask;
    } catch (error) {
        if (connection) await connection.rollback();
        logger.error("Error in updateTask service:", error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

// Eliminar una tarea
export const deleteTask = async (id) => {
    let connection;
    try {
        connection = await getConnection();
        await connection.beginTransaction();
        
        // Eliminar colaboradores primero
        await connection.execute(`DELETE FROM jira_task_collaborators WHERE task_id = ?`, [id]);
        
        // Eliminar la tarea
        const [result] = await connection.execute(`DELETE FROM jira_tasks WHERE id = ?`, [id]);
        
        await connection.commit();
        
        return result.affectedRows > 0;
    } catch (error) {
        if (connection) await connection.rollback();
        logger.error("Error in deleteTask service:", error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

// Verificar si un usuario puede cambiar el estado de una tarea
export const canUserChangeTaskStatus = async (taskId, userId, newStatus) => {
    let connection;
    try {
        connection = await getConnection();
        
        // Obtener información de la tarea y el usuario
        const query = `
            SELECT 
                t.status as current_status,
                t.assignee_id,
                u.role_id,
                r.name as role_name
            FROM jira_tasks t
            LEFT JOIN users u ON u.id = ?
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE t.id = ?
        `;
        
        const [rows] = await connection.execute(query, [userId, taskId]);
        
        if (rows.length === 0) {
            return { allowed: false, message: "Tarea no encontrada" };
        }
        
        const { current_status, assignee_id, role_name } = rows[0];
        
        // Los administradores y jefes pueden cambiar cualquier estado
        if (role_name === 'admin' || role_name === 'supervisor') {
            return { allowed: true };
        }
        
        // Los desarrolladores solo pueden cambiar sus propias tareas
        if (assignee_id !== userId) {
            return { allowed: false, message: "Solo puedes cambiar el estado de tus propias tareas" };
        }
        
        // Si está intentando cambiar desde "en progreso", requiere aprobación
        if (current_status === 'inProgress' && newStatus !== 'inProgress') {
            return { 
                allowed: false, 
                requiresApproval: true, 
                currentStatus: current_status,
                message: "Los cambios desde 'En Progreso' requieren aprobación del jefe" 
            };
        }
        
        return { allowed: true };
    } catch (error) {
        logger.error("Error in canUserChangeTaskStatus service:", error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

// Actualizar estado de una tarea
export const updateTaskStatus = async (taskId, status, userId) => {
    let connection;
    try {
        connection = await getConnection();
        
        const query = `
            UPDATE jira_tasks 
            SET status = ?, updated_by = ?, updated_at = NOW()
            WHERE id = ?
        `;
        
        const [result] = await connection.execute(query, [status, userId, taskId]);
        
        if (result.affectedRows === 0) {
            return null;
        }
        
        return await getTaskById(taskId);
    } catch (error) {
        logger.error("Error in updateTaskStatus service:", error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

// Asignar tarea a un desarrollador
export const assignTask = async (taskId, assignmentData) => {
    let connection;
    try {
        connection = await getConnection();
        await connection.beginTransaction();
        
        const {
            assigneeId,
            collaborators,
            priority,
            dueDate,
            estimatedHours,
            notes,
            assignedBy,
            assignedAt
        } = assignmentData;
        
        // Verificar capacidad del desarrollador
        const capacityCheck = await checkDeveloperCapacity(assigneeId, estimatedHours);
        if (!capacityCheck.available) {
            return {
                success: false,
                message: `El desarrollador no tiene capacidad suficiente. Disponible: ${capacityCheck.availableHours}h`
            };
        }
        
        // Actualizar la tarea
        const query = `
            UPDATE jira_tasks 
            SET assignee_id = ?, priority = ?, due_date = ?, estimated_hours = ?,
                status = CASE WHEN status = 'backlog' THEN 'todo' ELSE status END,
                updated_by = ?, updated_at = ?
            WHERE id = ?
        `;
        
        const [result] = await connection.execute(query, [
            assigneeId,
            priority,
            dueDate,
            estimatedHours,
            assignedBy,
            assignedAt,
            taskId
        ]);
        
        if (result.affectedRows === 0) {
            await connection.rollback();
            return { success: false, message: "Tarea no encontrada" };
        }
        
        // Eliminar colaboradores existentes
        await connection.execute(`DELETE FROM jira_task_collaborators WHERE task_id = ?`, [taskId]);
        
        // Agregar nuevos colaboradores
        if (collaborators && collaborators.length > 0) {
            for (const collaboratorId of collaborators) {
                await connection.execute(
                    `INSERT INTO jira_task_collaborators (task_id, user_id) VALUES (?, ?)`,
                    [taskId, collaboratorId]
                );
            }
        }
        
        // Registrar la asignación
        if (notes) {
            await connection.execute(
                `INSERT INTO jira_task_history (task_id, user_id, action, notes, created_at) 
                 VALUES (?, ?, 'assigned', ?, ?)`,
                [taskId, assignedBy, notes, assignedAt]
            );
        }
        
        await connection.commit();
        
        const task = await getTaskById(taskId);
        return { success: true, task };
    } catch (error) {
        if (connection) await connection.rollback();
        logger.error("Error in assignTask service:", error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

// Verificar capacidad de un desarrollador
const checkDeveloperCapacity = async (developerId, hoursNeeded) => {
    let connection;
    try {
        connection = await getConnection();
        
        // Obtener capacidad máxima del desarrollador
        const [developerRows] = await connection.execute(
            `SELECT max_capacity FROM jira_developers WHERE user_id = ?`,
            [developerId]
        );
        
        const maxCapacity = developerRows[0]?.max_capacity || 40;
        
        // Calcular horas actuales asignadas
        const [workloadRows] = await connection.execute(
            `SELECT COALESCE(SUM(estimated_hours), 0) as current_workload
             FROM jira_tasks 
             WHERE assignee_id = ? AND status IN ('todo', 'inProgress', 'review')`,
            [developerId]
        );
        
        const currentWorkload = workloadRows[0].current_workload;
        const availableHours = maxCapacity - currentWorkload;
        
        return {
            available: availableHours >= hoursNeeded,
            availableHours,
            currentWorkload,
            maxCapacity
        };
    } catch (error) {
        logger.error("Error checking developer capacity:", error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

// Agregar colaborador
export const addCollaborator = async (taskId, userId) => {
    let connection;
    try {
        connection = await getConnection();
        
        // Verificar si ya es colaborador
        const [existingRows] = await connection.execute(
            `SELECT id FROM jira_task_collaborators WHERE task_id = ? AND user_id = ?`,
            [taskId, userId]
        );
        
        if (existingRows.length > 0) {
            return { success: false, message: "El usuario ya es colaborador de esta tarea" };
        }
        
        await connection.execute(
            `INSERT INTO jira_task_collaborators (task_id, user_id) VALUES (?, ?)`,
            [taskId, userId]
        );
        
        const task = await getTaskById(taskId);
        return { success: true, task };
    } catch (error) {
        logger.error("Error in addCollaborator service:", error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

// Remover colaborador
export const removeCollaborator = async (taskId, userId) => {
    let connection;
    try {
        connection = await getConnection();
        
        const [result] = await connection.execute(
            `DELETE FROM jira_task_collaborators WHERE task_id = ? AND user_id = ?`,
            [taskId, userId]
        );
        
        if (result.affectedRows === 0) {
            return { success: false, message: "Colaborador no encontrado" };
        }
        
        const task = await getTaskById(taskId);
        return { success: true, task };
    } catch (error) {
        logger.error("Error in removeCollaborator service:", error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

// Obtener tareas por desarrollador
export const getTasksByDeveloper = async (developerId, includeCollaborations = false) => {
    let connection;
    try {
        connection = await getConnection();
        
        let query = `
            SELECT DISTINCT t.*, 
                   u_assignee.name as assignee_name,
                   u_assignee.email as assignee_email
            FROM jira_tasks t
            LEFT JOIN users u_assignee ON t.assignee_id = u_assignee.id
            WHERE t.assignee_id = ?
        `;
        
        const params = [developerId];
        
        if (includeCollaborations) {
            query = `
                SELECT DISTINCT t.*, 
                       u_assignee.name as assignee_name,
                       u_assignee.email as assignee_email,
                       CASE WHEN tc.user_id IS NOT NULL THEN 'collaborator' ELSE 'assignee' END as role_type
                FROM jira_tasks t
                LEFT JOIN users u_assignee ON t.assignee_id = u_assignee.id
                LEFT JOIN jira_task_collaborators tc ON t.id = tc.task_id
                WHERE t.assignee_id = ? OR tc.user_id = ?
            `;
            params.push(developerId);
        }
        
        query += ` ORDER BY t.created_at DESC`;
        
        const [tasks] = await connection.execute(query, params);
        
        return tasks.map(task => formatTask(task));
    } catch (error) {
        logger.error("Error in getTasksByDeveloper service:", error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

// Obtener tareas por estado
export const getTasksByStatus = async (status) => {
    let connection;
    try {
        connection = await getConnection();
        
        const query = `
            SELECT t.*, 
                   u_assignee.name as assignee_name,
                   u_assignee.email as assignee_email
            FROM jira_tasks t
            LEFT JOIN users u_assignee ON t.assignee_id = u_assignee.id
            WHERE t.status = ?
            ORDER BY t.priority DESC, t.created_at DESC
        `;
        
        const [tasks] = await connection.execute(query, [status]);
        
        return tasks.map(task => formatTask(task));
    } catch (error) {
        logger.error("Error in getTasksByStatus service:", error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

// Crear solicitud de cambio de tarea
export const createTaskChangeRequest = async (requestData) => {
    let connection;
    try {
        connection = await getConnection();
        
        const {
            taskId,
            userId,
            fromStatus,
            toStatus,
            reason,
            requestedAt
        } = requestData;
        
        const query = `
            INSERT INTO jira_task_change_requests 
            (task_id, user_id, from_status, to_status, reason, status, requested_at)
            VALUES (?, ?, ?, ?, ?, 'pending', ?)
        `;
        
        const [result] = await connection.execute(query, [
            taskId,
            userId,
            fromStatus,
            toStatus,
            reason,
            requestedAt
        ]);
        
        // Obtener la solicitud completa con datos relacionados
        const [requestRows] = await connection.execute(`
            SELECT 
                tcr.*,
                t.title as task_title,
                u.name as user_name,
                u.phone as user_phone
            FROM jira_task_change_requests tcr
            JOIN jira_tasks t ON tcr.task_id = t.id
            JOIN users u ON tcr.user_id = u.id
            WHERE tcr.id = ?
        `, [result.insertId]);
        
        return requestRows[0];
    } catch (error) {
        logger.error("Error in createTaskChangeRequest service:", error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

// Función auxiliar para formatear tareas
const formatTask = (task) => {
    const formatted = {
        id: task.id,
        title: task.title,
        description: task.description,
        assignee: task.assignee_id ? {
            id: task.assignee_id,
            name: task.assignee_name,
            email: task.assignee_email,
            phone: task.assignee_phone
        } : null,
        priority: task.priority,
        status: task.status,
        category: task.category,
        dueDate: task.due_date,
        estimatedHours: task.estimated_hours,
        actualHours: task.actual_hours,
        progress: task.progress,
        requiredSkills: task.required_skills ? JSON.parse(task.required_skills) : [],
        createdBy: {
            id: task.created_by,
            name: task.created_by_name
        },
        updatedBy: task.updated_by ? {
            id: task.updated_by,
            name: task.updated_by_name
        } : null,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        collaborators: []
    };
    
    // Procesar colaboradores
    if (task.collaborators) {
        const collabData = task.collaborators.split(',');
        formatted.collaborators = collabData.map(collab => {
            const [id, name, email] = collab.split(':');
            return { id: parseInt(id), name, email };
        }).filter(collab => collab.id); // Filtrar colaboradores válidos
    }
    
    return formatted;
};
