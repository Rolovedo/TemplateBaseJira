import { useContext, useEffect, useRef } from "react";
import { AuthContext } from "@context/auth/AuthContext";

const useSocketReconnect = (socket) => {
    const { permisos } = useContext(AuthContext);
    const permisosRef = useRef(permisos);

    const reconnectAttempts = useRef(0);
    const reconnectTimeout = useRef(null);
    const MAX_ATTEMPTS = 5;
    const BASE_DELAY = 1000;

    // Actualiza permisos en ref para usarlos en callbacks sin re-renders
    useEffect(() => {
        permisosRef.current = permisos;
    }, [permisos]);

    useEffect(() => {
        if (!socket) return;

        const handleDisconnect = (reason) => {
            console.warn("Socket desconectado:", reason);

            if (!socket.io.opts.autoConnect) {
                intentarReconectar();
            }
        };

        const handleConnect = () => {
            console.info("Socket reconectado correctamente");
            reconnectAttempts.current = 0;

            // Aquí podrías disparar lógica post-reconexión controlada
            // solo si hace falta (como resuscribirse a canales o roles)
        };

        const intentarReconectar = () => {
            if (reconnectAttempts.current >= MAX_ATTEMPTS) {
                console.error("Límite de reintentos de reconexión alcanzado.");
                return;
            }

            const delay = BASE_DELAY * Math.pow(2, reconnectAttempts.current); // Exponencial

            reconnectTimeout.current = setTimeout(() => {
                if (!socket.connected) {
                    // console.log(
                    //     `Intentando reconectar... (intento ${reconnectAttempts.current + 1})`
                    // );
                    socket.connect();
                    reconnectAttempts.current++;
                }
            }, delay);
        };

        socket.on("disconnect", handleDisconnect);
        socket.on("connect", handleConnect);

        return () => {
            clearTimeout(reconnectTimeout.current);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect", handleConnect);
        };
    }, [socket]);
};

export default useSocketReconnect;
