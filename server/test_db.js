import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

console.log('=== VERIFICACIÓN DE CONFIGURACIÓN ===');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***CONFIGURADA***' : 'NO CONFIGURADA');

async function testConnection() {
    try {
        console.log('\n=== PRUEBA DE CONEXIÓN ===');
        
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        
        console.log('✅ Conexión exitosa a la base de datos');
        
        // Verificar si existen las tablas
        const [tables] = await connection.execute("SHOW TABLES LIKE 'tbl_%'");
        console.log('\n=== TABLAS ENCONTRADAS ===');
        console.log('Tablas del sistema:', tables.length);
        tables.forEach(table => {
            console.log('-', Object.values(table)[0]);
        });
        
        // Verificar usuarios
        try {
            const [users] = await connection.execute("SELECT usu_correo, usu_usuario, prf_id FROM tbl_usuarios WHERE est_id = 1");
            console.log('\n=== USUARIOS ENCONTRADOS ===');
            users.forEach(user => {
                console.log(`- ${user.usu_correo} (${user.usu_usuario}) - Perfil: ${user.prf_id}`);
            });
        } catch (error) {
            console.log('❌ Error consultando usuarios:', error.message);
        }
        
        await connection.end();
        
    } catch (error) {
        console.log('❌ Error de conexión:', error.message);
        console.log('Código de error:', error.code);
    }
}

testConnection();
