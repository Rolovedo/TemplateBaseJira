import React, { useContext } from "react";
import { Route, Redirect } from "react-router-dom";
import { AuthContext } from "../context/auth/AuthContext";
import Cookies from "js-cookie";

const PrivateRoute = ({ component: Component, ...rest }) => {
    const { autentificado, perfil, instructor } = useContext(AuthContext);
    const isAuthenticated = autentificado || Cookies.get("autentificadoPONTO") === "true";
    const perfilUsuario = perfil || Number(Cookies.get("perfilPONTO"));

    return (
        <Route
            {...rest}
            render={(props) => {
                if (!isAuthenticated) return <Redirect to="/" />;
                if (
                    perfilUsuario === 3 &&
                    instructor !== 1 &&
                    props.location.pathname !== "/patients"
                ) {
                    return <Redirect to="/patients" />;
                }
                if (instructor === 1 && props.location.pathname !== "/instructors") {
                    return <Redirect to="/instructors" />;
                }

                if (
                    perfilUsuario !== 3 &&
                    instructor !== 1 &&
                    props.location.pathname.startsWith("/patients")
                ) {
                    return <Redirect to="/dashboard" />;
                }

                return <Component {...props} />;
            }}
        />
    );
};

export default PrivateRoute;
