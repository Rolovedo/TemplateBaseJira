-- Base de datos para el sistema Jira
-- Ejecutar estos scripts en orden

-- 1. Tabla para desarrolladores/usuarios con información específica de Jira
CREATE TABLE IF NOT EXISTS jira_desarrolladores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'desarrollador', -- 'desarrollador', 'supervisor', 'administrador'
    nivel VARCHAR(50) NOT NULL DEFAULT 'junior', -- 'junior', 'semi-senior', 'senior', 'tech-lead', 'arquitecto'
    habilidades JSON, -- Array de habilidades técnicas
    capacidad_maxima INT NOT NULL DEFAULT 40, -- Horas máximas por semana
    calificacion_eficiencia DECIMAL(3,2) DEFAULT 0.85, -- Rating de eficiencia (0-1)
    esta_activo BOOLEAN DEFAULT TRUE,
    avatar VARCHAR(10), -- Iniciales para el avatar
    telefono VARCHAR(20), -- Para notificaciones WhatsApp
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES tbl_usuarios(usu_id) ON DELETE CASCADE,
    UNIQUE KEY unique_usuario_desarrollador (usuario_id)
);

-- 2. Tabla principal de tareas
CREATE TABLE IF NOT EXISTS jira_tareas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    asignado_a INT NULL, -- Puede ser NULL si no está asignada
    prioridad ENUM('baja', 'media', 'alta', 'muy-alta') DEFAULT 'media',
    estado ENUM('pendiente', 'por-hacer', 'en-progreso', 'revision', 'completada') DEFAULT 'pendiente',
    categoria VARCHAR(50), -- 'frontend', 'backend', 'base-datos', 'devops', 'testing', 'documentacion'
    fecha_vencimiento DATE NULL,
    horas_estimadas INT DEFAULT 0,
    horas_reales INT DEFAULT 0,
    progreso INT DEFAULT 0, -- Porcentaje 0-100
    habilidades_requeridas JSON, -- Array de habilidades requeridas
    creado_por INT NOT NULL,
    actualizado_por INT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (asignado_a) REFERENCES tbl_usuarios(usu_id) ON DELETE SET NULL,
    FOREIGN KEY (creado_por) REFERENCES tbl_usuarios(usu_id) ON DELETE CASCADE,
    FOREIGN KEY (actualizado_por) REFERENCES tbl_usuarios(usu_id) ON DELETE SET NULL,
    
    INDEX idx_asignado_a (asignado_a),
    INDEX idx_estado (estado),
    INDEX idx_prioridad (prioridad),
    INDEX idx_categoria (categoria),
    INDEX idx_fecha_vencimiento (fecha_vencimiento),
    INDEX idx_fecha_creacion (fecha_creacion)
);

-- 3. Tabla para colaboradores de tareas
CREATE TABLE IF NOT EXISTS jira_tarea_colaboradores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tarea_id INT NOT NULL,
    usuario_id INT NOT NULL,
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    agregado_por INT,
    
    FOREIGN KEY (tarea_id) REFERENCES jira_tareas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES tbl_usuarios(usu_id) ON DELETE CASCADE,
    FOREIGN KEY (agregado_por) REFERENCES tbl_usuarios(usu_id) ON DELETE SET NULL,
    
    UNIQUE KEY unique_tarea_colaborador (tarea_id, usuario_id)
);

-- 4. Tabla para solicitudes de cambio de tareas
CREATE TABLE IF NOT EXISTS jira_solicitudes_cambio_tarea (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tarea_id INT NOT NULL,
    usuario_id INT NOT NULL, -- Quien solicita el cambio
    estado_anterior VARCHAR(20),
    estado_solicitado VARCHAR(20),
    motivo TEXT,
    estado ENUM('pendiente', 'aprobado', 'rechazado') DEFAULT 'pendiente',
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_revision TIMESTAMP NULL,
    revisado_por INT NULL, -- Quien aprueba/rechaza
    notas_revisor TEXT,
    
    FOREIGN KEY (tarea_id) REFERENCES jira_tareas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES tbl_usuarios(usu_id) ON DELETE CASCADE,
    FOREIGN KEY (revisado_por) REFERENCES tbl_usuarios(usu_id) ON DELETE SET NULL,
    
    INDEX idx_estado (estado),
    INDEX idx_fecha_solicitud (fecha_solicitud)
);

-- 5. Tabla para historial de tareas
CREATE TABLE IF NOT EXISTS jira_historial_tareas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tarea_id INT NOT NULL,
    usuario_id INT NOT NULL,
    accion VARCHAR(50) NOT NULL, -- 'creada', 'asignada', 'estado_cambiado', 'actualizada', 'comentario'
    valor_anterior TEXT NULL,
    valor_nuevo TEXT NULL,
    notas TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tarea_id) REFERENCES jira_tareas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES tbl_usuarios(usu_id) ON DELETE CASCADE,
    
    INDEX idx_tarea_id (tarea_id),
    INDEX idx_fecha_creacion (fecha_creacion)
);

