import mysql from 'mysql2/promise';

async function checkTableroConfiguration() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'tablero_pavas'
    });

    console.log('🔍 Verificando configuración del tablero...\n');
    
    // 1. Verificar ventanas del tablero
    const [ventanas] = await connection.execute(`
      SELECT ven_id, ven_nombre, ven_descripcion, ven_url, ven_ruta, ven_padre, ven_orden 
      FROM tbl_ventanas 
      WHERE ven_nombre LIKE '%tablero%' OR ven_descripcion LIKE '%tablero%'
      ORDER BY ven_orden
    `);
    
    console.log('📋 Ventanas del tablero encontradas:');
    if (ventanas.length === 0) {
      console.log('❌ NO se encontraron ventanas del tablero');
    } else {
      ventanas.forEach(v => {
        console.log(`  🔸 ID: ${v.ven_id}`);
        console.log(`     Nombre: ${v.ven_nombre}`);
        console.log(`     Descripción: ${v.ven_descripcion}`);
        console.log(`     URL: ${v.ven_url}`);
        console.log(`     Ruta: ${v.ven_ruta}`);
        console.log(`     Padre: ${v.ven_padre}`);
        console.log(`     Orden: ${v.ven_orden}`);
        console.log('');
      });
    }
    
    // 2. Verificar permisos del perfil admin (id=1)
    const [permisosPerfil] = await connection.execute(`
      SELECT v.ven_id, v.ven_nombre, v.ven_descripcion, v.ven_url
      FROM tbl_ventanas v
      JOIN tbl_perfil_ventanas pv ON v.ven_id = pv.ven_id
      WHERE pv.prf_id = 1 AND (v.ven_nombre LIKE '%tablero%' OR v.ven_descripcion LIKE '%tablero%')
      ORDER BY v.ven_orden
    `);
    
    console.log('🔐 Permisos de perfil admin (ID=1) para tablero:');
    if (permisosPerfil.length === 0) {
      console.log('❌ El perfil admin NO tiene permisos para tablero');
    } else {
      permisosPerfil.forEach(p => {
        console.log(`  ✅ ${p.ven_nombre}: ${p.ven_descripcion} (${p.ven_url})`);
      });
    }
    console.log('');
    
    // 3. Verificar permisos del usuario admin (id=1)
    const [permisosUsuario] = await connection.execute(`
      SELECT v.ven_id, v.ven_nombre, v.ven_descripcion, v.ven_url
      FROM tbl_ventanas v
      JOIN tbl_usuarios_ventanas uv ON v.ven_id = uv.ven_id
      WHERE uv.usu_id = 1 AND (v.ven_nombre LIKE '%tablero%' OR v.ven_descripcion LIKE '%tablero%')
      ORDER BY v.ven_orden
    `);
    
    console.log('👤 Permisos de usuario admin (ID=1) para tablero:');
    if (permisosUsuario.length === 0) {
      console.log('❌ El usuario admin NO tiene permisos para tablero');
    } else {
      permisosUsuario.forEach(p => {
        console.log(`  ✅ ${p.ven_nombre}: ${p.ven_descripcion} (${p.ven_url})`);
      });
    }
    console.log('');
    
    // 4. Simular consulta del menú
    console.log('🌐 Simulando consulta del menú...');
    
    // Obtener ventanas del usuario
    const [ventanasUsuario] = await connection.execute(`
      SELECT ven_id FROM tbl_usuarios_ventanas WHERE usu_id = 1
    `);
    
    const ventanasIds = ventanasUsuario.map(v => v.ven_id).join(',');
    const whereClause = ventanasIds ? `AND v.ven_id IN(${ventanasIds})` : '';
    
    // Obtener menú padre
    const [menuPadre] = await connection.execute(`
      SELECT v.ven_id id, v.ven_descripcion, v.ven_url toa, v.ven_icono icon, v.ven_orden, v.ven_nombre label 
      FROM tbl_ventanas v 
      JOIN tbl_perfil_ventanas p ON v.ven_id = p.ven_id 
      WHERE ven_padre = 0 AND p.prf_id = 1 ${whereClause} 
      ORDER BY v.ven_orden
    `);
    
    console.log('📋 Menú padre que se devolvería:');
    menuPadre.forEach(item => {
      console.log(`  🔸 ${item.label} (${item.toa})`);
      if (item.label && item.label.toLowerCase().includes('tablero')) {
        console.log('    ✅ ¡TABLERO ENCONTRADO EN EL MENÚ!');
      }
    });
    
    await connection.end();
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkTableroConfiguration();
