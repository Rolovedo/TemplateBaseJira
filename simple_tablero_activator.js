// SCRIPT SIMPLE PARA ACTIVAR EL BOTÓN DEL TABLERO
// Copiar y pegar en la consola del navegador

(function() {
    console.log("🔧 ACTIVANDO BOTÓN DEL TABLERO...");
    
    // Encontrar el elemento del tablero
    const menuContainer = document.querySelector('.layout-menu-container');
    if (!menuContainer) {
        console.log("❌ No se encontró el contenedor del menú");
        return;
    }
    
    const tableroCategory = Array.from(menuContainer.querySelectorAll('.layout-menuitem-category'))
        .find(category => category.textContent.toLowerCase().includes('tablero'));
    
    if (!tableroCategory) {
        console.log("❌ No se encontró la categoría del tablero");
        return;
    }
    
    console.log("✅ Categoría del tablero encontrada");
    
    // Hacer clickeable el título
    const tableroTitle = tableroCategory.querySelector('.layout-menuitem-root-text');
    if (tableroTitle) {
        // Estilos visuales
        tableroTitle.style.cursor = "pointer";
        tableroTitle.style.padding = "10px";
        tableroTitle.style.borderRadius = "5px";
        tableroTitle.style.border = "2px solid #28a745";
        tableroTitle.style.backgroundColor = "#d4edda";
        tableroTitle.style.transition = "all 0.3s ease";
        
        // Evento de click
        tableroTitle.onclick = function(e) {
            e.preventDefault();
            console.log("🖱️ Navegando al tablero...");
            window.location.hash = '#/tablero/board';
        };
        
        // Efectos hover
        tableroTitle.onmouseenter = function() {
            this.style.backgroundColor = "#007bff";
            this.style.color = "white";
        };
        
        tableroTitle.onmouseleave = function() {
            this.style.backgroundColor = "#d4edda";
            this.style.color = "";
        };
        
        console.log("✅ Título del tablero configurado como clickeable");
    }
    
    // Agregar enlace en el submenu
    const submenu = tableroCategory.querySelector('.layout-submenu-fixed');
    if (submenu && submenu.children.length === 0) {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        
        link.href = '#/tablero/board';
        link.innerHTML = `
            <div style="padding: 10px; display: flex; align-items: center; gap: 10px; color: #007bff;">
                <i class="pi pi-th-large"></i>
                <span>Tablero Kanban</span>
            </div>
        `;
        
        link.style.textDecoration = "none";
        link.style.border = "2px solid #007bff";
        link.style.borderRadius = "5px";
        link.style.margin = "5px";
        link.style.display = "block";
        
        link.onclick = function(e) {
            e.preventDefault();
            console.log("🖱️ Click en enlace del submenu");
            window.location.hash = '#/tablero/board';
        };
        
        listItem.appendChild(link);
        submenu.appendChild(listItem);
        
        console.log("✅ Enlace agregado al submenu");
    }
    
    console.log("🎯 LISTO: El tablero ahora es clickeable (elementos resaltados)");
    console.log("📱 Haz click en 'TABLERO' (verde) o 'Tablero Kanban' (azul)");
})();
