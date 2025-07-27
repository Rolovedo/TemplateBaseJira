import {
  getConnection,
  releaseConnection,
  executeQuery,
} from "../../../common/configs/db.config.js";
import { hashPassword } from "../../../common/utils/funciones.js";
import moment from "moment";

export const getUsersByPermision = async (req, res, next) => {
  const { perId } = req.body;
  const permisos =
    typeof perId === "string"
      ? perId.split(",").map(Number)
      : Array.isArray(perId)
      ? perId.map(Number)
      : [Number(perId)];
  let connection = null;
  try {
    connection = await getConnection();

    const results = await executeQuery(
      `SELECT 
      CONCAT(IFNULL(u.usu_nombre,"")," ",IFNULL(u.usu_apellido,"")) AS nombre,
      u.usu_id AS id,
      u.usu_valor_hora AS valorHora,
      GROUP_CONCAT(pu.per_id) AS permisos
    FROM tbl_permisos_usuarios pu
    JOIN tbl_usuarios u ON u.usu_id = pu.usu_id
    WHERE per_id in (${permisos.join(",")}) and u.est_id != 3 
    GROUP BY u.usu_id
    ORDER BY nombre ASC`,
      [],
      connection
    );
    res.status(200).json(results);
  } catch (err) {
    next(err);
  } finally {
    releaseConnection(connection);
  }
};

export const getPatients = async (req, res, next) => {
  let connection = null;
  try {
    connection = await getConnection();

    const results = await executeQuery(
      `SELECT 
      CONCAT(IFNULL(u.usu_nombre,"")," ",IFNULL(u.usu_apellido,"")) AS nombre,
      u.usu_id AS id,
      u.usu_valor_hora AS valorHora,
    FROM tbl_permisos_usuarios pu
    JOIN tbl_usuarios u ON u.usu_id = pu.usu_id
    WHERE prf_id = 3 and u.est_id != 3 
    GROUP BY u.usu_id
    ORDER BY nombre ASC`,
      [],
      connection
    );
    res.status(200).json(results);
  } catch (err) {
    next(err);
  } finally {
    releaseConnection(connection);
  }
};
export const getInstructors = async (req, res, next) => {
  // const { perId } = req.body;
  // const permisos =
  //   typeof perId === "string"
  //     ? perId.split(",").map(Number)
  //     : Array.isArray(perId)
  //     ? perId.map(Number)
  //     : [Number(perId)];
  let connection = null;
  try {
    connection = await getConnection();

    const results = await executeQuery(
      `SELECT 
      CONCAT(IFNULL(u.usu_nombre,"")," ",IFNULL(u.usu_apellido,"")) AS nombre,
      u.usu_id AS id,
      u.usu_valor_hora AS valorHora,
      u.usu_documento As documento,
      u.usu_correo AS correo,
      u.usu_foto AS foto
    FROM tbl_usuarios u 
    WHERE u.usu_instructor = 1 and u.est_id != 3 
    GROUP BY u.usu_id
    ORDER BY nombre ASC`,
      [],
      connection
    );
    res.status(200).json(results);
  } catch (err) {
    next(err);
  } finally {
    releaseConnection(connection);
  }
};

export const getUsers = async (req, res, next) => {
  const { prfId } = req.query;
  let connection = null;

  try {
    connection = await getConnection();

    const filtros = [`u.est_id != 3`];
    const params = [];

    if (prfId) {
      filtros.push(`u.prf_id = ?`);
      params.push(prfId);
    }

    const whereClause = filtros.length ? `WHERE ${filtros.join(" AND ")}` : "";

    const results = await executeQuery(
      `SELECT 
         u.usu_id AS id, 
         CONCAT(IFNULL(u.usu_nombre, ''), ' ', IFNULL(u.usu_apellido, '')) AS nombre,
         u.usu_correo AS correo,
         u.usu_foto AS foto,
         u.usu_documento AS documento,
         u.usu_telefono AS telefono,
         u.usu_agenda AS agenda,
         u.usu_instructor AS instructor,
         u.usu_requiere_confirmacion AS requiereConfirmacion,
         u.est_id AS estado,
         p.prf_nombre AS perfil
       FROM tbl_usuarios u
       JOIN tbl_perfil p ON p.prf_id = u.prf_id
       ${whereClause}
       ORDER BY nombre ASC`,
      params,
      connection
    );

    res.status(200).json(results);
  } catch (err) {
    next(err);
  } finally {
    if (connection) releaseConnection(connection);
  }
};

