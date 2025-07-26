//import Cookies from 'js-cookie';

class AuthService {
    constructor() {
        this.baseURL = 'http://localhost:5000';
    }

    // Verificar si hay token válido para tablero
    isTableroAuthenticated() {
        const token = localStorage.getItem('tablero_token');
        const user = localStorage.getItem('tablero_user');
        return !!(token && user);
    }

    // Obtener token del tablero
    getTableroToken() {
        return localStorage.getItem('tablero_token') || 'fake-token-development';
    }

    // Obtener usuario del tablero
    getTableroUser() {
        const userStr = localStorage.getItem('tablero_user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (error) {
                console.error('Error parseando usuario:', error);
            }
        }
        
        // Usuario por defecto para desarrollo
        return {
            usu_id: 1,
            nombre: 'Administrador Sistema',
            email: 'admin@tablero.com'
        };
    }

    // Generar token temporal para tablero
    generateTableroToken = async (usuario, clave) => {
        try {
            console.log('🔐 Generando token temporal para tablero:', usuario);
            
            // Para desarrollo: aceptar cualquier contraseña para admin
            if (usuario === 'admin@tablero.com' || usuario === 'admin') {
                const tempToken = `tablero_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                
                localStorage.setItem('tablero_token', tempToken);
                localStorage.setItem('tablero_user', JSON.stringify({
                    usu_id: 1,
                    nombre: 'Administrador Sistema',
                    email: usuario,
                    usuario: usuario,
                    authenticated: true,
                    timestamp: Date.now()
                }));
                
                console.log('✅ Token temporal generado exitosamente');
                return { 
                    success: true, 
                    token: tempToken,
                    user: {
                        usu_id: 1,
                        nombre: 'Administrador Sistema',
                        email: usuario,
                        usuario: usuario
                    }
                };
            } else {
                throw new Error('Usuario no válido para tablero');
            }
        } catch (error) {
            console.error('❌ Error generando token temporal:', error);
            throw error;
        }
    };

    // Usar autenticación existente de PONTO para tablero
    useExistingPontoAuth = () => {
        try {
            console.log('⚠️ Usando autenticación existente de PONTO');
            
            // Obtener token de PONTO si existe
            const pontoToken = localStorage.getItem('token') || 
                             sessionStorage.getItem('token') || 
                             `ponto_fallback_${Date.now()}`;
            
            // Obtener datos de usuario de PONTO si existen
            const pontoUser = localStorage.getItem('user') || 
                             sessionStorage.getItem('user');
            
            // Guardar para tablero
            localStorage.setItem('tablero_token', pontoToken);
            
            if (pontoUser) {
                localStorage.setItem('tablero_user', pontoUser);
            } else {
                localStorage.setItem('tablero_user', JSON.stringify({
                    usu_id: 1,
                    nombre: 'Usuario PONTO',
                    email: 'usuario@ponto.com',
                    usuario: 'usuario_ponto',
                    authenticated: true,
                    source: 'ponto_fallback'
                }));
            }
            
            console.log('✅ Autenticación PONTO convertida para tablero');
            return { success: true, token: pontoToken };
        } catch (error) {
            console.error('❌ Error convirtiendo auth PONTO:', error);
            return { success: false, error: error.message };
        }
    };

    // Verificar si está autenticado
    isAuthenticated = () => {
        const tableroToken = localStorage.getItem('tablero_token');
        const pontoToken = localStorage.getItem('token');
        
        return !!(tableroToken || pontoToken);
    };

    // Obtener token
    getToken = () => {
        return localStorage.getItem('tablero_token') || 
               localStorage.getItem('token') || 
               null;
    };

    // Obtener usuario
    getUser = () => {
        try {
            const tableroUser = localStorage.getItem('tablero_user');
            if (tableroUser) {
                return JSON.parse(tableroUser);
            }
            
            const pontoUser = localStorage.getItem('user');
            if (pontoUser) {
                return JSON.parse(pontoUser);
            }
            
            return null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    };

    // Logout del tablero
    logout = () => {
        try {
            localStorage.removeItem('tablero_token');
            localStorage.removeItem('tablero_user');
            console.log('🚪 Logout del tablero completado');
            return { success: true };
        } catch (error) {
            console.error('Error en logout:', error);
            return { success: false, error: error.message };
        }
    };

    // Hacer peticiones autenticadas al backend
    async makeAuthenticatedRequest(endpoint, options = {}) {
        const token = this.getToken();
        
        const defaultHeaders = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers: {
                    ...defaultHeaders,
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error en petición a ${endpoint}:`, error);
            throw error;
        }
    }

    // Validar token con el backend
    async validateToken() {
        try {
            const response = await this.makeAuthenticatedRequest('/api/auth/verify-token');
            return response.valid || false;
        } catch (error) {
            console.error('Error validando token:', error);
            return false;
        }
    }

    // ← AGREGAR MÉTODO PARA VERIFICAR AUTENTICACIÓN DEL TABLERO
    isTableroAuthenticated = () => {
        const tableroToken = localStorage.getItem('tablero_token');
        const pontoToken = localStorage.getItem('token');
        const userAuth = localStorage.getItem('user_authenticated');
        
        return !!(tableroToken || pontoToken || userAuth === 'true');
    };

    // ← AGREGAR MÉTODO PARA OBTENER USUARIO DEL TABLERO
    getTableroUser = () => {
        try {
            const tableroUser = localStorage.getItem('tablero_user');
            if (tableroUser) {
                return JSON.parse(tableroUser);
            }
            
            const pontoUser = localStorage.getItem('user');
            if (pontoUser) {
                return JSON.parse(pontoUser);
            }
            
            return {
                nombre: 'Usuario Sistema',
                email: 'usuario@tablero.com'
            };
        } catch (error) {
            return {
                nombre: 'Usuario Sistema',
                email: 'usuario@tablero.com'
            };
        }
    };

    // ← MÉTODO PARA DESARROLLO
    setDevelopmentAuth = () => {
        console.log('🔧 Estableciendo autenticación de desarrollo...');
        localStorage.setItem('tablero_token', 'dev_token_' + Date.now());
        localStorage.setItem('user_authenticated', 'true');
        localStorage.setItem('tablero_user', JSON.stringify({
            nombre: 'Desarrollador',
            email: 'dev@tablero.com'
        }));
    };
}

// Exportar como instancia singleton
export default new AuthService();