-- Script para agregar la tabla faltante tbl_permisos_usuarios
-- Ejecutar este script para corregir el error de login

-- Crear tabla de permisos adicionales
CREATE TABLE IF NOT EXISTS tbl_permisos_usuarios (
    pu_id INT AUTO_INCREMENT PRIMARY KEY,
    usu_id INT NOT NULL,
    per_id INT NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usu_id) REFERENCES tbl_usuarios(usu_id) ON DELETE CASCADE,
    UNIQUE KEY unique_usuario_permiso (usu_id, per_id)
);

-- Asignar permisos generales a todos los usuarios activos
INSERT INTO tbl_permisos_usuarios (usu_id, per_id)
SELECT usu_id, 1 as per_id FROM tbl_usuarios WHERE est_id = 1
ON DUPLICATE KEY UPDATE usu_id = VALUES(usu_id);

-- Verificar que se creó correctamente
SELECT 
    'Tabla tbl_permisos_usuarios creada exitosamente' as mensaje,
    COUNT(*) as usuarios_con_permisos
FROM tbl_permisos_usuarios;