export const paginationUsersController = async (req, res, next) => {
  const {
    idusuario,
    prfId,
    nombre,
    apellido,
    correo,
    telefono,
    documento,
    usuario,
    estado,
    rows,
    first,
    sortField,
    sortOrder,
  } = req.body;

  const order = sortOrder === 1 ? "ASC" : "DESC";
  let connection = null;
  try {
    connection = await getConnection();

    const from = `
        FROM tbl_usuarios u
        JOIN tbl_perfil p ON u.prf_id = p.prf_id and p.est_id = 1
        JOIN tbl_estados_usuario e ON u.est_id = e.est_id
    `;

    const whereConditions = [];

    if (idusuario != 1) {
      whereConditions.push(`u.usu_id != 1`);
    }

    if (prfId) {
      whereConditions.push(`(u.prf_id = ${prfId})`);
    }

    if (nombre) {
      whereConditions.push(
        `(u.usu_nombre LIKE REPLACE('%${nombre}%', ' ', '%'))`
      );
    }

    if (apellido) {
      whereConditions.push(
        `(u.usu_apellido LIKE REPLACE('%${apellido}%', ' ', '%'))`
      );
    }

    if (correo) {
      whereConditions.push(
        `(u.usu_correo LIKE REPLACE('%${correo}%', ' ', '%'))`
      );
    }
    if (telefono) {
      whereConditions.push(
        `(u.usu_telefono LIKE REPLACE('%${telefono}%', ' ', '%'))`
      );
    }

    if (documento) {
      whereConditions.push(
        `(u.usu_documento LIKE REPLACE('%${documento}%', ' ', '%'))`
      );
    }

    if (usuario) {
      whereConditions.push(
        `(u.usu_usuario LIKE REPLACE('%${usuario}%', ' ', '%'))`
      );
    }

    if (estado) {
      whereConditions.push(`(u.est_id = ${estado})`);
    }

    whereConditions.push(`u.est_id != 3`);

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    const mainQuery = `
        SELECT
            u.usu_id usuId,
            u.usu_foto usuFoto,
            u.usu_nombre nombre,
            u.usu_apellido apellido,
            u.usu_documento documento,
            u.usu_usuario usuario,
            u.usu_correo correo,
            u.usu_telefono telefono,
            p.prf_nombre nomperfil,
            e.est_nombre nomestado,
            u.usu_acceso acceso,
            u.usu_agenda agenda,
            u.usu_instructor instructor,
            u.usu_requiere_confirmacion requiere_confirmacion,
            u.usu_fec_act fecact,
            u.usu_usu_act usuact,
            u.est_id estid,
            u.prf_id perfil,
            u.usu_valor_hora valorHora,
            u.usu_cambio cambioclave,
            (
              SELECT GROUP_CONCAT(ven_id)
              FROM tbl_usuarios_ventanas uv
              WHERE uv.usu_id = u.usu_id
            ) AS usuventanas
        ${from} ${whereClause}
        ORDER BY ${sortField} ${order}
        LIMIT ${rows} OFFSET ${first}
    `;

    const countQuery = `
        SELECT COUNT(DISTINCT u.usu_id) tot
        ${from} ${whereClause}
    `;

    const results = await executeQuery(mainQuery, [], connection);
    const rowsc = await executeQuery(countQuery, [], connection);

    const resultados = {
      results: results,
      total: rowsc[0].tot,
    };

    return res.json(resultados);
  } catch (err) {
    next(err);
  } finally {
    releaseConnection(connection);
  }
};

export const countUsersController = async (req, res, next) => {
  let connection = null;
  try {
    connection = await getConnection();

    const { idusuario } = req.query;
    const wh = +idusuario !== 1 ? "AND p.prf_id != 1" : "";

    const resultQuery = await executeQuery(
      `SELECT COUNT(usu_id) cant, p.prf_nombre nombre, p.prf_id prfId FROM tbl_usuarios u JOIN tbl_perfil p ON p.prf_id = u.prf_id WHERE u.est_id != 3  and p.est_id = 1 ${wh} GROUP BY prfId, nombre ORDER BY p.prf_nombre`,
      [],
      connection
    );

    return res.status(200).json(resultQuery);
  } catch (err) {
    next(err);
  } finally {
    releaseConnection(connection);
  }
};

