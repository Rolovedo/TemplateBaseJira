// Servicio para gestión de notificaciones WhatsApp
import { logger } from '../../../common/utils/logger.js';
import { pool } from '../../../common/configs/database.config.js';

class WhatsAppNotificationService {

    /**
     * Enviar notificación por WhatsApp
     */
    async sendNotification(data) {
        try {
            const {
                phone,
                message,
                taskId = null,
                changeRequestId = null,
                type = 'general'
            } = data;

            // Registrar la notificación en la base de datos
            const notificationId = await this.saveNotification({
                taskId,
                changeRequestId,
                recipientPhone: phone,
                message,
                type
            });

            // Aquí se integraría con el servicio real de WhatsApp
            // Por ahora simulamos el envío
            const success = await this.sendWhatsAppMessage(phone, message);

            // Actualizar el estado de la notificación
            await this.updateNotificationStatus(notificationId, success ? 'sent' : 'failed');

            if (success) {
                logger.info(`Notificación WhatsApp enviada a ${phone}`);
            } else {
                logger.error(`Error enviando notificación WhatsApp a ${phone}`);
            }

            return { success, notificationId };

        } catch (error) {
            logger.error('Error en servicio de notificación WhatsApp:', error);
            throw error;
        }
    }

    /**
     * Enviar notificación de solicitud de cambio de tarea
     */
    async sendTaskChangeRequestNotification(changeRequest) {
        try {
            // Obtener teléfono del supervisor desde configuración
            const supervisorPhone = await this.getSupervisorPhone();
            
            if (!supervisorPhone) {
                throw new Error('No se encontró teléfono del supervisor configurado');
            }

            // Obtener información de la tarea y desarrollador
            const taskInfo = await this.getTaskAndDeveloperInfo(changeRequest.task_id, changeRequest.user_id);
            
            const message = this.buildChangeRequestMessage(changeRequest, taskInfo);

            return await this.sendNotification({
                phone: supervisorPhone,
                message,
                taskId: changeRequest.task_id,
                changeRequestId: changeRequest.id,
                type: 'task_change_request'
            });

        } catch (error) {
            logger.error('Error enviando notificación de cambio de tarea:', error);
            throw error;
        }
    }

    /**
     * Enviar notificación de asignación de tarea
     */
    async sendTaskAssignmentNotification(task, developer) {
        try {
            if (!developer.phone) {
                logger.warn(`Desarrollador ${developer.name} no tiene teléfono configurado`);
                return { success: false, reason: 'Sin teléfono configurado' };
            }

            const message = this.buildAssignmentMessage(task, developer);

            return await this.sendNotification({
                phone: developer.phone,
                message,
                taskId: task.id,
                type: 'task_assignment'
            });

        } catch (error) {
            logger.error('Error enviando notificación de asignación:', error);
            throw error;
        }
    }

    /**
     * Enviar notificación de tarea vencida
     */
    async sendOverdueTaskNotification(task, developer) {
        try {
            if (!developer.phone) {
                return { success: false, reason: 'Sin teléfono configurado' };
            }

            const message = this.buildOverdueMessage(task, developer);

            return await this.sendNotification({
                phone: developer.phone,
                message,
                taskId: task.id,
                type: 'task_overdue'
            });

        } catch (error) {
            logger.error('Error enviando notificación de tarea vencida:', error);
            throw error;
        }
    }

    /**
     * Guardar notificación en la base de datos
     */
    async saveNotification(data) {
        try {
            const {
                taskId,
                changeRequestId,
                recipientPhone,
                message,
                type
            } = data;

            const query = `
                INSERT INTO tablero_whatsapp_notifications (
                    task_id, change_request_id, recipient_phone, 
                    message, type, status, created_at
                ) VALUES (?, ?, ?, ?, ?, 'pending', NOW())
            `;

            const [result] = await pool.execute(query, [
                taskId,
                changeRequestId,
                recipientPhone,
                message,
                type
            ]);

            return result.insertId;

        } catch (error) {
            logger.error('Error guardando notificación:', error);
            throw error;
        }
    }

    /**
     * Actualizar estado de notificación
     */
    async updateNotificationStatus(notificationId, status) {
        try {
            const query = `
                UPDATE tablero_whatsapp_notifications 
                SET status = ?, sent_at = CASE WHEN ? = 'sent' THEN NOW() ELSE sent_at END
                WHERE id = ?
            `;

            await pool.execute(query, [status, status, notificationId]);

        } catch (error) {
            logger.error('Error actualizando estado de notificación:', error);
            throw error;
        }
    }

    /**
     * Obtener teléfono del supervisor desde configuración
     */
    async getSupervisorPhone() {
        try {
            const query = `
                SELECT setting_value 
                FROM tablero_settings 
                WHERE setting_key = 'supervisor_phone'
            `;

            const [rows] = await pool.execute(query);
            return rows.length > 0 ? rows[0].setting_value : null;

        } catch (error) {
            logger.error('Error obteniendo teléfono del supervisor:', error);
            throw error;
        }
    }

    /**
     * Obtener información de tarea y desarrollador
     */
    async getTaskAndDeveloperInfo(taskId, userId) {
        try {
            const query = `
                SELECT 
                    t.title as task_title,
                    t.status as current_status,
                    t.priority,
                    u.name as developer_name
                FROM tablero_tasks t
                JOIN users u ON u.id = ?
                WHERE t.id = ?
            `;

            const [rows] = await pool.execute(query, [userId, taskId]);
            return rows.length > 0 ? rows[0] : null;

        } catch (error) {
            logger.error('Error obteniendo información de tarea y desarrollador:', error);
            throw error;
        }
    }

