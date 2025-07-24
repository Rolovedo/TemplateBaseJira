// Servicio para gestión de desarrolladores en el sistema del Tablero
import { pool } from '../../../common/configs/database.config.js';
import { logger } from '../../../common/utils/logger.js';

class DevelopersService {
    
    /**
     * Obtener todos los desarrolladores con sus estadísticas
     */
    async getDevelopers(filters = {}) {
        try {
            let query = `
                SELECT 
                    d.*,
                    u.name,
                    u.email,
                    ds.total_tasks,
                    ds.completed_tasks,
                    ds.in_progress_tasks,
                    ds.current_workload,
                    ds.workload_percentage,
                    ds.avg_completion_time
                FROM tablero_developers d
                JOIN users u ON d.user_id = u.id
                LEFT JOIN tablero_developer_stats ds ON d.user_id = ds.user_id
                WHERE d.is_active = TRUE
            `;

            const params = [];

            if (filters.role) {
                query += ` AND d.role = ?`;
                params.push(filters.role);
            }

            if (filters.level) {
                query += ` AND d.level = ?`;
                params.push(filters.level);
            }

            if (filters.maxWorkload) {
                query += ` AND ds.workload_percentage <= ?`;
                params.push(filters.maxWorkload);
            }

            query += ` ORDER BY u.name`;

            const [rows] = await pool.execute(query, params);
            
            return rows.map(dev => ({
                ...dev,
                skills: dev.skills ? JSON.parse(dev.skills) : []
            }));

        } catch (error) {
            logger.error('Error obteniendo desarrolladores:', error);
            throw error;
        }
    }

    /**
     * Obtener un desarrollador por ID
     */
    async getDeveloperById(userId) {
        try {
            const query = `
                SELECT 
                    d.*,
                    u.name,
                    u.email,
                    ds.total_tasks,
                    ds.completed_tasks,
                    ds.in_progress_tasks,
                    ds.current_workload,
                    ds.workload_percentage,
                    ds.avg_completion_time
                FROM tablero_developers d
                JOIN users u ON d.user_id = u.id
                LEFT JOIN tablero_developer_stats ds ON d.user_id = ds.user_id
                WHERE d.user_id = ?
            `;

            const [rows] = await pool.execute(query, [userId]);
            
            if (rows.length === 0) {
                return null;
            }

            const developer = rows[0];
            developer.skills = developer.skills ? JSON.parse(developer.skills) : [];

            return developer;

        } catch (error) {
            logger.error('Error obteniendo desarrollador:', error);
            throw error;
        }
    }