async function checkIfUserExists({
  documento,
  correo,
  usuario,
  usuId,
  connection,
}) {
  // Preparamos los valores para la consulta
  const parameters = [];
  let conditions = [];

  if (documento) {
    conditions.push("usu_documento = ?");
    parameters.push(`'${documento}'`);
  }
  if (correo) {
    correo = correo.replace(/ /g, "%");
    conditions.push("usu_correo = ?");
    parameters.push(`'${correo}'`);
  }
  if (usuario) {
    usuario = usuario.replace(/ /g, "%");
    conditions.push("usu_usuario = ?");
    parameters.push(`'${usuario}'`);
  }

  // Solo agregamos la cláusula WHERE si hay condiciones a evaluar
  let query = `
      SELECT usu_id 
      FROM tbl_usuarios 
      WHERE est_id != 3
      ${conditions.length ? "AND (" + conditions.join(" OR ") + ")" : ""}
      ${usuId > 0 ? ` AND usu_id != ${usuId}` : ""}
      LIMIT 1`;

  const existingUser = await executeQuery(query, parameters, connection);
  return existingUser;
}

export const saveUserController = async (req, res, next) => {
  let connection = null;
  try {
    connection = await getConnection();
    await connection.beginTransaction();

    const {
      usuId,
      usuFoto = null,
      perfil,
      nombre,
      apellido,
      documento = null,
      usuario = null,
      correo = null,
      telefono = null,
      clave = null,
      acceso,
      agenda,
      instructor,
      requiere_confirmacion,
      estid: estado,
      idusuario,
      usuarioact,
      usuventanas = null,
      cambioclave = 0,
      valorHora = null,
      ProfileMode = false,
      campo = null,
      value = null,
    } = req.body;

    if (ProfileMode) {
      // Lógica para el modo de perfil
      if (!campo) return;
      const response = await executeQuery(
        `UPDATE tbl_usuarios 
         SET ${campo} = ?
         WHERE usu_id = ?`,
        [value === "null" ? null : value, Number(usuId)],
        connection
      );
      await connection.commit();
      return res.status(200).json({
        message:
          "Modo perfil activado, Se actualizaron los cambios correctamente...",
      });
    }
    const existingUser = await checkIfUserExists({
      documento,
      correo,
      usuario,
      usuId,
      connection,
    });

    if (existingUser.length > 0) {
      const error = new Error(
        "Ya existe un usuario con el documento, correo o usuario ingresado. Verificar"
      );
      error.status = 400; // Código HTTP 400: Bad Request
      throw error;
    }

    if (usuId > 0) {
      // Actualizar usuario existente
      await executeQuery(
        `UPDATE tbl_usuarios 
         SET usu_foto = ?, usu_nombre = ?, usu_apellido = ?, usu_documento = ?, 
             usu_usuario = ?, usu_correo = ?, usu_telefono = ?, prf_id = ?, est_id = ?, usu_valor_hora = ?,
             usu_acceso = ?, usu_agenda = ?, usu_instructor = ?, usu_requiere_confirmacion = ?, usu_cambio = ?, 
             usu_usu_act = ? 
         WHERE usu_id = ?`,
        [
          usuFoto === "null" ? null : usuFoto,
          nombre,
          apellido,
          documento === "null" ? null : documento,
          usuario === "null" ? null : usuario,
          correo === "null" ? null : correo,
          telefono === "null" ? null : telefono,
          perfil || null,
          estado,
          valorHora,
          acceso,
          agenda ? 1 : 0,
          Number(instructor) ? 1 : 0,
          requiere_confirmacion ? 1 : 0,
          cambioclave || null,
          usuarioact,
          usuId,
        ],
        connection
      );

      await executeQuery(
        "DELETE FROM tbl_usuarios_ventanas WHERE usu_id = ?",
        [usuId],
        connection
      );

      if (usuventanas && typeof usuventanas === "string") {
        const ventanas = usuventanas
          .split(",")
          .map((v) => parseInt(v.trim()))
          .filter((v) => !isNaN(v));

        for (const venId of ventanas) {
          await executeQuery(
            "INSERT INTO tbl_usuarios_ventanas (usu_id, ven_id) VALUES (?, ?)",
            [usuId, venId],
            connection
          );
        }
      }

      if (clave) {
        // Actualizar la clave del usuario
        const hash = await hashPassword(clave);
        await executeQuery(
          "UPDATE tbl_usuarios SET usu_clave = ? WHERE usu_id = ?",
          [hash, usuId],
          connection
        );
      }

      await connection.commit();

      return res.status(200).json({
        message: "Usuario Actualizado Correctamente",
        usuId: usuId,
      });
    } else {
      // Crear nuevo usuario
      const newUserId = await executeQuery(
        `INSERT INTO tbl_usuarios (usu_foto,
          usu_nombre, usu_apellido, usu_documento, usu_usuario, 
          usu_correo, usu_telefono, usu_clave, prf_id, est_id, usu_valor_hora, usu_acceso,  usu_agenda, usu_instructor, usu_requiere_confirmacion,
           usu_cambio, usu_reg, usu_usu_act
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          usuFoto,
          nombre,
          apellido,
          documento === "null" ? null : documento,
          usuario === "null" ? null : usuario,
          correo === "null" ? null : correo,
          telefono === "null" ? null : telefono.trim() || null,
          clave ? await hashPassword(clave) : null,
          perfil,
          estado,
          valorHora,
          acceso ? 1 : 0,
          agenda ? 1 : 0,
          instructor ? 1 : 0,
          requiere_confirmacion ? 1 : 0,
          cambioclave || null,
          idusuario,
          usuarioact,
        ],
        connection
      );

      if (!newUserId.insertId) {
        const error = new Error("Error al insertar el usuario.");
        error.status = 400;
        throw error;
      }

      if (usuventanas && typeof usuventanas === "string") {
        const ventanas = usuventanas
          .split(",")
          .map((v) => parseInt(v.trim()))
          .filter((v) => !isNaN(v));

        for (const venId of ventanas) {
          await executeQuery(
            "INSERT INTO tbl_usuarios_ventanas (usu_id, ven_id) VALUES (?, ?)",
            [newUserId.insertId, venId],
            connection
          );
        }
      }

      await executeQuery(
        `INSERT INTO tbl_permisos_usuarios (per_id, usu_id) 
         SELECT per_id, ? FROM tbl_permisos_perfil WHERE prf_id = ?`,
        [newUserId.insertId, perfil],
        connection
      );

      await connection.commit();
      return res.status(201).json({
        message: "Usuario Creado Correctamente",
        usuId: newUserId.insertId,
      });
    }
  } catch (err) {
    if (connection) await connection.rollback();
    next(err);
  } finally {
    releaseConnection(connection);
  }
};

export const updateUserPhotoController = async (req, res, next) => {
  const { usuId, usuFoto } = req.body;
  try {
    if (!usuId || !usuFoto) throw new Error("Datos incompletos");

    await executeQuery(
      "UPDATE tbl_usuarios SET usu_foto = ? WHERE usu_id = ?",
      [usuFoto, usuId]
    );

    return res.status(200).json({ message: "Foto actualizada correctamente" });
  } catch (err) {
    next(err);
  }
};

export const deleteUserController = async (req, res, next) => {
  const { usuId, usuario } = req.body;

  if (!usuId || !usuario) {
    const error = new Error(
      "El ID del usuario y el usuario actual son obligatorios"
    );
    error.status = 400;
    return next(error);
  }

  let connection = null;
  try {
    connection = await getConnection();
    await connection.beginTransaction();

    // Actualizar el estado del usuario a 3 (eliminado)
    const result = await executeQuery(
      `UPDATE tbl_usuarios 
       SET est_id = 3, usu_usu_act = ? 
       WHERE usu_id = ?`,
      [usuario, usuId],
      connection
    );

    if (result.affectedRows > 0) {
      await connection.commit();

      return res.status(200).json({
        message: "Usuario Eliminado Correctamente",
      });
    }

    const error = new Error("Usuario no encontrado o no se pudo eliminar");
    error.status = 404;
    throw error;
  } catch (err) {
    if (connection) await connection.rollback();
    next(err);
  } finally {
    releaseConnection(connection);
  }
};

export const saveUserNovedad = async (req, res, next) => {
  const { novId, usuId, tipoNovedad, descripcion, fecha, horaInicio, horaFin } =
    req.body;
  let connection = null;
  try {
    connection = await getConnection();
    // Editar novedad existente
    // Validar y formatear fechas
    let fechaInicio = null;
    let fechaFin = null;
    let horaInicioFormated = horaInicio
      ? moment(horaInicio, "HH:mm:ss").format("HH:mm:ss")
      : null;
    let horaFinFormated = horaFin
      ? moment(horaFin, "HH:mm:ss").format("HH:mm:ss")
      : null;
    if (Array.isArray(fecha) && fecha.length > 0) {
      // Formatear fechas a 'YYYY-MM-DD'
      const fechasFormateadas = fecha
        .map((f) =>
          moment(f).isValid() ? moment(f).format("YYYY-MM-DD") : null
        )
        .filter((f) => f !== null);

      if (fechasFormateadas.length === 2) {
        // Ordenar para que la menor sea inicio y la mayor fin
        fechasFormateadas.sort();
        fechaInicio = fechasFormateadas[0];
        fechaFin = fechasFormateadas[1];
      } else if (fechasFormateadas.length === 1) {
        fechaInicio = fechaFin = fechasFormateadas[0];
      }
    }
    if (novId > 0) {
      await executeQuery(
        `UPDATE tbl_novedades_usuarios 
         SET tnv_id = ?, nov_descripcion = ?, nov_fecha_inicio = ?, nov_fecha_fin = ?, nov_hora_inicio = ?, nov_hora_fin = ?
         WHERE nov_id = ? AND est_id = 1`,
        [
          tipoNovedad,
          descripcion,
          fechaInicio,
          fechaFin,
          horaInicioFormated,
          horaFinFormated,
          novId,
        ],
        connection
      );
      res.status(200).json({ message: "Novedad actualizada", id: novId });
    } else {
      // Crear nueva novedad
      const result = await executeQuery(
        `INSERT INTO tbl_novedades_usuarios 
          (usu_id, tnv_id, nov_descripcion, nov_fecha_inicio, nov_fecha_fin, nov_hora_inicio, nov_hora_fin, est_id)
         VALUES (?, ?, ?, ?, ?, ?,?, 1)`,
        [
          usuId,
          tipoNovedad,
          descripcion,
          fechaInicio,
          fechaFin,
          horaInicioFormated,
          horaFinFormated,
        ],
        connection
      );
      res
        .status(201)
        .json({ message: "Novedad registrada", id: result.insertId });
    }
  } catch (err) {
    next(err);
  } finally {
    releaseConnection(connection);
  }
};

// Eliminar novedad (cambia estado a 3)
export const deleteUserNovedad = async (req, res, next) => {
  const { id } = req.body;
  let connection = null;
  try {
    connection = await getConnection();
    await executeQuery(
      `UPDATE tbl_novedades_usuarios SET est_id = 3 WHERE nov_id = ?`,
      [id],
      connection
    );
    res.status(200).json({ message: "Novedad eliminada" });
  } catch (err) {
    next(err);
  } finally {
    releaseConnection(connection);
  }
};

// Consultar novedades de un usuario
export const getUserNovedades = async (req, res, next) => {
  const { usuId } = req.body;
  let connection = null;
  try {
    connection = await getConnection();
    const novedades = await executeQuery(
      `SELECT nov_id AS id, tnv_id AS tipoNovedad, nov_descripcion AS descripcion, nov_fecha_inicio AS fechaInicio, nov_fecha_fin AS fechaFin, nov_hora_inicio AS horaIncio, nov_hora_fin AS horaFin, est_id AS estado
       FROM tbl_novedades_usuarios
       WHERE usu_id = ? AND est_id = 1
       ORDER BY id DESC`,
      [usuId],
      connection
    );
    res.status(200).json(novedades);
  } catch (err) {
    next(err);
  } finally {
    releaseConnection(connection);
  }
};
