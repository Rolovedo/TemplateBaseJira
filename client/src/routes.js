import Dashboard from "@pages/home/Dashboard";
import Reasons from "@pages/admin/Reasons";
import Perfiles from "@pages/security/Perfiles";
import Usuarios from "@pages/security/Usuarios";
import Login from "@pages/auth/LoginPage";
import ResetPassword from "@pages/auth/ResetPassword";
import NotFoundPage from "@pages/app/NotFoundPage";

// Componentes del Tablero
import TableroBoard from "@pages/tablero/tableroBoard";
import TaskManagement from "@pages/tablero/TaskManagement";
import DeveloperManagement from "@pages/tablero/DeveloperManagement";
import TaskAssignment from "@pages/tablero/TaskAssignment";
import TableroGuide from "@pages/tablero/tableroGuide";

// RUTAS CON LAYOUT
export const privateAdminRoutes = [
    { path: "/dashboard", component: Dashboard },
    { path: "/tablero-board", component: TableroBoard },
    { path: "/task-management", component: TaskManagement },
    { path: "/developer-management", component: DeveloperManagement },
    { path: "/task-assignment", component: TaskAssignment },
    { path: "/tablero-guide", component: TableroGuide },
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
