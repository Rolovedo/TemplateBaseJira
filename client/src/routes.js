import React from 'react';
import { HashRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Login from './pages/auth/Login'; // USAR Login.jsx en lugar de LoginPage.jsx
import TableroBoard from './pages/tablero/tableroBoard';

const AppRoutes = () => {
    return (
        <Router>
            <Switch>
                {/* Ruta por defecto redirige al login */}
                <Route exact path="/" render={() => <Redirect to="/login" />} />
                
                {/* Ruta de login usando Login.jsx */}
                <Route exact path="/login" component={Login} />
                
                {/* Ruta del dashboard */}
                <Route exact path="/dashboard" component={TableroBoard} />
                
                {/* Ruta del tablero */}
                <Route exact path="/tablero" component={TableroBoard} />
                
                {/* Nueva ruta para /tablero/board */}
                <Route exact path="/tablero/board" component={TableroBoard} />
                
                {/* Ruta de fallback */}
                <Route path="*" render={() => <Redirect to="/login" />} />
            </Switch>
        </Router>
    );
};

export default AppRoutes;
