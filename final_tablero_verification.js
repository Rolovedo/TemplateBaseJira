// SCRIPT DE VERIFICACIÓN FINAL DEL TABLERO
// Ejecutar en la consola del navegador (F12 -> Console)

console.log("🔍 INICIANDO VERIFICACIÓN COMPLETA DEL TABLERO...");
console.log("================================================");

// 1. Verificar si estamos en la aplicación correcta
console.log("\n1️⃣ Verificando contexto de la aplicación:");
console.log("URL actual:", window.location.href);
console.log("Dominio:", window.location.hostname);
console.log("Puerto:", window.location.port);

// 2. Verificar elementos del menú
console.log("\n2️⃣ Buscando elementos del menú:");
const menuElements = document.querySelectorAll('[class*="menu"], [class*="nav"], [class*="sidebar"], a, button, .p-menuitem');
let tableroMenuFound = false;

menuElements.forEach((element, index) => {
    const text = element.textContent || element.innerText || '';
    if (text.toLowerCase().includes('tablero')) {
        console.log(`✅ TABLERO ENCONTRADO EN MENÚ ${index + 1}:`, element);
        console.log("   Texto:", text);
        console.log("   Clase:", element.className);
        console.log("   Href:", element.href || 'No aplica');
        tableroMenuFound = true;
    }
});

if (!tableroMenuFound) {
    console.log("❌ No se encontró 'Tablero' en elementos del menú visible");
    console.log("🔍 Elementos de menú encontrados:");
    const menuTexts = Array.from(menuElements)
        .map(el => el.textContent?.trim())
        .filter(text => text && text.length > 0)
        .slice(0, 20); // Mostrar solo los primeros 20
    console.log(menuTexts);
}

// 3. Intentar navegación directa
console.log("\n3️⃣ Probando navegación directa al tablero:");
const currentPath = window.location.pathname;
console.log("Ruta actual:", currentPath);

if (currentPath === '/tablero/board') {
    console.log("✅ YA ESTÁS EN EL TABLERO!");
    console.log("🎯 Si no ves contenido, es un problema de renderizado");
} else {
    console.log("📍 Intentando navegar al tablero...");
    
    // Función para navegar
    window.goToTablero = function() {
        console.log("🚀 Navegando a /tablero/board...");
        window.location.href = '/tablero/board';
    };
    
    console.log("💡 Ejecuta: goToTablero() para ir al tablero");
}

// 4. Verificar componentes React
console.log("\n4️⃣ Verificando componentes React:");
const reactRoot = document.querySelector('#root');
if (reactRoot) {
    console.log("✅ Root de React encontrado");
    const reactFiberKey = Object.keys(reactRoot).find(key => 
        key.startsWith('__reactInternalInstance') || key.startsWith('_reactInternalFiber')
    );
    
    if (reactFiberKey) {
        console.log("✅ React Fiber detectado");
    }
} else {
    console.log("❌ No se encontró el root de React");
}

// 5. Verificar errores en consola
console.log("\n5️⃣ Estado de la consola:");
const errors = document.querySelectorAll('.console-error, [class*="error"]');
if (errors.length > 0) {
    console.log("⚠️ Se encontraron", errors.length, "elementos de error");
} else {
    console.log("✅ No se detectaron errores visibles");
}

// 6. Instrucciones finales
console.log("\n📋 INSTRUCCIONES FINALES:");
console.log("========================");
console.log("1. Si NO ves el menú 'Tablero': Limpia la caché del navegador");
console.log("2. Si ves el menú pero no funciona: Revisa la consola por errores");
console.log("3. Si quieres ir directamente: Ejecuta goToTablero()");
console.log("4. Si nada funciona: Usa modo incógnito (Ctrl+Shift+N)");

console.log("\n🎯 RESULTADO DE LA VERIFICACIÓN:");
if (tableroMenuFound) {
    console.log("✅ TABLERO ENCONTRADO EN EL MENÚ - Haz clic en él");
} else if (currentPath === '/tablero/board') {
    console.log("✅ YA ESTÁS EN EL TABLERO - Debería estar visible");
} else {
    console.log("❌ TABLERO NO VISIBLE - Intenta limpiar caché o modo incógnito");
}

console.log("================================================");
console.log("🚀 Verificación completada. ¡Revisa los resultados arriba!");