    /**
     * Construir mensaje para solicitud de cambio
     */
    buildChangeRequestMessage(changeRequest, taskInfo) {
        const priorityEmoji = {
            'very-high': '🔴',
            'high': '🟠',
            'medium': '🟡',
            'low': '🟢'
        };

        const statusEmoji = {
            'backlog': '📋',
            'todo': '📌',
            'inProgress': '⚡',
            'review': '👀',
            'done': '✅'
        };

        return `🚨 *SOLICITUD DE CAMBIO DE TAREA*

👤 *Desarrollador:* ${taskInfo.developer_name}
📝 *Tarea:* ${taskInfo.task_title}
${priorityEmoji[taskInfo.priority] || '⚪'} *Prioridad:* ${taskInfo.priority.toUpperCase()}

📊 *Estado actual:* ${statusEmoji[changeRequest.from_status]} ${changeRequest.from_status}
📊 *Estado solicitado:* ${statusEmoji[changeRequest.to_status]} ${changeRequest.to_status}

💬 *Motivo:*
${changeRequest.reason}

⏰ *Fecha solicitud:* ${new Date(changeRequest.requested_at).toLocaleString('es-CO')}

Por favor, revisa y aprueba/rechaza esta solicitud en el sistema del tablero.`;
    }

    /**
     * Construir mensaje para asignación de tarea
     */
    buildAssignmentMessage(task, developer) {
        const priorityEmoji = {
            'very-high': '🔴',
            'high': '🟠',
            'medium': '🟡',
            'low': '🟢'
        };

        return `📋 *NUEVA TAREA ASIGNADA*

👋 Hola ${developer.name},

Se te ha asignado una nueva tarea:

📝 *Tarea:* ${task.title}
${priorityEmoji[task.priority] || '⚪'} *Prioridad:* ${task.priority.toUpperCase()}
⏰ *Estimación:* ${task.estimated_hours || 0} horas
📅 *Fecha límite:* ${task.due_date ? new Date(task.due_date).toLocaleDateString('es-CO') : 'No definida'}

${task.description ? `📄 *Descripción:*\n${task.description}` : ''}

¡Por favor, revisa los detalles en el sistema del tablero!`;
    }

    /**
     * Construir mensaje para tarea vencida
     */
    buildOverdueMessage(task, developer) {
        return `⚠️ *TAREA VENCIDA*

👋 ${developer.name},

La siguiente tarea ha superado su fecha límite:

📝 *Tarea:* ${task.title}
📅 *Fecha límite:* ${new Date(task.due_date).toLocaleDateString('es-CO')}
📊 *Estado actual:* ${task.status}
📈 *Progreso:* ${task.progress || 0}%

Por favor, actualiza el estado o contacta con tu supervisor.`;
    }

    /**
     * Enviar mensaje por WhatsApp (integración real)
     */
    async sendWhatsAppMessage(phone, message) {
        try {
            // Aquí se integraría con la API real de WhatsApp
            // Por ejemplo: Twilio, WhatsApp Business API, etc.
            
            // Simulación de envío
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // En desarrollo, simplemente log el mensaje
            logger.info(`Simulando envío WhatsApp a ${phone}:`);
            logger.info(message);
            
            // En producción, reemplazar con código real:
            /*
            const response = await fetch('https://api.whatsapp.com/send', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    to: phone,
                    type: 'text',
                    text: { body: message }
                })
            });
            
            return response.ok;
            */
            
            return true; // Simulación exitosa

        } catch (error) {
            logger.error('Error enviando mensaje WhatsApp:', error);
            return false;
        }
    }

    /**
     * Obtener historial de notificaciones
     */
    async getNotificationHistory(filters = {}) {
        try {
            let query = `
                SELECT 
                    n.*,
                    t.title as task_title,
                    cr.reason as change_reason
                FROM tablero_whatsapp_notifications n
                LEFT JOIN tablero_tasks t ON n.task_id = t.id
                LEFT JOIN tablero_task_change_requests cr ON n.change_request_id = cr.id
                WHERE 1=1
            `;

            const params = [];

            if (filters.status) {
                query += ` AND n.status = ?`;
                params.push(filters.status);
            }

            if (filters.type) {
                query += ` AND n.type = ?`;
                params.push(filters.type);
            }

            if (filters.dateFrom) {
                query += ` AND n.created_at >= ?`;
                params.push(filters.dateFrom);
            }

            if (filters.dateTo) {
                query += ` AND n.created_at <= ?`;
                params.push(filters.dateTo);
            }

            query += ` ORDER BY n.created_at DESC LIMIT 100`;

            const [rows] = await pool.execute(query, params);
            return rows;

        } catch (error) {
            logger.error('Error obteniendo historial de notificaciones:', error);
            throw error;
        }
    }

    /**
     * Reenviar notificación fallida
     */
    async retryFailedNotification(notificationId) {
        try {
            const query = `
                SELECT * FROM tablero_whatsapp_notifications 
                WHERE id = ? AND status = 'failed'
            `;

            const [rows] = await pool.execute(query, [notificationId]);
            
            if (rows.length === 0) {
                throw new Error('Notificación no encontrada o no está en estado fallido');
            }

            const notification = rows[0];
            
            const success = await this.sendWhatsAppMessage(
                notification.recipient_phone,
                notification.message
            );

            await this.updateNotificationStatus(
                notificationId,
                success ? 'sent' : 'failed'
            );

            return { success };

        } catch (error) {
            logger.error('Error reenviando notificación:', error);
            throw error;
        }
    }
}

export default new WhatsAppNotificationService();
