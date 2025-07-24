// SCRIPT PARA ACCEDER A ELEMENTOS HIJOS DEL TABLERO
// El "Tablero" es una categoría padre - necesitamos sus hijos

console.log("🎯 BUSCANDO ELEMENTOS HIJOS DEL TABLERO...");
console.log("==========================================");

// 1. Encontrar la categoría Tablero y sus elementos hijos
const menuContainer = document.querySelector('.layout-menu-container');
const tableroCategories = Array.from(menuContainer.querySelectorAll('.layout-menuitem-category'))
    .filter(category => {
        const text = category.textContent.toLowerCase();
        return text.includes('tablero');
    });

console.log("📋 Categorías de Tablero encontradas:", tableroCategories.length);

tableroCategories.forEach((category, index) => {
    console.log(`\n📁 Categoría ${index + 1}:`);
    console.log("Texto completo:", category.textContent);
    
    // Buscar submenu
    const submenu = category.querySelector('.layout-submenu-fixed');
    if (submenu) {
        console.log("✅ Submenu encontrado");
        
        // Buscar todos los links en el submenu
        const links = submenu.querySelectorAll('a');
        console.log(`🔗 Links encontrados en submenu: ${links.length}`);
        
        links.forEach((link, linkIndex) => {
            console.log(`  Link ${linkIndex + 1}:`, {
                href: link.href,
                text: link.textContent.trim(),
                classes: link.className
            });
            
            // Resaltar los links
            link.style.border = "3px solid lime";
            link.style.backgroundColor = "lightgreen";
            link.style.padding = "5px";
        });
        
        // Crear funciones específicas para cada link
        links.forEach((link, linkIndex) => {
            const functionName = `clickTableroLink${linkIndex + 1}`;
            window[functionName] = function() {
                console.log(`🖱️ Haciendo click en: ${link.textContent.trim()}`);
                link.click();
                setTimeout(() => {
                    console.log("Nueva URL:", window.location.href);
                }, 500);
            };
            console.log(`  📱 Función creada: ${functionName}()`);
        });
        
    } else {
        console.log("❌ No se encontró submenu");
    }
});

// 2. Buscar TODOS los links que podrían estar relacionados con tablero
console.log("\n🔍 Buscando TODOS los posibles links de tablero...");
const allLinks = document.querySelectorAll('a');
const tableroLinks = Array.from(allLinks).filter(link => {
    const href = link.href || '';
    const text = link.textContent || '';
    return href.includes('tablero') || text.toLowerCase().includes('tablero') || href.includes('board');
});

console.log(`🔗 Links relacionados con tablero: ${tableroLinks.length}`);
tableroLinks.forEach((link, index) => {
    console.log(`Link ${index + 1}:`, {
        href: link.href,
        text: link.textContent.trim(),
        visible: link.offsetParent !== null
    });
    
    // Resaltar con color diferente
    link.style.border = "3px solid red";
    link.style.backgroundColor = "yellow";
    
    // Crear función para este link
    const functionName = `clickLink${index + 1}`;
    window[functionName] = function() {
        console.log(`🖱️ Haciendo click en: ${link.textContent.trim()}`);
        link.click();
        setTimeout(() => {
            console.log("Nueva URL:", window.location.href);
        }, 500);
    };
});

// 3. Función para expandir/colapsar el menú del tablero
window.expandTableroMenu = function() {
    console.log("📂 Intentando expandir menú del tablero...");
    
    tableroCategories.forEach(category => {
        // Buscar si hay elementos clickeables para expandir
        const expandable = category.querySelector('[class*="expand"], [class*="toggle"], [class*="arrow"]');
        if (expandable) {
            console.log("🎯 Elemento expandible encontrado, haciendo click...");
            expandable.click();
        }
        
        // También intentar hacer click en el título de la categoría
        const title = category.querySelector('.layout-menuitem-root-text');
        if (title) {
            console.log("🎯 Haciendo click en título de categoría...");
            title.click();
        }
    });
};

// 4. Función de navegación directa mejorada con hash routing
window.goToTableroBoard = function() {
    console.log("🚀 Navegación directa al tablero con hash routing...");
    
    // Para hash routing, la URL debe ser #/tablero/board
    const newHash = '#/tablero/board';
    
    // Cambiar el hash
    window.location.hash = newHash;
    
    console.log("Hash cambiado a:", window.location.hash);
    console.log("URL completa:", window.location.href);
    
    // Disparar evento de cambio de hash
    window.dispatchEvent(new HashChangeEvent('hashchange'));
};

// 5. Instrucciones finales
console.log("\n📋 FUNCIONES DISPONIBLES:");
console.log("========================");
console.log("• expandTableroMenu() - Expandir menú del tablero");
console.log("• goToTableroBoard() - Navegación directa con hash");

// Mostrar funciones dinámicas creadas
const dynamicFunctions = Object.keys(window).filter(key => 
    key.startsWith('clickTableroLink') || key.startsWith('clickLink')
);
if (dynamicFunctions.length > 0) {
    console.log("• Funciones específicas de links:");
    dynamicFunctions.forEach(fn => console.log(`  - ${fn}()`));
}

console.log("\n🎯 ACCIONES RECOMENDADAS:");
console.log("1. ✅ Los links están resaltados (verde = submenu, rojo/amarillo = todos)");
console.log("2. 🖱️ Haz click manual en cualquier link resaltado");
console.log("3. 📂 Si no ves links: expandTableroMenu()");
console.log("4. 🚀 Navegación directa: goToTableroBoard()");
console.log("5. 📱 O usa las funciones específicas listadas arriba");

console.log("==========================================");
console.log("🚀 ¡Revisa los elementos resaltados en la página!");
