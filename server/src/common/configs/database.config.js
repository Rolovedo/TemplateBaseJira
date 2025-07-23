// Configuración de base de datos para el sistema Jira
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

// Crear pool de conexiones
export const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    multipleStatements: false,
    timezone: '+00:00'
});

// Función para testear la conexión
export const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        logger.success('✅ Conexión a la base de datos establecida correctamente');
        return true;
    } catch (error) {
        logger.error('❌ Error conectando a la base de datos:', error.message);
        return false;
    }
};

// Función helper para ejecutar queries con manejo de errores
export const executeQuery = async (query, params = []) => {
    try {
        const [rows] = await pool.execute(query, params);
        return rows;
    } catch (error) {
        logger.error('Error ejecutando query:', {
            query: query.substring(0, 100) + '...',
            error: error.message
        });
        throw error;
    }
};

// Función para transacciones
export const executeTransaction = async (operations) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const results = [];
        for (const operation of operations) {
            const [result] = await connection.execute(operation.query, operation.params || []);
            results.push(result);
        }
        
        await connection.commit();
        return results;
    } catch (error) {
        await connection.rollback();
        logger.error('Error en transacción:', error.message);
        throw error;
    } finally {
        connection.release();
    }
};

// Event listeners para el pool
pool.on('connection', (connection) => {
    logger.debug(`Nueva conexión establecida: ${connection.threadId}`);
});

pool.on('error', (error) => {
    logger.error('Error en el pool de conexiones:', error.message);
    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
        logger.warn('Conexión perdida, reintentando...');
    }
});

// Inicializar conexión al importar
testConnection();

export default pool;
