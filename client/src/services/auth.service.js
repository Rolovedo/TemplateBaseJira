import Cookies from 'js-cookie';

class AuthService {
    constructor() {
        this.baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
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

    // Usar autenticación existente de PONTO para tablero
    useExistingPontoAuth() {
        try {
            const isAuthenticated = Cookies.get('autentificadoPONTO') === 'true';
            const userId = Cookies.get('idPONTO');
            const userName = Cookies.get('usuarioPONTO');
            const userEmail = Cookies.get('correoPONTO');
            
            if (isAuthenticated && userId) {
                const tempUser = {
                    usu_id: Number(userId),
                    nombre: userName || 'Usuario',
                    email: userEmail || 'usuario@tablero.com'
                };

                localStorage.setItem('tablero_token', 'ponto-auth-token');
                localStorage.setItem('tablero_user', JSON.stringify(tempUser));
                
                console.log('✅ Autenticación PONTO convertida para tablero');
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error usando auth PONTO:', error);
            return false;
        }
    }

    // Establecer autenticación manual para desarrollo
    setDevelopmentAuth() {
        const devUser = {
            usu_id: 1,
            nombre: 'Administrador Sistema',
            email: 'admin@tablero.com'
        };
        
        localStorage.setItem('tablero_token', 'dev-token-123');
        localStorage.setItem('tablero_user', JSON.stringify(devUser));
        
        console.log('✅ Autenticación de desarrollo establecida');
        return true;
    }

    // Limpiar autenticación del tablero
    clearTableroAuth() {
        localStorage.removeItem('tablero_token');
        localStorage.removeItem('tablero_user');
    }

    // Logout del tablero
    logout() {
        this.clearTableroAuth();
        console.log('👋 Logout del tablero completado');
    }
}

export default new AuthService();