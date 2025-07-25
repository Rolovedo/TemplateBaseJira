// Configuración de base de datos para el sistema Tablero
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tablero_pavas',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

console.log('🗄️ Configuración de base de datos:', {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database
});

// Crear pool de conexiones
export const pool = mysql.createPool(dbConfig);

// Función para probar la conexión
export const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión a base de datos exitosa');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Error conectando a base de datos:', error.message);
        console.log('⚠️ Continuando sin conexión a BD (usando datos simulados)');
        return false;
    }
};

// Event listeners para el pool
pool.on('connection', (connection) => {
    console.log(`Nueva conexión establecida: ${connection.threadId}`);
});

pool.on('error', (error) => {
    console.error('Error en el pool de conexiones:', error.message);
    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
        console.warn('Conexión perdida, reintentando...');
    }
});

// Inicializar conexión al importar
testConnection();

// Exportar tanto como named export como default
export default pool;

// Crear conexión a la base de datos
//const pool = mysql.createPool(dbConfig); // Cambio aquí

// Obtener todas las tareas organizadas por estado
export const getTasks = async (req, res) => {
    try {
        console.log('🔍 Obteniendo tareas del tablero...');
        console.log('👤 Usuario autenticado:', req.user?.usu_id);
        
        const [tasks] = await pool.execute(`
            SELECT 
                t.*,
                u.usu_nombre as asignado_nombre,
                u.usu_apellido as asignado_apellido
            FROM tablero_tareas t
            LEFT JOIN tbl_usuarios u ON t.asignado_a = u.usu_id
            ORDER BY t.fecha_creacion DESC
        `);

        console.log(`📋 Tareas encontradas: ${tasks.length}`);

        // Organizar tareas por estado
        const organizedTasks = {
            backlog: [],
            todo: [],
            inProgress: [],
            review: [],
            done: []
        };

        tasks.forEach(task => {
            const taskData = {
                id: task.id.toString(),
                title: task.titulo,
                description: task.descripcion,
                assignee: {
                    id: task.asignado_a,
                    name: `${task.asignado_nombre || ''} ${task.asignado_apellido || ''}`.trim(),
                    avatar: `${task.asignado_nombre?.charAt(0) || ''}${task.asignado_apellido?.charAt(0) || ''}`
                },
                priority: task.prioridad,
                dueDate: task.fecha_vencimiento,
                category: task.categoria,
                estimatedHours: task.horas_estimadas,
                realHours: task.horas_reales,
                progress: task.progreso,
                skills: task.habilidades_requeridas ? JSON.parse(task.habilidades_requeridas) : [],
                createdDate: task.fecha_creacion,
                collaborators: []
            };

            // Mapear estados de la base de datos a los del frontend
            let frontendState = 'backlog';
            switch (task.estado) {
                case 'pendiente':
                    frontendState = 'backlog';
                    break;
                case 'por-hacer':
                    frontendState = 'todo';
                    break;
                case 'en-progreso':
                    frontendState = 'inProgress';
                    break;
                case 'revision':
                    frontendState = 'review';
                    break;
                case 'completada':
                    frontendState = 'done';
                    break;
                default:
                    frontendState = 'backlog';
            }

            organizedTasks[frontendState].push(taskData);
        });

        console.log('✅ Tareas organizadas y enviadas');
        res.json(organizedTasks);
    } catch (error) {
        console.error('❌ Error getting tasks:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener las tareas',
            error: error.message 
        });
    }
};

