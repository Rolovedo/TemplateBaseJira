-- Script para crear la estructura base de usuarios y datos iniciales
-- Ejecutar este script ANTES que jira_tablas.sql

-- 1. Tabla de estados
CREATE TABLE IF NOT EXISTS tbl_estados (
    est_id INT AUTO_INCREMENT PRIMARY KEY,
    est_nombre VARCHAR(50) NOT NULL,
    est_descripcion VARCHAR(255),
    est_color VARCHAR(7) DEFAULT '#007bff'
);

-- 2. Tabla de perfiles/roles
CREATE TABLE IF NOT EXISTS tbl_perfil (
    prf_id INT AUTO_INCREMENT PRIMARY KEY,
    prf_nombre VARCHAR(50) NOT NULL,
    prf_descripcion VARCHAR(255),
    est_id INT DEFAULT 1,
    FOREIGN KEY (est_id) REFERENCES tbl_estados(est_id)
);

-- 3. Tabla principal de usuarios
CREATE TABLE IF NOT EXISTS tbl_usuarios (
    usu_id INT AUTO_INCREMENT PRIMARY KEY,
    usu_foto VARCHAR(255) NULL,
    usu_nombre VARCHAR(100) NOT NULL,
    usu_apellido VARCHAR(100) NULL,
    usu_correo VARCHAR(150) NOT NULL UNIQUE,
    usu_usuario VARCHAR(50) NULL UNIQUE,
    usu_clave VARCHAR(255) NOT NULL,
    usu_telefono VARCHAR(20) NULL,
    usu_documento VARCHAR(20) NULL,
    est_id INT DEFAULT 1,
    prf_id INT NOT NULL,
    usu_agenda BOOLEAN DEFAULT FALSE,
    usu_instructor BOOLEAN DEFAULT FALSE,
    usu_cambio BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (est_id) REFERENCES tbl_estados(est_id),
    FOREIGN KEY (prf_id) REFERENCES tbl_perfil(prf_id),
    
    INDEX idx_correo (usu_correo),
    INDEX idx_usuario (usu_usuario),
    INDEX idx_estado (est_id)
);

-- 4. Tabla para ventanas/permisos (simplificada)
CREATE TABLE IF NOT EXISTS tbl_ventanas (
    ven_id INT AUTO_INCREMENT PRIMARY KEY,
    ven_nombre VARCHAR(100) NOT NULL,
    ven_ruta VARCHAR(255),
    ven_icono VARCHAR(50),
    est_id INT DEFAULT 1,
    FOREIGN KEY (est_id) REFERENCES tbl_estados(est_id)
);

-- 5. Tabla de permisos de usuarios a ventanas
CREATE TABLE IF NOT EXISTS tbl_usuarios_ventanas (
    uv_id INT AUTO_INCREMENT PRIMARY KEY,
    usu_id INT NOT NULL,
    ven_id INT NOT NULL,
    FOREIGN KEY (usu_id) REFERENCES tbl_usuarios(usu_id) ON DELETE CASCADE,
    FOREIGN KEY (ven_id) REFERENCES tbl_ventanas(ven_id) ON DELETE CASCADE,
    UNIQUE KEY unique_usuario_ventana (usu_id, ven_id)
);

-- 6. Tabla de permisos adicionales (para compatibilidad con el controlador de auth)
CREATE TABLE IF NOT EXISTS tbl_permisos_usuarios (
    pu_id INT AUTO_INCREMENT PRIMARY KEY,
    usu_id INT NOT NULL,
    per_id INT NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usu_id) REFERENCES tbl_usuarios(usu_id) ON DELETE CASCADE,
    UNIQUE KEY unique_usuario_permiso (usu_id, per_id)
);

-- 7. Vista para compatibilidad con el sistema Jira (mapeo a la tabla 'users')
CREATE OR REPLACE VIEW users AS
SELECT 
    usu_id as id,
    CONCAT(usu_nombre, ' ', IFNULL(usu_apellido, '')) as name,
    usu_correo as email,
    usu_clave as password,
    fecha_creacion as created_at,
    fecha_actualizacion as updated_at
