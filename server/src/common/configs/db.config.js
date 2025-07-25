import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
    waitForConnections: true,
    queueLimit: 0
});

// Función para obtener una conexión
const getConnection = async () => {
  try {
    const connection = await pool.getConnection();
    // console.log("Conexión obtenida del pool");
    return connection;
  } catch (error) {
    console.error("Error al obtener la conexión:", error);
    throw error;
  }
};

// Función para liberar una conexión
const releaseConnection = (connection) => {
  if (connection) {
    connection.release(); // Devuelve la conexión al pool
    // console.log("Conexión liberada al pool");
  }
};

// Función para probar la conexión
const testConnection = async () => {
  let connection;
  try {
    connection = await getConnection();
    console.log(
      `✅ Conexión exitosa a la base de datos ${process.env.DB_NAME} en ${process.env.DB_HOST}`
    );
    await connection.query("SELECT 1"); // Prueba simple
  } catch (error) {
    console.error(`❌ Error conectando a la base de datos: | Data: ${error.message}`);
  } finally {
    releaseConnection(connection);
  }
};

// Función para ejecutar una consulta
const executeQuery = async (query, params = [], connection) => {
  let connectionDb = null;
  try {
    connectionDb = connection ? connection : await getConnection();
    const [results] = await connectionDb.execute(query, params);
    return results;
  } catch (error) {
    console.error("Error ejecutando la consulta:", error);
    throw error;
  } finally {
    if (!connection && connectionDb) releaseConnection(connectionDb);
  }
};

export { pool, testConnection, getConnection, releaseConnection, executeQuery };