// Crear nueva tarea
export const createTask = async (req, res) => {
    try {
        console.log('🆕 Creando nueva tarea...');
        console.log('📥 Datos recibidos:', req.body);
        console.log('👤 Usuario creador:', req.user?.usu_id);
        
        const {
            titulo,
            descripcion,
            asignado_a,
            prioridad,
            fecha_vencimiento,
            categoria,
            horas_estimadas,
            estado,
            creado_por,
            habilidades_requeridas
        } = req.body;

        // Validaciones
        if (!titulo || !asignado_a) {
            console.log('⚠️ Validación fallida: faltan campos obligatorios');
            return res.status(400).json({
                success: false,
                message: 'Título y asignado son campos obligatorios'
            });
        }

        // Mapear prioridad del frontend a la base de datos
        let dbPrioridad = 'media';
        switch (prioridad) {
            case 'low':
                dbPrioridad = 'baja';
                break;
            case 'medium':
                dbPrioridad = 'media';
                break;
            case 'high':
                dbPrioridad = 'alta';
                break;
            case 'urgent':
                dbPrioridad = 'muy-alta';
                break;
            default:
                dbPrioridad = 'media';
        }

        // Mapear estado del frontend a la base de datos
        let dbEstado = 'pendiente';
        switch (estado) {
            case 'backlog':
                dbEstado = 'pendiente';
                break;
            case 'todo':
                dbEstado = 'por-hacer';
                break;
            case 'inProgress':
                dbEstado = 'en-progreso';
                break;
            case 'review':
                dbEstado = 'revision';
                break;
            case 'done':
                dbEstado = 'completada';
                break;
            default:
                dbEstado = 'pendiente';
        }

        console.log('💾 Insertando en base de datos...');
        const [result] = await pool.execute(`
            INSERT INTO tablero_tareas (
                titulo,
                descripcion,
                asignado_a,
                prioridad,
                fecha_vencimiento,
                categoria,
                horas_estimadas,
                estado,
                creado_por,
                habilidades_requeridas
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            titulo,
            descripcion || null,
            asignado_a,
            dbPrioridad,
            fecha_vencimiento || null,
            categoria || null,
            horas_estimadas || 0,
            dbEstado,
            creado_por,
            habilidades_requeridas ? JSON.stringify(habilidades_requeridas) : null
        ]);

        console.log('✅ Tarea insertada con ID:', result.insertId);

        // Obtener la tarea creada
        const [createdTask] = await pool.execute(`
            SELECT t.*, u.usu_nombre, u.usu_apellido 
            FROM tablero_tareas t
            LEFT JOIN tbl_usuarios u ON t.asignado_a = u.usu_id
            WHERE t.id = ?
        `, [result.insertId]);

        console.log('🎉 Tarea creada exitosamente');
        res.status(201).json({
            success: true,
            message: 'Tarea creada exitosamente',
            task: {
                id: createdTask[0].id,
                titulo: createdTask[0].titulo,
                descripcion: createdTask[0].descripcion,
                asignado_a: createdTask[0].asignado_a,
                prioridad: createdTask[0].prioridad,
                estado: createdTask[0].estado,
                fecha_creacion: createdTask[0].fecha_creacion
            }
        });
    } catch (error) {
        console.error('❌ Error creating task:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear la tarea',
            error: error.message
        });
    }
};

// Actualizar estado de tarea
export const updateTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;

        // Mapear estado del frontend a la base de datos
        let dbEstado = 'pendiente';
        switch (status) {
            case 'backlog':
                dbEstado = 'pendiente';
                break;
            case 'todo':
                dbEstado = 'por-hacer';
                break;
            case 'inProgress':
                dbEstado = 'en-progreso';
                break;
            case 'review':
                dbEstado = 'revision';
                break;
            case 'done':
                dbEstado = 'completada';
                break;
            default:
                dbEstado = 'pendiente';
        }

        const [result] = await pool.execute(`
            UPDATE tablero_tareas 
            SET estado = ?, actualizado_por = ?
            WHERE id = ?
        `, [dbEstado, req.user?.usu_id || 1, taskId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tarea no encontrada'
            });
        }

        res.json({
            success: true,
            message: 'Estado de tarea actualizado'
        });
    } catch (error) {
        console.error('Error updating task status:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el estado de la tarea',
            error: error.message
        });
    }
};