FROM tbl_usuarios 
WHERE est_id IN (1, 4);

-- INSERTAR DATOS INICIALES

-- Estados
INSERT INTO tbl_estados (est_id, est_nombre, est_descripcion, est_color) VALUES
(1, 'Activo', 'Usuario activo en el sistema', '#28a745'),
(2, 'Inactivo', 'Usuario temporalmente inactivo', '#ffc107'),
(3, 'Eliminado', 'Usuario eliminado del sistema', '#dc3545'),
(4, 'Pendiente', 'Usuario pendiente de activación', '#17a2b8')
ON DUPLICATE KEY UPDATE 
    est_nombre = VALUES(est_nombre),
    est_descripcion = VALUES(est_descripcion),
    est_color = VALUES(est_color);

-- Perfiles
INSERT INTO tbl_perfil (prf_id, prf_nombre, prf_descripcion, est_id) VALUES
(1, 'Administrador', 'Acceso completo al sistema', 1),
(2, 'Supervisor', 'Supervisor de desarrolladores', 1),
(3, 'Desarrollador Senior', 'Desarrollador con experiencia avanzada', 1),
(4, 'Desarrollador', 'Desarrollador regular', 1),
(5, 'Desarrollador Junior', 'Desarrollador en formación', 1)
ON DUPLICATE KEY UPDATE 
    prf_nombre = VALUES(prf_nombre),
    prf_descripcion = VALUES(prf_descripcion),
    est_id = VALUES(est_id);

-- Ventanas principales del sistema
INSERT INTO tbl_ventanas (ven_id, ven_nombre, ven_ruta, ven_icono, est_id) VALUES
(1, 'Dashboard', '/dashboard', 'pi pi-home', 1),
(2, 'Tablero Jira', '/jira/board', 'pi pi-th-large', 1),
(3, 'Gestión de Tareas', '/jira/tasks', 'pi pi-list', 1),
(4, 'Asignación de Tareas', '/jira/assignment', 'pi pi-users', 1),
(5, 'Desarrolladores', '/jira/developers', 'pi pi-user', 1),
(6, 'Guía de Uso', '/jira/guide', 'pi pi-question-circle', 1),
(7, 'Usuarios', '/security/users', 'pi pi-user-edit', 1),
(8, 'Configuración', '/admin/settings', 'pi pi-cog', 1)
ON DUPLICATE KEY UPDATE 
    ven_nombre = VALUES(ven_nombre),
    ven_ruta = VALUES(ven_ruta),
    ven_icono = VALUES(ven_icono),
    est_id = VALUES(est_id);

-- Usuario administrador inicial
-- Contraseña: admin123 (hash generado con bcrypt)
INSERT INTO tbl_usuarios (
    usu_id,
    usu_nombre, 
    usu_apellido, 
    usu_correo, 
    usu_usuario, 
    usu_clave, 
    usu_telefono,
    est_id, 
    prf_id, 
    usu_cambio
) VALUES (
    1,
    'Administrador',
    'Sistema',
    'admin@jira.com',
    'admin',
    '$2b$10$iN5nL0ZH12EDEeP7LAgibeG6w1OsnkI/PHneTKdP3ZEgphrcAng.K', -- admin123
    '1234567890',
    1,
    1,
    0
) ON DUPLICATE KEY UPDATE 
    usu_nombre = VALUES(usu_nombre),
    usu_apellido = VALUES(usu_apellido),
    usu_correo = VALUES(usu_correo),
    usu_usuario = VALUES(usu_usuario),
    usu_clave = VALUES(usu_clave),
    usu_telefono = VALUES(usu_telefono),
    est_id = VALUES(est_id),
    prf_id = VALUES(prf_id);

