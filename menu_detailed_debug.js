// SCRIPT DE DEBUGGING ESPECÍFICO PARA EL MENÚ
// Ejecutar después del login cuando ya veas "Tablero" en el menú

console.log("🔧 DEBUGGING ESPECÍFICO DEL MENÚ DEL TABLERO...");
console.log("===============================================");

// 1. Interceptar React Router
console.log("\n1️⃣ Configurando interceptación de React Router...");
const originalPushState = window.history.pushState;
window.history.pushState = function(state, title, url) {
    console.log("🔄 Navegación interceptada:", url);
    return originalPushState.apply(this, arguments);
};

// 2. Buscar todos los NavLinks
console.log("\n2️⃣ Analizando NavLinks...");
const navLinks = document.querySelectorAll('a[href*="tablero"]');
console.log("NavLinks del tablero encontrados:", navLinks.length);

navLinks.forEach((link, index) => {
    console.log(`NavLink ${index + 1}:`, {
        href: link.href,
        text: link.textContent.trim(),
        classes: link.className,
        onclick: link.onclick ? 'Tiene función' : 'Sin función'
    });
    
    // Resaltar el link
    link.style.border = "2px solid orange";
    link.style.backgroundColor = "lightyellow";
});

// 3. Verificar la estructura del menú React
console.log("\n3️⃣ Verificando estructura del menú...");
// Buscar el componente del menú
const menuContainer = document.querySelector('.layout-menu-container, .layout-menu');
if (menuContainer) {
    console.log("✅ Contenedor del menú encontrado:", menuContainer);
    
    // Buscar elementos con texto "Tablero"
    const tableroElements = Array.from(menuContainer.querySelectorAll('*'))
        .filter(el => el.textContent.trim().toLowerCase() === 'tablero');
    
    console.log("Elementos 'Tablero' en el menú:", tableroElements.length);
    tableroElements.forEach((el, index) => {
        console.log(`Elemento ${index + 1}:`, {
            tag: el.tagName,
            classes: el.className,
            parent: el.parentElement?.tagName,
            parentClasses: el.parentElement?.className
        });
    });
}

// 4. Crear función de navegación forzada
console.log("\n4️⃣ Creando funciones de navegación...");

window.forceNavigateToTablero = function() {
    console.log("🚀 Navegación forzada al tablero...");
    
    // Método 1: Usar React Router programáticamente
    try {
        if (window.ReactRouterDOM && window.ReactRouterDOM.useHistory) {
            console.log("Intentando con React Router...");
            // Esta es una aproximación, puede no funcionar en todos los casos
        }
    } catch (e) {
        console.log("React Router no accesible directamente");
    }
    
    // Método 2: Cambiar la URL y forzar re-render
    window.history.pushState({}, '', '/tablero/board');
    window.dispatchEvent(new PopStateEvent('popstate'));
    
    console.log("Nueva URL:", window.location.pathname);
};

window.clickAllTableroLinks = function() {
    console.log("🖱️ Haciendo click en todos los links del tablero...");
    const links = document.querySelectorAll('a[href*="tablero"]');
    
    if (links.length === 0) {
        console.log("❌ No se encontraron links del tablero");
        return;
    }
    
    links.forEach((link, index) => {
        console.log(`Haciendo click en link ${index + 1}:`, link.href);
        setTimeout(() => {
            link.click();
        }, index * 500); // Esperar 500ms entre clicks
    });
};

// 5. Analizar el estado actual de React Router
console.log("\n5️⃣ Analizando React Router...");
setTimeout(() => {
    console.log("URL después de cargar:", window.location.href);
    console.log("Pathname:", window.location.pathname);
    
    // Verificar si React Router está funcionando
    const routerElements = document.querySelectorAll('[data-reactroot] *');
    const hasRouter = Array.from(routerElements).some(el => 
        el.className && (el.className.includes('router') || el.className.includes('Router'))
    );
    
    if (hasRouter) {
        console.log("✅ React Router parece estar activo");
    } else {
        console.log("⚠️ React Router podría no estar funcionando correctamente");
    }
}, 1000);

// 6. Instrucciones finales
console.log("\n📋 FUNCIONES DISPONIBLES:");
console.log("========================");
console.log("• forceNavigateToTablero() - Navegación forzada");
console.log("• clickAllTableroLinks() - Click en todos los links");
console.log("");
console.log("🎯 RECOMENDACIÓN:");
console.log("1. Primero verifica si hay links resaltados en naranja");
console.log("2. Intenta hacer click manual en el enlace resaltado");
console.log("3. Si no funciona: forceNavigateToTablero()");
console.log("4. Si no funciona: clickAllTableroLinks()");

console.log("===============================================");
console.log("🚀 Debugging configurado. ¡Examina los resultados!");
