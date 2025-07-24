// Script para limpiar completamente la caché del navegador
// Ejecutar en la consola del navegador (F12 -> Console)

console.log("🧹 Iniciando limpieza completa de caché...");

// 1. Limpiar localStorage
try {
  localStorage.clear();
  console.log("✅ localStorage limpiado");
} catch (e) {
  console.error("❌ Error limpiando localStorage:", e);
}

// 2. Limpiar sessionStorage
try {
  sessionStorage.clear();
  console.log("✅ sessionStorage limpiado");
} catch (e) {
  console.error("❌ Error limpiando sessionStorage:", e);
}

// 3. Limpiar cookies específicas de la aplicación
try {
  // Obtener todas las cookies
  const cookies = document.cookie.split(";");
  
  // Limpiar cookies relacionadas con la aplicación
  cookies.forEach(cookie => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    
    // Eliminar cookies específicas de la aplicación
    if (name.includes("token") || name.includes("PONTO") || name.includes("user") || name.includes("auth")) {
      // Eliminar con diferentes paths y dominios
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.localhost;`;
      console.log(`✅ Cookie eliminada: ${name}`);
    }
  });
} catch (e) {
  console.error("❌ Error limpiando cookies:", e);
}

// 4. Limpiar IndexedDB (si se usa)
try {
  if ('indexedDB' in window) {
    indexedDB.databases().then(databases => {
      databases.forEach(db => {
        if (db.name.toLowerCase().includes('tablero') || db.name.toLowerCase().includes('pavas')) {
          indexedDB.deleteDatabase(db.name);
          console.log(`✅ IndexedDB eliminada: ${db.name}`);
        }
      });
    });
  }
} catch (e) {
  console.error("❌ Error limpiando IndexedDB:", e);
}

// 5. Limpiar cache del service worker (si existe)
try {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister();
        console.log("✅ Service Worker desregistrado");
      });
    });
  }
} catch (e) {
  console.error("❌ Error con Service Worker:", e);
}

// 6. Limpiar cache de la API
try {
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
        console.log(`✅ Cache eliminado: ${name}`);
      });
    });
  }
} catch (e) {
  console.error("❌ Error limpiando caches:", e);
}

console.log("🔄 Limpieza completada. Recargar la página en 3 segundos...");

// 7. Recargar la página después de 3 segundos
setTimeout(() => {
  console.log("🔄 Recargando página...");
  window.location.reload(true); // true fuerza la recarga desde el servidor
}, 3000);
