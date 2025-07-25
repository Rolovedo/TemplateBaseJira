// Forzar la URL correcta del backend
const BASE_URL = 'http://localhost:5000';  // ← FUERZA EL PUERTO 5000

console.log('🌐 BASE_URL forzada:', BASE_URL);
console.log('🔍 Variables de entorno:', {
    REACT_APP_BASE_URL: process.env.REACT_APP_BASE_URL,
    NODE_ENV: process.env.NODE_ENV
});

export const loginAPI = async (data) => {
    try {
        const url = `${BASE_URL}/api/auth/login`;
        console.log('🔐 Intentando login en URL:', url);
        console.log('📊 Datos enviados:', { usuario: data.usuario, clave: '***' });
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        console.log('📨 Respuesta del servidor - Status:', response.status);
        console.log('📨 Respuesta del servidor - URL:', response.url);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error del servidor:', errorText);
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ Login exitoso:', result);
        return { data: result };
        
    } catch (error) {
        console.error('💥 Error en loginAPI:', error);
        throw error;
    }
};

export const registerAPI = async (data) => {
    try {
        const url = `${BASE_URL}/api/auth/register`;
        console.log('👤 Intentando registro en URL:', url);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        return { data: await response.json() };
    } catch (error) {
        console.error('💥 Error en registerAPI:', error);
        throw error;
    }
};

export const resendOtpAPI = async (data) => {
    try {
        const url = `${BASE_URL}/api/auth/resend-otp`;
        console.log('📧 Intentando reenvío OTP en URL:', url);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        return { data: await response.json() };
    } catch (error) {
        console.error('💥 Error en resendOtpAPI:', error);
        throw error;
    }
};