// Script de verificación del menú
// Ejecutar en la consola del navegador después de hacer login

console.log("🔍 Verificando datos del menú...");

// 1. Verificar cookies
console.log("📁 Cookies actuales:");
console.log("perfilPONTO:", document.cookie.split(';').find(c => c.trim().startsWith('perfilPONTO=')));
console.log("idPONTO:", document.cookie.split(';').find(c => c.trim().startsWith('idPONTO=')));
console.log("tokenPONTO:", document.cookie.split(';').find(c => c.trim().startsWith('tokenPONTO=')));

// 2. Verificar localStorage y sessionStorage
console.log("💾 localStorage keys:", Object.keys(localStorage));
console.log("💾 sessionStorage keys:", Object.keys(sessionStorage));

// 3. Hacer petición manual al endpoint del menú
const getCookieValue = (name) => {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
};

const perfil = getCookieValue('perfilPONTO');
const usuario = getCookieValue('idPONTO');

if (perfil && usuario) {
    console.log("🌐 Haciendo petición al menú...");
    
    fetch(`http://localhost:5000/api/app/get_menu?per=${perfil}&idu=${usuario}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log("📡 Respuesta del servidor:", response.status, response.statusText);
        return response.json();
    })
    .then(data => {
        console.log("📋 Datos del menú recibidos:");
        console.log("Padres:", data.padres);
        console.log("Hijos:", data.hijos);
        
        // Buscar específicamente el tablero
        const tablero = data.padres.find(item => 
            item.label && item.label.toLowerCase().includes('tablero')
        );
        
        if (tablero) {
            console.log("✅ TABLERO ENCONTRADO:", tablero);
        } else {
            console.log("❌ Tablero NO encontrado en los datos");
            console.log("Elementos padre disponibles:", data.padres.map(p => p.label));
        }
    })
    .catch(error => {
        console.error("❌ Error al obtener el menú:", error);
    });
} else {
    console.log("❌ No se encontraron cookies de sesión");
}

// 4. Verificar el estado actual del React (si hay acceso al store)
try {
    // Intentar acceder al estado de React a través de DevTools
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        console.log("🔧 React DevTools disponibles");
    }
} catch (e) {
    console.log("⚠️ No se pudo acceder a React DevTools");
}