-- 6. Tabla para comentarios en tareas
CREATE TABLE IF NOT EXISTS jira_comentarios_tarea (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tarea_id INT NOT NULL,
    usuario_id INT NOT NULL,
    comentario TEXT NOT NULL,
    es_interno BOOLEAN DEFAULT FALSE, -- Para comentarios internos del equipo
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tarea_id) REFERENCES jira_tareas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES tbl_usuarios(usu_id) ON DELETE CASCADE,
    
    INDEX idx_tarea_id (tarea_id),
    INDEX idx_fecha_creacion (fecha_creacion)
);

-- 7. Tabla para archivos adjuntos
CREATE TABLE IF NOT EXISTS jira_archivos_adjuntos_tarea (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tarea_id INT NOT NULL,
    usuario_id INT NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    tamaño_archivo INT,
    tipo_archivo VARCHAR(100),
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tarea_id) REFERENCES jira_tareas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES tbl_usuarios(usu_id) ON DELETE CASCADE
);

-- 8. Tabla para configuraciones del sistema Jira
CREATE TABLE IF NOT EXISTS jira_configuraciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clave_configuracion VARCHAR(100) NOT NULL UNIQUE,
    valor_configuracion TEXT,
    descripcion TEXT,
    actualizado_por INT,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (actualizado_por) REFERENCES tbl_usuarios(usu_id) ON DELETE SET NULL
);

-- 9. Tabla para notificaciones de WhatsApp
CREATE TABLE IF NOT EXISTS jira_notificaciones_whatsapp (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tarea_id INT NULL,
    solicitud_cambio_id INT NULL,
    telefono_destinatario VARCHAR(20) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(50), -- 'asignacion_tarea', 'solicitud_cambio_tarea', 'tarea_vencida', etc.
    estado ENUM('pendiente', 'enviado', 'fallido') DEFAULT 'pendiente',
    fecha_envio TIMESTAMP NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tarea_id) REFERENCES jira_tareas(id) ON DELETE SET NULL,
    FOREIGN KEY (solicitud_cambio_id) REFERENCES jira_solicitudes_cambio_tarea(id) ON DELETE SET NULL,
    
    INDEX idx_estado (estado),
    INDEX idx_tipo (tipo),
    INDEX idx_fecha_creacion (fecha_creacion)
);

-- 10. Insertar datos iniciales en configuraciones
INSERT INTO jira_configuraciones (clave_configuracion, valor_configuracion, descripcion) VALUES
('telefono_supervisor', '+57300123456', 'Teléfono del jefe de programadores para notificaciones'),
('max_solicitudes_cambio_por_dia', '3', 'Máximo número de solicitudes de cambio por desarrollador por día'),
('asignacion_automatica_habilitada', 'true', 'Habilitar asignación automática basada en algoritmo'),
('notificaciones_habilitadas', 'true', 'Habilitar notificaciones de WhatsApp'),
('horas_notificacion_vencimiento', '24', 'Horas antes del vencimiento para notificar')
ON DUPLICATE KEY UPDATE valor_configuracion = VALUES(valor_configuracion);

-- 11. Crear algunos roles si no existen (ajustar según tu tabla de roles existente)
-- INSERT INTO roles (name, description) VALUES 
-- ('jira_administrador', 'Administrador del sistema Jira'),
-- ('jira_supervisor', 'Jefe de programadores'),
-- ('jira_desarrollador', 'Desarrollador')
-- ON DUPLICATE KEY UPDATE description = VALUES(description);

-- 12. Vista para estadísticas de desarrolladores
CREATE OR REPLACE VIEW jira_estadisticas_desarrolladores AS
SELECT 
    d.usuario_id,
    CONCAT(u.usu_nombre, ' ', IFNULL(u.usu_apellido, '')) as nombre_desarrollador,
    u.usu_correo as email,
    d.rol,
    d.nivel,
    d.capacidad_maxima,
    d.calificacion_eficiencia,
    COALESCE(estadisticas_tareas.total_tareas, 0) as total_tareas,
    COALESCE(estadisticas_tareas.tareas_completadas, 0) as tareas_completadas,
    COALESCE(estadisticas_tareas.tareas_en_progreso, 0) as tareas_en_progreso,
    COALESCE(estadisticas_tareas.carga_trabajo_actual, 0) as carga_trabajo_actual,
    COALESCE(estadisticas_tareas.tiempo_promedio_completar, 0) as tiempo_promedio_completar,
    ROUND((COALESCE(estadisticas_tareas.carga_trabajo_actual, 0) / d.capacidad_maxima) * 100, 2) as porcentaje_carga_trabajo
