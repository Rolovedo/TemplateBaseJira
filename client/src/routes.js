import React from 'react';
import { HashRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import TableroBoard from './pages/tablero/tableroBoard';

const AppRoutes = () => {
    return (
        <Router>
            <Switch>
                {/* Ruta por defecto redirige al login */}
                <Route exact path="/" render={() => <Redirect to="/login" />} />
                
                {/* Ruta de login */}
                <Route exact path="/login" component={LoginPage} />
                
                {/* Ruta del tablero */}
                <Route exact path="/tablero" component={TableroBoard} />
                
                {/* Ruta de fallback */}
                <Route path="*" render={() => <Redirect to="/login" />} />
            </Switch>
        </Router>
    );
};

export default AppRoutes;
