import React, { createContext, useContext, useEffect, useReducer } from "react";
import { useSocket } from "@context/socket/SocketContext";
import { appReducer } from "./AppReducer";
import { AuthContext } from "@context/auth/AuthContext";

const initialState = {
    doFetchAppointments: false,
};

export const AppContext = createContext({});

export const AppProvider = ({ children }) => {
    const { idusuario } = useContext(AuthContext);

    const [state, dispatch] = useReducer(appReducer, initialState);
    const socket = useSocket();

    // Manejo del socket
    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (data) => {
            if (Number(idusuario) === Number(data.usu_id)) {
                dispatch({ type: "SET_DO_FETCH_APPOINTMENTS", payload: true });
            }
        };
        socket.on("newNotification", handleNewNotification);
        return () => {
            socket.off("newNotification", handleNewNotification);
        };
    }, [socket, idusuario]);

    const handleDofetchAppointments = (state = false) =>
        dispatch({ type: "SET_DO_FETCH_APPOINTMENTS", payload: state });

    return (
        <AppContext.Provider
            value={{
                ...state,
                handleDofetchAppointments,
            }}
        >
            {children}
            {/* <CloseApp visible={visible} /> */}
        </AppContext.Provider>
    );
};