FROM jira_desarrolladores d
JOIN tbl_usuarios u ON d.usuario_id = u.usu_id
LEFT JOIN (
    SELECT 
        asignado_a,
        COUNT(*) as total_tareas,
        SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) as tareas_completadas,
        SUM(CASE WHEN estado = 'en-progreso' THEN 1 ELSE 0 END) as tareas_en_progreso,
        SUM(CASE WHEN estado IN ('por-hacer', 'en-progreso', 'revision') THEN horas_estimadas ELSE 0 END) as carga_trabajo_actual,
        AVG(CASE WHEN estado = 'completada' AND horas_reales > 0 THEN horas_reales ELSE NULL END) as tiempo_promedio_completar
    FROM jira_tareas 
    WHERE asignado_a IS NOT NULL
    GROUP BY asignado_a
) estadisticas_tareas ON d.usuario_id = estadisticas_tareas.asignado_a
WHERE d.esta_activo = TRUE;

-- 13. Vista para el tablero (kanban board)
CREATE OR REPLACE VIEW jira_vista_tablero AS
SELECT 
    t.id,
    t.titulo,
    t.descripcion,
    t.prioridad,
    t.estado,
    t.categoria,
    t.fecha_vencimiento,
    t.horas_estimadas,
    t.horas_reales,
    t.progreso,
    t.habilidades_requeridas,
    t.fecha_creacion,
    t.fecha_actualizacion,
    CASE WHEN t.fecha_vencimiento < CURDATE() AND t.estado != 'completada' THEN TRUE ELSE FALSE END as esta_vencida,
    asignado.usu_id as asignado_a_id,
    CONCAT(asignado.usu_nombre, ' ', IFNULL(asignado.usu_apellido, '')) as nombre_asignado,
    asignado.usu_correo as email_asignado,
    jd.avatar as avatar_asignado,
    CONCAT(creador.usu_nombre, ' ', IFNULL(creador.usu_apellido, '')) as nombre_creador,
    GROUP_CONCAT(
        CONCAT(colaborador.usu_id, ':', CONCAT(colaborador.usu_nombre, ' ', IFNULL(colaborador.usu_apellido, '')), ':', jd_colaborador.avatar)
        ORDER BY CONCAT(colaborador.usu_nombre, ' ', IFNULL(colaborador.usu_apellido, ''))
        SEPARATOR ','
    ) as colaboradores
FROM jira_tareas t
LEFT JOIN tbl_usuarios asignado ON t.asignado_a = asignado.usu_id
LEFT JOIN jira_desarrolladores jd ON asignado.usu_id = jd.usuario_id
LEFT JOIN tbl_usuarios creador ON t.creado_por = creador.usu_id
LEFT JOIN jira_tarea_colaboradores tc ON t.id = tc.tarea_id
LEFT JOIN tbl_usuarios colaborador ON tc.usuario_id = colaborador.usu_id
LEFT JOIN jira_desarrolladores jd_colaborador ON colaborador.usu_id = jd_colaborador.usuario_id
GROUP BY t.id
ORDER BY 
    FIELD(t.prioridad, 'muy-alta', 'alta', 'media', 'baja'),
    t.fecha_creacion DESC;

-- Índices adicionales para optimización
CREATE INDEX idx_jira_tareas_compuesto ON jira_tareas(estado, prioridad, asignado_a);
CREATE INDEX idx_jira_historial_tareas_compuesto ON jira_historial_tareas(tarea_id, fecha_creacion);
CREATE INDEX idx_jira_desarrolladores_activos ON jira_desarrolladores(esta_activo, usuario_id);

-- Triggers para auditoría automática
DELIMITER //

CREATE TRIGGER jira_auditoria_cambio_estado_tarea 
AFTER UPDATE ON jira_tareas
FOR EACH ROW
BEGIN
    IF OLD.estado != NEW.estado THEN
        INSERT INTO jira_historial_tareas (
            tarea_id, usuario_id, accion, valor_anterior, valor_nuevo, fecha_creacion
        ) VALUES (
            NEW.id, 
            NEW.actualizado_por, 
            'estado_cambiado', 
            OLD.estado, 
            NEW.estado, 
            NOW()
        );
    END IF;
END//

CREATE TRIGGER jira_auditoria_asignacion_tarea 
AFTER UPDATE ON jira_tareas
FOR EACH ROW
BEGIN
    IF OLD.asignado_a != NEW.asignado_a THEN
        INSERT INTO jira_historial_tareas (
            tarea_id, usuario_id, accion, valor_anterior, valor_nuevo, fecha_creacion
        ) VALUES (
            NEW.id, 
            NEW.actualizado_por, 
            'asignada', 
            COALESCE(OLD.asignado_a, 'sin_asignar'), 
            COALESCE(NEW.asignado_a, 'sin_asignar'), 
            NOW()
        );
    END IF;
END//

DELIMITER ;
