// SCRIPT PARA VERIFICAR EL MENÚ DESPUÉS DEL LOGIN
// Ejecutar en la consola después de hacer login exitoso

console.log("🔍 VERIFICANDO MENÚ DESPUÉS DEL LOGIN...");
console.log("=======================================");

// 1. Verificar si ya hiciste login
const token = document.cookie.split(';').find(c => c.trim().startsWith('tokenPONTO='));
if (token) {
    console.log("✅ Token de sesión encontrado");
} else {
    console.log("❌ No hay token de sesión - debes hacer login primero");
    return;
}

// 2. Esperar a que el menú se cargue
setTimeout(() => {
    console.log("\n🔍 Buscando el menú 'Tablero'...");
    
    // Buscar en todos los elementos de texto
    const allElements = document.querySelectorAll('*');
    let tableroFound = false;
    
    allElements.forEach(element => {
        const text = element.textContent || element.innerText || '';
        if (text.trim().toLowerCase() === 'tablero') {
            console.log("✅ ¡TABLERO ENCONTRADO!", element);
            console.log("   Elemento:", element.tagName);
            console.log("   Clases:", element.className);
            console.log("   Es clickeable:", element.onclick ? "Sí" : "No");
            console.log("   Href:", element.href || "No aplica");
            tableroFound = true;
            
            // Resaltar el elemento
            element.style.border = "3px solid red";
            element.style.backgroundColor = "yellow";
            
            // Función para hacer clic
            window.clickTablero = () => {
                element.click();
                console.log("🖱️ Click realizado en Tablero");
            };
        }
    });
    
    if (tableroFound) {
        console.log("\n🎯 ¡TABLERO ENCONTRADO! Opciones:");
        console.log("1. Debería estar resaltado en amarillo con borde rojo");
        console.log("2. Haz clic en él manualmente");
        console.log("3. O ejecuta: clickTablero()");
    } else {
        console.log("\n❌ Tablero NO encontrado. Elementos del menú disponibles:");
        
        // Listar elementos del menú
        const menuItems = Array.from(allElements)
            .filter(el => {
                const text = (el.textContent || '').trim();
                return text.length > 0 && text.length < 50 && 
                       (el.tagName === 'A' || el.tagName === 'BUTTON' || 
                        el.className.includes('menu') || el.className.includes('nav'));
            })
            .map(el => (el.textContent || '').trim())
            .filter((text, index, arr) => arr.indexOf(text) === index) // eliminar duplicados
            .slice(0, 15);
            
        console.log(menuItems);
        
        console.log("\n🔧 Si no aparece Tablero, intenta:");
        console.log("1. Recargar la página (F5)");
        console.log("2. Borrar caché (Ctrl+Shift+R)");
        console.log("3. Cerrar sesión y volver a entrar");
    }
}, 2000); // Esperar 2 segundos para que cargue el menú

console.log("⏳ Esperando 2 segundos para que cargue el menú...");