-- Usuario desarrollador de ejemplo
-- Contraseña: dev123
INSERT INTO tbl_usuarios (
    usu_id,
    usu_nombre, 
    usu_apellido, 
    usu_correo, 
    usu_usuario, 
    usu_clave, 
    usu_telefono,
    est_id, 
    prf_id, 
    usu_cambio
) VALUES (
    2,
    'Juan',
    'Pérez',
    'juan.perez@empresa.com',
    'jperez',
    '$2b$10$V5Z1BaVEqRywWllKEA2dzechXJiaxzuLtoLIo0pahXHl1aiOFhCBO', -- dev123
    '0987654321',
    1,
    4,
    0
) ON DUPLICATE KEY UPDATE 
    usu_nombre = VALUES(usu_nombre),
    usu_apellido = VALUES(usu_apellido),
    usu_correo = VALUES(usu_correo),
    usu_usuario = VALUES(usu_usuario),
    usu_clave = VALUES(usu_clave),
    usu_telefono = VALUES(usu_telefono),
    est_id = VALUES(est_id),
    prf_id = VALUES(prf_id);

-- Más desarrolladores de ejemplo
INSERT INTO tbl_usuarios (
    usu_id,
    usu_nombre, 
    usu_apellido, 
    usu_correo, 
    usu_usuario, 
    usu_clave, 
    usu_telefono,
    est_id, 
    prf_id, 
    usu_cambio
) VALUES 
(3, 'María', 'García', 'maria.garcia@empresa.com', 'mgarcia', '$2b$10$V5Z1BaVEqRywWllKEA2dzechXJiaxzuLtoLIo0pahXHl1aiOFhCBO', '1122334455', 1, 3, 0),
(4, 'Carlos', 'López', 'carlos.lopez@empresa.com', 'clopez', '$2b$10$V5Z1BaVEqRywWllKEA2dzechXJiaxzuLtoLIo0pahXHl1aiOFhCBO', '2233445566', 1, 4, 0),
(5, 'Ana', 'Rodríguez', 'ana.rodriguez@empresa.com', 'arodriguez', '$2b$10$V5Z1BaVEqRywWllKEA2dzechXJiaxzuLtoLIo0pahXHl1aiOFhCBO', '3344556677', 1, 5, 0)
ON DUPLICATE KEY UPDATE 
    usu_nombre = VALUES(usu_nombre),
    usu_apellido = VALUES(usu_apellido),
    usu_correo = VALUES(usu_correo),
    usu_usuario = VALUES(usu_usuario),
    usu_clave = VALUES(usu_clave),
    usu_telefono = VALUES(usu_telefono),
    est_id = VALUES(est_id),
    prf_id = VALUES(prf_id);

-- Asignar todos los permisos al administrador
INSERT INTO tbl_usuarios_ventanas (usu_id, ven_id)
SELECT 1, ven_id FROM tbl_ventanas WHERE est_id = 1
ON DUPLICATE KEY UPDATE usu_id = VALUES(usu_id);

-- Asignar permisos básicos a los desarrolladores (ventanas Jira)
INSERT INTO tbl_usuarios_ventanas (usu_id, ven_id)
SELECT u.usu_id, v.ven_id 
FROM tbl_usuarios u 
CROSS JOIN tbl_ventanas v 
WHERE u.prf_id IN (3, 4, 5) 
AND v.ven_id IN (1, 2, 3, 4, 5, 6)
AND u.usu_id > 1
ON DUPLICATE KEY UPDATE usu_id = VALUES(usu_id);

-- Asignar permisos generales (para compatibilidad con el controlador de auth)
INSERT INTO tbl_permisos_usuarios (usu_id, per_id)
SELECT usu_id, 1 as per_id FROM tbl_usuarios WHERE est_id = 1
ON DUPLICATE KEY UPDATE usu_id = VALUES(usu_id);

-- Mensaje de finalización
SELECT 
    '✅ Setup completado exitosamente' as mensaje,
    'Usuarios creados:' as info,
    '' as separador;

SELECT 
    CONCAT('👤 ', usu_correo, ' | ', usu_usuario) as credenciales_acceso,
    CASE 
        WHEN u.prf_id = 1 THEN '🔧 admin123'
        ELSE '🔧 dev123'
    END as password,
    p.prf_nombre as rol
FROM tbl_usuarios u
JOIN tbl_perfil p ON u.prf_id = p.prf_id
WHERE u.est_id = 1
ORDER BY u.prf_id;
