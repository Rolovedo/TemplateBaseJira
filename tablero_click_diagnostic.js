// SCRIPT PARA DIAGNOSTICAR EL PROBLEMA DEL CLICK EN TABLERO
// Ejecutar después del login cuando ya veas "Tablero" en el menú

console.log("🔍 DIAGNOSTICANDO PROBLEMA DEL CLICK EN TABLERO...");
console.log("=================================================");

// 1. Buscar el elemento Tablero específicamente
console.log("\n1️⃣ Localizando elemento 'Tablero'...");
const allElements = document.querySelectorAll('*');
let tableroElement = null;

allElements.forEach(element => {
    const text = (element.textContent || '').trim();
    if (text.toLowerCase() === 'tablero' || text === 'Tablero') {
        console.log("✅ Elemento Tablero encontrado:", element);
        console.log("   Texto:", text);
        console.log("   Tag:", element.tagName);
        console.log("   Clases:", element.className);
        console.log("   ID:", element.id);
        console.log("   Href:", element.href || 'No aplica');
        console.log("   OnClick:", element.onclick ? 'Tiene función' : 'Sin función onClick');
        console.log("   Event Listeners:", getEventListeners ? getEventListeners(element) : 'No disponible');
        
        tableroElement = element;
        
        // Resaltar el elemento
        element.style.border = "3px solid red";
        element.style.backgroundColor = "yellow";
        element.style.padding = "5px";
    }
});

if (!tableroElement) {
    console.log("❌ No se encontró el elemento exacto 'Tablero'");
    return;
}

// 2. Verificar el elemento padre (probablemente un <a> o botón)
console.log("\n2️⃣ Verificando elemento padre...");
let parentElement = tableroElement.parentElement;
let level = 1;

while (parentElement && level <= 3) {
    console.log(`Padre nivel ${level}:`, parentElement);
    console.log("   Tag:", parentElement.tagName);
    console.log("   Clases:", parentElement.className);
    console.log("   Href:", parentElement.href || 'No aplica');
    console.log("   OnClick:", parentElement.onclick ? 'Tiene función' : 'Sin función onClick');
    
    if (parentElement.tagName === 'A' || parentElement.tagName === 'BUTTON') {
        console.log("🎯 Este parece ser el elemento clickeable");
        tableroElement = parentElement;
        
        // Resaltar también el padre
        parentElement.style.border = "5px solid blue";
        break;
    }
    
    parentElement = parentElement.parentElement;
    level++;
}

// 3. Verificar el estado de React Router
console.log("\n3️⃣ Verificando React Router...");
console.log("URL actual:", window.location.href);
console.log("Pathname:", window.location.pathname);

// 4. Intentar diferentes métodos de click
console.log("\n4️⃣ Configurando métodos de click...");

// Método 1: Click directo
window.clickTableroDirecto = function() {
    console.log("🖱️ Método 1: Click directo...");
    tableroElement.click();
    setTimeout(() => {
        console.log("Nueva URL:", window.location.href);
    }, 500);
};

// Método 2: Dispatch click event
window.clickTableroEvent = function() {
    console.log("🖱️ Método 2: Dispatch click event...");
    const event = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
    });
    tableroElement.dispatchEvent(event);
    setTimeout(() => {
        console.log("Nueva URL:", window.location.href);
    }, 500);
};

// Método 3: Navegación directa
window.navigateToTablero = function() {
    console.log("🖱️ Método 3: Navegación directa...");
    window.history.pushState({}, '', '/tablero/board');
    window.location.href = '/tablero/board';
};

// Método 4: Buscar link específico
window.findAndClickTableroLink = function() {
    console.log("🖱️ Método 4: Buscar link específico...");
    const links = document.querySelectorAll('a[href*="tablero"], a[href*="/tablero/board"]');
    console.log("Links encontrados:", links);
    
    if (links.length > 0) {
        console.log("Haciendo click en el primer link encontrado...");
        links[0].click();
        setTimeout(() => {
            console.log("Nueva URL:", window.location.href);
        }, 500);
    } else {
        console.log("❌ No se encontraron links al tablero");
    }
};

// 5. Verificar errores de JavaScript
console.log("\n5️⃣ Verificando errores...");
window.addEventListener('error', (e) => {
    console.log("❌ Error detectado:", e.error);
});

// 6. Instrucciones finales
console.log("\n📋 MÉTODOS DISPONIBLES PARA PROBAR:");
console.log("====================================");
console.log("1. clickTableroDirecto() - Click directo en el elemento");
console.log("2. clickTableroEvent() - Dispara evento de click");
console.log("3. navigateToTablero() - Navegación directa");
console.log("4. findAndClickTableroLink() - Busca y hace click en links");
console.log("");
console.log("🎯 RECOMENDACIÓN: Prueba en este orden:");
console.log("1. Primero: findAndClickTableroLink()");
console.log("2. Si no funciona: clickTableroDirecto()");
console.log("3. Si no funciona: navigateToTablero()");
console.log("");
console.log("✅ Los elementos están resaltados en la página para que los veas");

console.log("=================================================");
console.log("🚀 Diagnóstico completado. ¡Prueba los métodos!");
