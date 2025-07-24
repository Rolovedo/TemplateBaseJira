// SCRIPT PARA ACTIVAR EL BOTÓN DEL TABLERO EN EL MENÚ
// Ejecutar en la consola cuando estés en el dashboard

console.log("🔧 ACTIVANDO BOTÓN DEL TABLERO EN EL MENÚ...");
console.log("============================================");

// 1. Encontrar el elemento del tablero en el menú
const menuContainer = document.querySelector('.layout-menu-container');
const tableroCategory = Array.from(menuContainer.querySelectorAll('.layout-menuitem-category'))
    .find(category => {
        const text = category.textContent.toLowerCase();
        return text.includes('tablero');
    });

if (!tableroCategory) {
    console.log("❌ No se encontró la categoría del tablero");
} else {
    console.log("✅ Categoría del tablero encontrada");

    // 2. Hacer que toda la categoría sea clickeable
    const tableroTitle = tableroCategory.querySelector('.layout-menuitem-root-text');
    if (tableroTitle) {
        console.log("🎯 Configurando el título del tablero como clickeable...");
        
        // Agregar estilos para que se vea clickeable
        tableroTitle.style.cursor = "pointer";
        tableroTitle.style.transition = "all 0.3s ease";
        tableroTitle.style.padding = "10px";
        tableroTitle.style.borderRadius = "5px";
        
        // Efectos hover
        tableroTitle.addEventListener('mouseenter', function() {
            this.style.backgroundColor = "#007bff";
            this.style.color = "white";
            this.style.transform = "translateX(5px)";
        });
        
        tableroTitle.addEventListener('mouseleave', function() {
            this.style.backgroundColor = "";
            this.style.color = "";
            this.style.transform = "translateX(0)";
        });
        
        // Agregar evento de click
        tableroTitle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log("🖱️ Click en título del tablero detectado");
            
            // Cambiar la URL con hash routing
            window.location.hash = '#/tablero/board';
            
            // Agregar efecto visual de click
            this.style.transform = "scale(0.95)";
            setTimeout(() => {
                this.style.transform = "translateX(5px)";
            }, 150);
            
            console.log("✅ Navegando al tablero...");
        });
        
        console.log("✅ Evento de click agregado al título del tablero");
        
        // Resaltar para que el usuario lo vea
        tableroTitle.style.border = "2px solid #28a745";
        tableroTitle.style.backgroundColor = "#d4edda";
    }

// 3. También crear un enlace directo en el submenu vacío
const submenu = tableroCategory.querySelector('.layout-submenu-fixed');
if (submenu && submenu.children.length === 0) {
    console.log("📋 Agregando enlace directo en el submenu...");
    
    // Crear elemento de lista
    const listItem = document.createElement('li');
    
    // Crear enlace
    const link = document.createElement('a');
    link.href = '#/tablero/board';
    link.className = 'p-ripple';
    link.style.color = '#007bff';
    link.style.fontWeight = '500';
    
    // Crear contenido del enlace
    const linkContent = document.createElement('div');
    linkContent.className = 'flex align-items-center justify-content-between w-full px-3 py-2';
    linkContent.innerHTML = `
        <div class="flex align-items-center gap-2">
            <i class="pi pi-th-large"></i>
            <span>Tablero Kanban</span>
        </div>
    `;
    
    link.appendChild(linkContent);
    listItem.appendChild(link);
    submenu.appendChild(listItem);
    
    // Agregar evento de click al nuevo enlace
    link.addEventListener('click', function(e) {
        e.preventDefault();
        console.log("🖱️ Click en enlace del submenu");
        window.location.hash = '#/tablero/board';
    });
    
    console.log("✅ Enlace directo agregado al submenu");
    
    // Resaltar el nuevo enlace
    link.style.border = "2px solid #007bff";
    link.style.borderRadius = "5px";
    link.style.margin = "5px";
}

// 4. Función para mostrar estado activo cuando estamos en el tablero
window.updateTableroMenuState = function() {
    const currentHash = window.location.hash;
    
    if (currentHash.includes('/tablero/board') || currentHash.includes('tablero')) {
        // Marcar como activo
        if (tableroTitle) {
            tableroTitle.style.backgroundColor = "#007bff";
            tableroTitle.style.color = "white";
            tableroTitle.style.fontWeight = "bold";
        }
        
        // Marcar enlaces como activos
        const tableroLinks = submenu?.querySelectorAll('a');
        tableroLinks?.forEach(link => {
            link.style.backgroundColor = "#e3f2fd";
            link.style.borderLeft = "4px solid #007bff";
        });
        
        console.log("✅ Menu del tablero marcado como activo");
    } else {
        // Quitar estado activo
        if (tableroTitle) {
            tableroTitle.style.backgroundColor = "";
            tableroTitle.style.color = "";
            tableroTitle.style.fontWeight = "";
        }
        
        const tableroLinks = submenu?.querySelectorAll('a');
        tableroLinks?.forEach(link => {
            link.style.backgroundColor = "";
            link.style.borderLeft = "";
        });
    }
};

// 5. Escuchar cambios de hash para actualizar estado
window.addEventListener('hashchange', function() {
    console.log("🔄 Cambio de hash detectado:", window.location.hash);
    updateTableroMenuState();
});

// 6. Aplicar estado inicial
updateTableroMenuState();

console.log("\n🎯 RESULTADO:");
console.log("✅ El título 'TABLERO' ahora es clickeable (resaltado en verde)");
console.log("✅ Se agregó un enlace 'Tablero Kanban' en el submenu (resaltado en azul)");
console.log("✅ Ambos elementos navegan al tablero");
console.log("✅ El estado activo se actualiza automáticamente");

console.log("\n📋 USO:");
console.log("1. Haz click en 'TABLERO' (título verde)");
console.log("2. O haz click en 'Tablero Kanban' (enlace azul)");
console.log("3. Ambos te llevarán al tablero funcionando");

console.log("============================================");
console.log("🚀 ¡El botón del tablero está ahora activo!");
}
