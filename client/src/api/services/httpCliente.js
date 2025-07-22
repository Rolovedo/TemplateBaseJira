import axios from "axios";
import Cookies from "js-cookie";

// Configurar un interceptor de solicitud para añadir el token de autenticación y otros datos del usuario
axios.interceptors.request.use(
    (config) => {
        config.withCredentials = true; // Incluir cookies en las solicitudes

        // Obtener datos del usuario y el token de las cookies
        const tokenSecurity = Cookies.get("tokenPONTO");
        const currenUserApp = Cookies.get("idPONTO");
        const currentPermissionsUserApp = Cookies.get("permisosPONTO");

        // Añadir el token al header Authorization si existe
        if (tokenSecurity) {
            config.headers.Authorization = `Bearer ${tokenSecurity}`;
        }

        // Añadir currenUserApp y currentPermissionsUserApp como headers personalizados
        if (currenUserApp) {
            config.headers.currenuserapp = currenUserApp;
        }
        if (currentPermissionsUserApp) {
            config.headers.currentpermissionsuserapp = currentPermissionsUserApp;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Configura un interceptor de respuesta para manejar errores globalmente
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Manejar errores de autenticación aquí (opcional)
            console.log("No autorizado. Redirigiendo a la página de login.");
            // window.location.href = '/login'; // Redirigir al login si es necesario
        }
        return Promise.reject(error);
    }
);

// Configuración genérica de peticiones HTTP
const genericRequest = {
    get: (url, params) => {
        const config = {
            params: params || {},
            withCredentials: true, // Incluir cookies en la solicitud
        };
        return axios.get(url, config);
    },
    post: (url, body, config = {}) => axios.post(url, body, { ...config, withCredentials: true }),
    put: (url, body, config = {}) => axios.put(url, body, { ...config, withCredentials: true }),
    delete: (url, config = {}) => axios.delete(url, { ...config, withCredentials: true }),
};

export default genericRequest;
