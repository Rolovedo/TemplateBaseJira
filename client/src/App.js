import React from "react";
import AppRoutes from "./routes";

// PrimeReact CSS
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

// PrimeFlex CSS (opcional)
import "primeflex/primeflex.css";

function App() {
    return (
        <div className="App">
            <AppRoutes />
        </div>
    );
}

export default App;
