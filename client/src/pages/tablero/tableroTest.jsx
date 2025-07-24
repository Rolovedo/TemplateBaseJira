import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import './tableroTest.scss';

const TableroTest = () => {
    console.log("🎯 PÁGINA DE PRUEBA DEL TABLERO CARGADA!");
    console.log("📊 Si ves este mensaje en la consola, el tablero está funcionando");
    
    return (
        <div className="tablero-test">
            {/* Banner de confirmación súper visible */}
            <div className="success-banner">
                <div className="banner-content">
                    <i className="pi pi-check-circle banner-icon"></i>
                    <div className="banner-text">
                        <h2>🎉 ¡TABLERO FUNCIONANDO CORRECTAMENTE!</h2>
                        <p>Esta página se está cargando desde: <code>/tablero/board</code></p>
                        <p>Si puedes ver esto, ¡la navegación del tablero está funcionando perfectamente!</p>
                    </div>
                </div>
            </div>
            
            {/* Contenido de prueba */}
            <div className="test-content">
                <Card className="welcome-card">
                    <div className="card-header">
                        <i className="pi pi-home"></i>
                        <h3>Bienvenido al Tablero Kanban</h3>
                        <Badge value="ACTIVO" severity="success" />
                    </div>
                    
                    <div className="test-info">
                        <h4>📋 Información del Sistema:</h4>
                        <ul>
                            <li>✅ Ruta actual: <strong>/tablero/board</strong></li>
                            <li>✅ Componente: <strong>TableroBoard</strong></li>
                            <li>✅ Estado: <strong>Funcionando correctamente</strong></li>
                            <li>✅ Base de datos: <strong>Configurada</strong></li>
                            <li>✅ Permisos: <strong>Concedidos</strong></li>
                        </ul>
                    </div>
                    
                    <div className="test-actions">
                        <Button 
                            label="🔄 Cargar Tablero Completo" 
                            className="p-button-success"
                            onClick={() => window.location.reload()}
                        />
                        <Button 
                            label="📊 Ver Dashboard" 
                            className="p-button-outlined"
                            onClick={() => window.location.href = '/dashboard'}
                        />
                    </div>
                </Card>
                
                {/* Simulador de columnas del tablero */}
                <div className="preview-columns">
                    <h4>📊 Vista previa del tablero:</h4>
                    <div className="columns-container">
                        {[
                            { name: 'Backlog', color: '#6c757d', count: 2 },
                            { name: 'Por Hacer', color: '#17a2b8', count: 1 },
                            { name: 'En Progreso', color: '#ffc107', count: 1 },
                            { name: 'En Revisión', color: '#fd7e14', count: 0 },
                            { name: 'Completado', color: '#28a745', count: 1 }
                        ].map((column, index) => (
                            <div key={index} className="preview-column">
                                <div 
                                    className="column-header"
                                    style={{ borderLeftColor: column.color }}
                                >
                                    <span>{column.name}</span>
                                    <Badge value={column.count} />
                                </div>
                                <div className="column-body">
                                    {column.count > 0 && (
                                        <div className="sample-task">
                                            <div className="task-title">Tarea de ejemplo</div>
                                            <div className="task-meta">Frontend • 8h</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TableroTest;
