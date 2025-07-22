export const config = {
    home: {
        homepage: {
            viewAll: null,
            onlyRead: null,
            create: null,
            edit: null,
            delete: null,
            manage: 25
        },
    },
    management: {
     
        activitySession: {
            viewAll: null,
            onlyRead: null,
            create: 12, // Crear sesion actividad
            edit: 13, // Modificar sesion actividad
            delete: 14, // Eliminar sesion actividad
        },
        schedules: {
            viewAll: null,
            onlyRead: null,
            create: 15, // Crear horarios
            edit: 16, // Modificar horarios
            delete: 17, // Eliminar horarios
        },
        reasons: {
            viewAll: null,
            onlyRead: null,
            create: 18, // Crear Motivo
            edit: 19, // Modificar Motivo
            delete: 20, // Eliminar Motivo
        },
        newness: {
            viewAll: null,
            onlyRead: null,
            create: 22, // Crear Motivo
            edit: 23, // Modificar Motivo
            delete: 24, // Eliminar Motivo
        },
    },
    security: {
        profiles: {
            viewAll: null,
            onlyRead: null,
            create: 1, // Crear Perfil
            assignPermission: 3, // Asignar Permisos Perfil
            edit: 2, // Modificar Perfil
            delete: 4, // Eliminar Perfil
        },
        users: {
            viewAll: null,
            onlyRead: null,
            create: 5, // Crear Usuario
            assignPermission: 8, // Asignar Permisos Usuario
            edit: 6, // Modificar Usuario
            delete: 7, // Eliminar Usuario
        },
    },
};
