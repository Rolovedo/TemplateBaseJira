-- Script para actualizar las contraseñas de los usuarios existentes
-- Ejecutar este script si ya tienes usuarios creados pero las contraseñas no funcionan

-- Actualizar contraseña del administrador
UPDATE tbl_usuarios 
SET usu_clave = '$2b$10$iN5nL0ZH12EDEeP7LAgibeG6w1OsnkI/PHneTKdP3ZEgphrcAng.K' 
WHERE usu_correo = 'admin@jira.com';

-- Actualizar contraseñas de los desarrolladores
UPDATE tbl_usuarios 
SET usu_clave = '$2b$10$V5Z1BaVEqRywWllKEA2dzechXJiaxzuLtoLIo0pahXHl1aiOFhCBO' 
WHERE usu_correo IN (
    'juan.perez@empresa.com',
    'maria.garcia@empresa.com', 
    'carlos.lopez@empresa.com',
    'ana.rodriguez@empresa.com'
);

-- Verificar que se actualizaron
SELECT 
    usu_correo,
    usu_usuario,
    'Contraseña actualizada correctamente' as estado
FROM tbl_usuarios 
WHERE usu_correo = 'admin@jira.com';
