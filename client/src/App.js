import React from "react";
import { Route, Switch } from "react-router-dom";
import PrivateRoute from "@components/PrivateRoute";
import PublicRoute from "@components/PublicRoute";
import Layout from "@components/layout/Layout";
import {
    publicRoutes,
    privateAdminRoutes,
    errorRoute,
} from "./routes";
import { useSocket } from "@context/socket/SocketContext";
import useSocketReconnect from "@hook/useSocketReconnect";

const App = () => {
    const socket = useSocket();
    useSocketReconnect(socket);
    return (
        <Switch>
            {/* RUTAS PÚBLICAS */}
            {publicRoutes.map((route, index) => (
                <PublicRoute
                    key={index}
                    exact={route.exact}
                    path={route.path}
                    component={route.component}
                />
            ))}

        

            {/* RUTAS CON LAYOUT (ADMINISTRATIVO) */}
            <Route path="/">
                <Layout>
                    <Switch>
                        {privateAdminRoutes.map((route, index) => (
                            <PrivateRoute
                                key={index}
                                path={route.path}
                                component={route.component}
                            />
                        ))}

                        {/* RUTA DE ERROR */}
                        <Route path={errorRoute.path} component={errorRoute.component} />
                    </Switch>
                </Layout>
            </Route>
        </Switch>
    );
};

export default App;