    /**
     * Crear o actualizar perfil de desarrollador
     */
    async upsertDeveloper(userId, developerData) {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();

            const {
                role = 'developer',
                level = 'junior',
                skills = [],
                maxCapacity = 40,
                efficiencyRating = 0.85,
                avatar = null,
                phone = null
            } = developerData;

            const query = `
                INSERT INTO tablero_developers (
                    user_id, role, level, skills, max_capacity, 
                    efficiency_rating, avatar, phone
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    role = VALUES(role),
                    level = VALUES(level),
                    skills = VALUES(skills),
                    max_capacity = VALUES(max_capacity),
                    efficiency_rating = VALUES(efficiency_rating),
                    avatar = VALUES(avatar),
                    phone = VALUES(phone),
                    updated_at = CURRENT_TIMESTAMP
            `;

            const params = [
                userId,
                role,
                level,
                JSON.stringify(skills),
                maxCapacity,
                efficiencyRating,
                avatar,
                phone
            ];

            await connection.execute(query, params);
            await connection.commit();

            return await this.getDeveloperById(userId);

        } catch (error) {
            await connection.rollback();
            logger.error('Error creando/actualizando desarrollador:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Obtener estadísticas generales del equipo
     */
    async getTeamStatistics() {
        try {
            const queries = {
                totalDevelopers: `
                    SELECT COUNT(*) as count 
                    FROM tablero_developers 
                    WHERE is_active = TRUE
                `,
                taskDistribution: `
                    SELECT 
                        status,
                        COUNT(*) as count
                    FROM tablero_tasks
                    GROUP BY status
                `,
                workloadDistribution: `
                    SELECT 
                        CASE 
                            WHEN workload_percentage >= 90 THEN 'Sobrecargado'
                            WHEN workload_percentage >= 70 THEN 'Alta carga'
                            WHEN workload_percentage >= 40 THEN 'Carga normal'
                            ELSE 'Disponible'
                        END as workload_level,
                        COUNT(*) as count
                    FROM tablero_developer_stats
                    GROUP BY workload_level
                `,
                levelDistribution: `
                    SELECT 
                        level,
                        COUNT(*) as count
                    FROM tablero_developers
                    WHERE is_active = TRUE
                    GROUP BY level
                `,
                topPerformers: `
                    SELECT 
                        u.name,
                        d.level,
                        ds.completed_tasks,
                        ds.avg_completion_time
                    FROM tablero_developers d
                    JOIN users u ON d.user_id = u.id
                    LEFT JOIN tablero_developer_stats ds ON d.user_id = ds.user_id
                    WHERE d.is_active = TRUE AND ds.completed_tasks > 0
                    ORDER BY ds.completed_tasks DESC, ds.avg_completion_time ASC
                    LIMIT 5
                `
            };

            const results = {};

            for (const [key, query] of Object.entries(queries)) {
                const [rows] = await pool.execute(query);
                results[key] = rows;
            }

            return results;

        } catch (error) {
            logger.error('Error obteniendo estadísticas del equipo:', error);
            throw error;
        }
    }

    /**
     * Obtener desarrolladores recomendados para una tarea
     */
    async getRecommendedDevelopers(taskData) {
        try {
            const { requiredSkills = [], estimatedHours = 0, priority = 'medium' } = taskData;

            let query = `
                SELECT 
                    d.*,
                    u.name,
                    u.email,
                    ds.current_workload,
                    ds.workload_percentage,
                    ds.completed_tasks,
                    ds.avg_completion_time,
                    (
                        -- Cálculo del score de recomendación
                        (100 - COALESCE(ds.workload_percentage, 0)) * 0.4 +
                        (d.efficiency_rating * 100) * 0.3 +
                        (CASE d.level 
                            WHEN 'architect' THEN 100
                            WHEN 'tech-lead' THEN 90
                            WHEN 'senior' THEN 80
                            WHEN 'semi-senior' THEN 60
                            WHEN 'junior' THEN 40
                            ELSE 50
                        END) * 0.3
                    ) as recommendation_score
                FROM tablero_developers d
                JOIN users u ON d.user_id = u.id
                LEFT JOIN tablero_developer_stats ds ON d.user_id = ds.user_id
                WHERE d.is_active = TRUE
                    AND (ds.current_workload + ?) <= d.max_capacity
            `;

            const params = [estimatedHours];

            // Si hay habilidades requeridas, filtrar por ellas
            if (requiredSkills.length > 0) {
                const skillConditions = requiredSkills.map(() => 'JSON_CONTAINS(d.skills, ?)').join(' OR ');
                query += ` AND (${skillConditions})`;
                
                requiredSkills.forEach(skill => {
                    params.push(JSON.stringify(skill));
                });
            }

            query += ` ORDER BY recommendation_score DESC LIMIT 5`;

            const [rows] = await pool.execute(query, params);
            
            return rows.map(dev => ({
                ...dev,
                skills: dev.skills ? JSON.parse(dev.skills) : [],
                recommendation_score: Math.round(dev.recommendation_score)
            }));

        } catch (error) {
            logger.error('Error obteniendo desarrolladores recomendados:', error);
            throw error;
        }
    }

    /**
     * Verificar disponibilidad de un desarrollador
     */
    async checkAvailability(userId, additionalHours = 0) {
        try {
            const query = `
                SELECT 
                    d.max_capacity,
                    COALESCE(ds.current_workload, 0) as current_workload,
                    (d.max_capacity - COALESCE(ds.current_workload, 0) - ?) as available_hours
                FROM tablero_developers d
                LEFT JOIN tablero_developer_stats ds ON d.user_id = ds.user_id
                WHERE d.user_id = ? AND d.is_active = TRUE
            `;

            const [rows] = await pool.execute(query, [additionalHours, userId]);
            
            if (rows.length === 0) {
                return { available: false, reason: 'Desarrollador no encontrado' };
            }

            const { max_capacity, current_workload, available_hours } = rows[0];

            return {
                available: available_hours >= 0,
                maxCapacity: max_capacity,
                currentWorkload: current_workload,
                availableHours: Math.max(0, available_hours),
                workloadPercentage: Math.round((current_workload / max_capacity) * 100)
            };

        } catch (error) {
            logger.error('Error verificando disponibilidad:', error);
            throw error;
        }
    }

    /**
     * Desactivar desarrollador
     */
    async deactivateDeveloper(userId) {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();

            // Desasignar tareas activas
            await connection.execute(`
                UPDATE tablero_tasks 
                SET assignee_id = NULL, updated_at = CURRENT_TIMESTAMP
                WHERE assignee_id = ? AND status IN ('todo', 'inProgress', 'review')
            `, [userId]);

            // Desactivar desarrollador
            await connection.execute(`
                UPDATE tablero_developers 
                SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            `, [userId]);

            await connection.commit();

            return { success: true };

        } catch (error) {
            await connection.rollback();
            logger.error('Error desactivando desarrollador:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Obtener historial de tareas de un desarrollador
     */
    async getDeveloperTaskHistory(userId, limit = 20) {
        try {
            const query = `
                SELECT 
                    t.*,
                    th.action,
                    th.created_at as history_date,
                    th.notes
                FROM tablero_task_history th
                JOIN tablero_tasks t ON th.task_id = t.id
                WHERE th.user_id = ?
                ORDER BY th.created_at DESC
                LIMIT ?
            `;

            const [rows] = await pool.execute(query, [userId, limit]);
            return rows;

        } catch (error) {
            logger.error('Error obteniendo historial de desarrollador:', error);
            throw error;
        }
    }
}

export default new DevelopersService();
