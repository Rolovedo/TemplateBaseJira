import mysql from 'mysql2/promise';
import { pool } from '../../common/configs/database.config.js'; // Importar el pool named export

// Controladores temporales para el tablero

export const getTasks = async (req, res) => {
    try {
        console.log('📋 Obteniendo tareas del tablero...');
        console.log('👤 Usuario autenticado:', req.user);

        // Datos temporales de ejemplo
        const mockTasks = {
            backlog: [
                {
                    id: 1,
                    titulo: 'Tarea de ejemplo',
                    descripcion: 'Esta es una tarea de ejemplo',
                    prioridad: 'high',
                    asignado_a: 1,
                    creado_por: req.user.usu_id,
                    estado: 'backlog',
                    fecha_creacion: new Date(),
                    horas_estimadas: 8
                }
            ],
            todo: [],
            inProgress: [],
            review: [],
            done: []
        };

        console.log('✅ Tareas obtenidas exitosamente');
        res.json({
            success: true,
            data: mockTasks
        });

    } catch (error) {
        console.error('❌ Error obteniendo tareas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las tareas'
        });
    }
};

export const createTask = async (req, res) => {
    try {
        console.log('✨ Creando nueva tarea...');
        console.log('👤 Usuario autenticado:', req.user);
        console.log('📝 Datos de la tarea:', req.body);

        const {
            titulo,
            descripcion,
            asignado_a,
            prioridad = 'medium',
            fecha_vencimiento,
            categoria,
            horas_estimadas = 0,
            estado = 'backlog',
            creado_por,
            habilidades_requeridas = []
        } = req.body;

        // Validaciones básicas
        if (!titulo) {
            return res.status(400).json({
                success: false,
                message: 'El título es requerido'
            });
        }

        if (!asignado_a) {
            return res.status(400).json({
                success: false,
                message: 'El asignado es requerido'
            });
        }

        // Simular creación de tarea (aquí iría la inserción en BD)
        const nuevaTarea = {
            id: Date.now(), // ID temporal
            titulo,
            descripcion,
            asignado_a,
            prioridad,
            fecha_vencimiento,
            categoria,
            horas_estimadas,
            estado,
            creado_por: req.user.usu_id,
            habilidades_requeridas,
            fecha_creacion: new Date()
        };

        console.log('✅ Tarea creada exitosamente:', nuevaTarea);

        res.status(201).json({
            success: true,
            message: 'Tarea creada exitosamente',
            data: nuevaTarea
        });

    } catch (error) {
        console.error('❌ Error creando tarea:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear la tarea'
        });
    }
};

export const updateTaskStatus = async (req, res) => {
    try {
        console.log('🔄 Actualizando estado de tarea...');
        console.log('👤 Usuario autenticado:', req.user);
        
        const { taskId } = req.params;
        const { status } = req.body;

        console.log(`📝 Actualizando tarea ${taskId} a estado: ${status}`);

        // Simular actualización
        const tareaActualizada = {
            id: taskId,
            estado: status,
            fecha_actualizacion: new Date(),
            actualizado_por: req.user.usu_id
        };

        console.log('✅ Tarea actualizada exitosamente');

        res.json({
            success: true,
            message: 'Estado de tarea actualizado',
            data: tareaActualizada
        });

    } catch (error) {
        console.error('❌ Error actualizando tarea:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la tarea'
        });
    }
};