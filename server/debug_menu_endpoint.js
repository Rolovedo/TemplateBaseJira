// Endpoint temporal para debug del menú
// Agregar al final de app.controller.js

export const debugMenuController = async (req, res, next) => {
  let connection = null;
  try {
    connection = await getConnection();
    
    // Simular el usuario admin (id=1, perfil=1)
    const per = 1; // Perfil admin
    const idu = 1; // Usuario admin
    
    const datos = {
      padres: [],
      hijos: [],
      debug: {
        perfil: per,
        usuario: idu,
        timestamp: new Date().toISOString()
      }
    };

    // Obtener ventanas del usuario
    const rowsv = await executeQuery(
      `SELECT ven_id FROM tbl_usuarios_ventanas WHERE usu_id = ?`,
      [idu],
      connection
    );

    const ven = rowsv.map((v) => v.ven_id).join(",");
    datos.debug.ventanasUsuario = rowsv;

    const wh = ven ? `AND v.ven_id IN(${ven})` : ``;

    // Obtener ventanas padre
    const rows = await executeQuery(
      `SELECT v.ven_id id, v.ven_descripcion, v.ven_url toa, v.ven_icono icon, v.ven_orden, v.ven_nombre label FROM tbl_ventanas v JOIN tbl_perfil_ventanas p ON v.ven_id = p.ven_id WHERE ven_padre = 0 AND p.prf_id = ? ${wh} ORDER BY v.ven_orden`,
      [per],
      connection
    );

    datos.padres = rows;

    // Obtener ventanas hijo
    const rows2 = await executeQuery(
      `SELECT v.ven_id, v.ven_descripcion, v.ven_padre padre, v.ven_url toa, v.ven_icono icon, v.ven_orden, v.ven_nombre label FROM tbl_ventanas v JOIN tbl_perfil_ventanas p ON v.ven_id = p.ven_id WHERE ven_padre != 0 AND p.prf_id = ? ${wh} ORDER BY v.ven_orden`,
      [per],
      connection
    );

    datos.hijos = rows2;

    return res.json(datos);
  } catch (err) {
    next(err);
  } finally {
    if (connection) releaseConnection(connection);
  }
};
