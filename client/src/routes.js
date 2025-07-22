import Dashboard from "@pages/home/Dashboard";
import Reasons from "@pages/admin/Reasons";
import Perfiles from "@pages/security/Perfiles";
import Usuarios from "@pages/security/Usuarios";
import Login from "@pages/auth/LoginPage";
import ResetPassword from "@pages/auth/ResetPassword";
import NotFoundPage from "@pages/app/NotFoundPage";

// RUTAS CON LAYOUT
export const privateAdminRoutes = [
    { path: "/dashboard", component: Dashboard },
    { path: "/reasons", component: Reasons },
    { path: "/profiles", component: Perfiles },
    { path: "/users", component: Usuarios },
];

// RUTAS SIN LAYOUT

export const publicRoutes = [
    { path: "/", component: Login, exact: true },
    { path: "/restore-password/:token", component: ResetPassword },
];

export const errorRoute = { path: "*", component: NotFoundPage };
