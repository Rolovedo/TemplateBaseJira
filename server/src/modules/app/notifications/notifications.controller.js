import {
  getConnection,
  releaseConnection,
  executeQuery,
} from "../../../common/configs/db.config.js";
import { getIO } from "../../../common/configs/socket.manager.js";

export const getNotificationCount = async (req, res, next) => {
  const { userId } = req.query;

  let connection = null;
  try {
    connection = await getConnection();

    const notifications = await executeQuery(
      "SELECT COUNT(not_id) tot FROM tbl_notificaciones WHERE usu_id = ? AND not_visto = 0",
      [Number(userId)],
      connection
    );
    res.json(notifications[0].tot);
  } catch (err) {
    next(err);
  } finally {
    releaseConnection(connection);
  }
};

export const listNotifications = async (req, res, next) => {
  const { userId, page = 1, limit = 10, estado = 0 } = req.body;
  const offset = (page - 1) * limit;

  if (!userId || isNaN(limit) || isNaN(offset)) {
    return res.status(400).json({ mensaje: "Parámetros no válidos" });
  }

  const whereConditions = [`usu_id = ${userId}`]

  if(estado > 0){
    let visto = estado === 1 ? 0 : 1;
    whereConditions.push(`not_visto = ${visto}`)
  }

  let connection = null;
  try {
    connection = await getConnection();

    const notifications = await executeQuery(
      `SELECT * FROM tbl_notificaciones 
       ${whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''}
       ORDER BY not_fec_env DESC 
       LIMIT ${+limit} OFFSET ${+offset}`,
      [userId],
      connection
    );

    // Post-procesar cada notificación
    const parsedNotifications = notifications.map((n) => ({
      ...n,
      not_data: n.not_data ? JSON.parse(n.not_data) : null,
      not_fec_env:
        n.not_fec_env instanceof Date
          ? n.not_fec_env.toISOString()
          : n.not_fec_env,
    }));

    res.json(parsedNotifications);
  } catch (err) {
    next(err);
  } finally {
    releaseConnection(connection);
  }
};

export const markAllAsRead = async (req, res, next) => {
  const { userId } = req.body;
  let connection = null;
  try {
    connection = await getConnection();

    await executeQuery(
      `UPDATE tbl_notificaciones 
       SET not_visto = 1, 
           not_fec_visto = CURRENT_TIMESTAMP, 
           not_fec_act = CURRENT_TIMESTAMP 
       WHERE usu_id = ? AND not_visto = 0`,
      [userId],
      connection
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  } finally {
    releaseConnection(connection);
  }
};

export const markAsRead = async (req, res, next) => {
  const { id } = req.params;
  let connection = null;
  try {
    connection = await getConnection();

    await executeQuery(
      `UPDATE tbl_notificaciones 
       SET not_visto = 1, 
           not_fec_visto = CURRENT_TIMESTAMP, 
           not_fec_act = CURRENT_TIMESTAMP 
       WHERE not_id = ?`,
      [id],
      connection
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  } finally {
    releaseConnection(connection);
  }
};

export const insertNotification = async ({
  userId,
  prioridad,
  titulo,
  mensaje,
  tipo = "informativa",
  modulo = null,
  accion = null,
  data = null,
  connection,
}) => {
  const io = getIO();

  const result = await executeQuery(
    `INSERT INTO tbl_notificaciones 
      (usu_id, not_prioridad, not_titulo, not_mensaje, not_tipo, not_modulo, not_accion, not_data) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      prioridad,
      titulo,
      mensaje,
      tipo,
      modulo,
      accion,
      data ? JSON.stringify(data) : null,
    ],
    connection
  );

  const notification = {
    not_id: result.insertId,
    usu_id: userId,
    not_prioridad: prioridad,
    not_titulo: titulo,
    not_mensaje: mensaje,
    not_tipo: tipo,
    not_modulo: modulo,
    not_accion: accion,
    not_data: data,
    not_fec_env: new Date(),
    not_visto: 0,
  };

  console.log(`Nueva notificación enviada a usuario ${userId}:`, notification, "result: ", result);
  
  await connection.commit();
  io.emit("newNotification", notification);
};
