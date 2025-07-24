// SCRIPT DE DEBUGGING AVANZADO
// Ejecutar en la consola del navegador DESPUÉS de hacer login

console.log("🔍 DEBUGGING AVANZADO DEL MENÚ");
console.log("==============================");

// Función para esperar un elemento
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) {
            resolve(element);
            return;
        }

        const observer = new MutationObserver((mutations) => {
            const element = document.querySelector(selector);
            if (element) {
                observer.disconnect();
                resolve(element);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Elemento ${selector} no encontrado en ${timeout}ms`));
        }, timeout);
    });
}

// 1. Verificar si React está cargado
console.log("1️⃣ Verificando React...");
if (window.React) {
    console.log("✅ React está disponible");
} else {
    console.log("❌ React no está disponible");
}

// 2. Verificar elementos del menú
console.log("\n2️⃣ Verificando elementos del menú en el DOM...");
const menuItems = document.querySelectorAll('[class*="menu"], [class*="navigation"], [class*="sidebar"]');
console.log(`Encontrados ${menuItems.length} elementos de menú`);

menuItems.forEach((item, index) => {
    console.log(`Menú ${index + 1}:`, item.className);
    if (item.textContent.toLowerCase().includes('tablero')) {
        console.log("✅ TABLERO ENCONTRADO EN EL DOM:", item);
    }
});

// 3. Buscar texto "tablero" en toda la página
console.log("\n3️⃣ Buscando texto 'tablero' en toda la página...");
const allElements = document.querySelectorAll('*');
let tableroFound = false;
allElements.forEach(el => {
    if (el.textContent && el.textContent.toLowerCase().includes('tablero') && el.children.length === 0) {
        console.log("✅ Texto 'tablero' encontrado en:", el);
        tableroFound = true;
    }
});

if (!tableroFound) {
    console.log("❌ No se encontró texto 'tablero' en ningún elemento");
}

// 4. Verificar llamadas de red
console.log("\n4️⃣ Interceptando llamadas de red...");
const originalFetch = window.fetch;
window.fetch = function(...args) {
    if (args[0].includes('get_menu')) {
        console.log("🌐 Interceptada llamada get_menu:", args[0]);
        return originalFetch.apply(this, args).then(response => {
            response.clone().json().then(data => {
                console.log("📊 Datos del menú interceptados:", data);
                const tableroItem = data.padres?.find(item => 
                    item.label && item.label.toLowerCase().includes('tablero')
                );
                if (tableroItem) {
                    console.log("✅ TABLERO EN RESPUESTA DEL SERVIDOR:", tableroItem);
                } else {
                    console.log("❌ TABLERO NO ENCONTRADO EN RESPUESTA");
                    console.log("Elementos disponibles:", data.padres?.map(p => p.label));
                }
            });
            return response;
        });
    }
    return originalFetch.apply(this, args);
};

// 5. Verificar estado del store/context de React
console.log("\n5️⃣ Intentando acceder al estado de React...");
setTimeout(() => {
    // Buscar componentes React en el DOM
    const reactElements = document.querySelectorAll('[data-reactroot], [data-react-checksum]');
    console.log(`Encontrados ${reactElements.length} elementos React`);
    
    // Intentar acceder a instancias de React
    const reactFiberKey = Object.keys(document.querySelector('#root') || {}).find(key => 
        key.startsWith('__reactInternalInstance') || key.startsWith('_reactInternalFiber')
    );
    
    if (reactFiberKey) {
        console.log("✅ React Fiber encontrado");
    } else {
        console.log("❌ No se pudo acceder a React Fiber");
    }
}, 1000);

console.log("\n✅ Debugging configurado. Recarga la página y observa los mensajes.");
console.log("====================================================================");
