import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

dotenv.config();

async function testLogin(email, password) {
    try {
        console.log(`\n=== PROBANDO LOGIN ===`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        
        // Consulta exacta que usa el controlador de auth
        const [rows] = await connection.execute(`
            SELECT
              usu_foto AS usuFoto,
              usu_id AS usuId,
              usu_clave AS clave,
              CONCAT(usu_nombre, ' ', IFNULL(usu_apellido, '')) AS nombre,
              usu_correo AS correo,
              usu_telefono AS telefono,
              usu_correo AS documento,
              est_id AS estado,
              prf_id AS perfil,
              usu_agenda AS agenda,
              usu_instructor AS instructor,
              usu_cambio AS cambioclave
            FROM tbl_usuarios
            WHERE (usu_correo = ? OR usu_usuario = ?) AND est_id IN (1,4)
        `, [email, email]);
        
        if (rows.length === 0) {
            console.log('❌ No se encontró el usuario');
            return;
        }
        
        console.log('✅ Usuario encontrado:', rows[0].nombre);
        console.log('Hash en BD:', rows[0].clave);
        
        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, rows[0].clave);
        console.log('✅ Contraseña válida:', isMatch);
        
        if (isMatch) {
            console.log('🎉 LOGIN EXITOSO');
            console.log('Datos del usuario:', {
                id: rows[0].usuId,
                nombre: rows[0].nombre,
                correo: rows[0].correo,
                perfil: rows[0].perfil
            });
        } else {
            console.log('❌ Contraseña incorrecta');
        }
        
        await connection.end();
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

// Probar con el admin
testLogin('admin@tablero.com', 'admin123');
