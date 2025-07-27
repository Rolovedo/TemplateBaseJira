import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Steps } from 'primereact/steps';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { TabView, TabPanel } from 'primereact/tabview';
// import { Badge } from 'primereact/badge';
// import { Avatar } from 'primereact/avatar';
import { Chip } from 'primereact/chip';
import { Timeline } from 'primereact/timeline';
import './tableroGuide.scss';

const TableroGuide = () => {
    const [activeStep, setActiveStep] = useState(0);

    const quickStartSteps = [
        {
            label: 'Acceso al Sistema',
            icon: 'pi pi-sign-in',
            description: 'Inicia sesión con tus credenciales asignadas'
        },
        {
            label: 'Conoce tu Rol',
            icon: 'pi pi-user',
            description: 'Identifica si eres Desarrollador o Administrador'
        },
        {
            label: 'Explora el Tablero',
            icon: 'pi pi-th-large',
            description: 'Familiarízate con las columnas y estados de tareas'
        },
        {
            label: 'Gestiona Tareas',
            icon: 'pi pi-check-square',
            description: 'Aprende a crear, asignar y actualizar tareas'
        },
        {
            label: 'Colabora',
            icon: 'pi pi-users',
            description: 'Trabaja en equipo y comunícate efectivamente'
        }
    ];

    const workflowSteps = [
        {
            status: 'backlog',
            title: 'Backlog',
            description: 'Nuevas tareas esperando ser asignadas',
            color: '#6c757d',
            icon: 'pi pi-inbox'
        },
        {
            status: 'todo',
            title: 'Por Hacer',
            description: 'Tareas asignadas listas para comenzar',
            color: '#17a2b8',
            icon: 'pi pi-clock'
        },
        {
            status: 'inProgress',
            title: 'En Progreso',
            description: 'Tareas actualmente en desarrollo',
            color: '#ffc107',
            icon: 'pi pi-spin pi-spinner'
        },
        {
            status: 'review',
            title: 'En Revisión',
            description: 'Tareas completadas esperando aprobación',
            color: '#fd7e14',
            icon: 'pi pi-eye'
        },
        {
            status: 'done',
            title: 'Completado',
            description: 'Tareas finalizadas y aprobadas',
            color: '#28a745',
            icon: 'pi pi-check-circle'
        }
    ];

    const faqData = [
        {
            question: '¿Cómo puedo cambiar de tarea durante un sprint?',
            answer: 'Si necesitas cambiar de tarea mientras estás trabajando, simplemente arrastra la tarea a otra columna. El sistema enviará automáticamente una notificación de WhatsApp al jefe de programadores, quien debe aprobar o rechazar el cambio. No podrás continuar con el cambio hasta recibir la aprobación.'
        },
        {
            question: '¿Qué significan los colores de prioridad?',
            answer: 'Rojo (Muy Alta): Tareas críticas que deben completarse inmediatamente. Amarillo (Alta): Tareas importantes con plazo ajustado. Azul (Media): Tareas normales en el flujo regular. Verde (Baja): Tareas que pueden esperar si hay prioridades más altas.'
        },
        {
            question: '¿Cómo se asignan las tareas automáticamente?',
            answer: 'El sistema utiliza un algoritmo que considera: habilidades requeridas vs habilidades del desarrollador, carga de trabajo actual, eficiencia histórica, nivel de experiencia y número de tareas actuales. Esto garantiza una distribución equitativa y eficiente.'
        },
        {
            question: '¿Puedo agregar colaboradores a mi tarea?',
            answer: 'Sí, durante la asignación o reasignación de tareas puedes añadir colaboradores. Esto es útil para tareas complejas que requieren múltiples habilidades o para mentoring de desarrolladores junior.'
        },
        {
            question: '¿Qué hago si no puedo completar una tarea a tiempo?',
            answer: 'Comunícate con tu supervisor inmediatamente. Puedes actualizar la estimación de horas o solicitar ayuda añadiendo colaboradores. La comunicación temprana es clave para el éxito del proyecto.'
        },
        {
            question: '¿Cómo funciona el sistema de notificaciones de WhatsApp?',
            answer: 'El sistema envía notificaciones automáticas para: cambios de estado de tareas críticas, solicitudes de cambio de tareas, asignaciones nuevas, tareas próximas a vencer, y aprobaciones pendientes. Asegúrate de tener tu número registrado correctamente.'
        }
    ];

    const rolesData = [
        {
            role: 'Desarrollador',
            permissions: [
                'Ver tablero de tareas',
                'Actualizar estado de sus tareas asignadas',
                'Solicitar cambio de tarea (requiere aprobación)',
                'Comentar en tareas',
                'Ver estadísticas personales',
                'Actualizar progreso de tareas'
            ],
            restrictions: [
                'No puede crear nuevas tareas',
                'No puede asignar tareas a otros',
                'No puede eliminar tareas',
                'No puede aprobar cambios de otros desarrolladores'
            ]
        },
        {
            role: 'Jefe de Programadores',
            permissions: [
                'Todas las funciones de Desarrollador',
                'Crear y editar tareas',
                'Asignar tareas a desarrolladores',
                'Aprobar/rechazar cambios de tareas',
                'Ver estadísticas de todo el equipo',
                'Gestionar desarrolladores',
                'Eliminar tareas',
                'Reasignar tareas entre desarrolladores'
            ],
            restrictions: [
                'Debe aprobar cambios de tareas críticas',
                'Responsable de balancear la carga de trabajo'
            ]
        },
        {
            role: 'Administrador',
            permissions: [
                'Acceso completo al sistema',
                'Gestionar usuarios y roles',
                'Configurar categorías y prioridades',
                'Acceso a logs y auditoría',
                'Configurar integraciones',
                'Backup y mantenimiento'
            ],
            restrictions: [
                'Requiere autenticación adicional para cambios críticos'
            ]
        }
    ];

    const shortcuts = [
        { key: 'Ctrl + N', action: 'Crear nueva tarea' },
        { key: 'Ctrl + F', action: 'Buscar tareas' },
        { key: 'Esc', action: 'Cerrar dialogs/modales' },
        { key: 'F5', action: 'Actualizar tablero' },
        { key: 'Ctrl + H', action: 'Ver esta guía' },
        { key: 'Tab', action: 'Navegar entre elementos' }
    ];

    const bestPractices = [
        {
            title: 'Comunicación Efectiva',
            tips: [
                'Actualiza el progreso de tus tareas regularmente',
                'Comenta en las tareas cuando tengas dudas',
                'Notifica problemas o bloqueos inmediatamente',
                'Usa descripciones claras al crear tareas'
            ]
        },
        {
            title: 'Gestión del Tiempo',
            tips: [
                'Estima tiempos de manera realista',
                'Divide tareas grandes en subtareas más pequeñas',
                'Revisa tus tareas diariamente',
                'Prioriza tareas según su urgencia e importancia'
            ]
        },
        {
            title: 'Calidad del Código',
            tips: [
                'Revisa tu código antes de mover a "En Revisión"',
                'Documenta código complejo',
                'Sigue los estándares de codificación del proyecto',
                'Prueba tu código en diferentes escenarios'
            ]
        },
        {
            title: 'Colaboración',
            tips: [
                'Ayuda a compañeros cuando tengas tiempo disponible',
                'Comparte conocimiento y mejores prácticas',
                'Participa activamente en las revisiones de código',
                'Respeta los tiempos y compromisos del equipo'
            ]
        }
    ];

    const getStepContent = (stepIndex) => {
        switch (stepIndex) {
            case 0:
                return (
                    <Card title="Acceso al Sistema" className="step-card">
                        <div className="step-content">
                            <p>Para comenzar a usar el tablero:</p>
                            <ol>
                                <li>Visita la URL del sistema proporcionada por tu administrador</li>
                                <li>Ingresa tu email y contraseña asignados</li>
                                <li>Si es tu primer acceso, cambia tu contraseña</li>
                                <li>Verifica que tu rol esté correctamente asignado</li>
                            </ol>
                            <div className="info-box">
                                <i className="pi pi-info-circle"></i>
                                <span>¿Olvidaste tu contraseña? Contacta al administrador del sistema</span>
                            </div>
                        </div>
                    </Card>
                );
            case 1:
                return (
                    <Card title="Conoce tu Rol" className="step-card">
                        <div className="step-content">
                            <p>Existen tres tipos de roles principales:</p>
                            <div className="roles-grid">
                                {rolesData.map((roleData, index) => (
                                    <Card key={index} className="role-card">
                                        <h4>{roleData.role}</h4>
                                        <div className="permissions">
                                            <h5>Permisos:</h5>
                                            <ul>
                                                {roleData.permissions.slice(0, 3).map((permission, idx) => (
                                                    <li key={idx}>{permission}</li>
                                                ))}
                                            </ul>
                                            {roleData.permissions.length > 3 && (
                                                <p><small>+{roleData.permissions.length - 3} permisos más</small></p>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </Card>
                );
            case 2:
                return (
                    <Card title="Explora el Tablero" className="step-card">
                        <div className="step-content">
                            <p>El tablero está organizado en 5 columnas que representan el flujo de trabajo:</p>
                            <div className="workflow-demo">
                                {workflowSteps.map((step, index) => (
                                    <div key={index} className="workflow-step">
                                        <div 
                                            className="step-header"
                                            style={{ borderColor: step.color }}
                                        >
                                            <i className={step.icon} style={{ color: step.color }}></i>
                                            <h4>{step.title}</h4>
                                        </div>
                                        <p>{step.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                );
            case 3:
                return (
                    <Card title="Gestiona Tareas" className="step-card">
                        <div className="step-content">
                            <p>Aprende las operaciones básicas con tareas:</p>
                            <div className="operations-grid">
                                <div className="operation">
                                    <i className="pi pi-plus-circle"></i>
                                    <h5>Crear Tarea</h5>
                                    <p>Solo administradores y jefes pueden crear nuevas tareas</p>
                                </div>
                                <div className="operation">
                                    <i className="pi pi-arrow-right"></i>
                                    <h5>Mover Tarea</h5>
                                    <p>Arrastra y suelta para cambiar el estado de la tarea</p>
                                </div>
                                <div className="operation">
                                    <i className="pi pi-pencil"></i>
                                    <h5>Editar Tarea</h5>
                                    <p>Haz clic en una tarea para ver detalles y editarla</p>
                                </div>
                                <div className="operation">
                                    <i className="pi pi-users"></i>
                                    <h5>Asignar</h5>
                                    <p>Asigna tareas a desarrolladores según sus habilidades</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                );
            case 4:
                return (
                    <Card title="Colabora Efectivamente" className="step-card">
                        <div className="step-content">
                            <p>Maximiza la colaboración en equipo:</p>
                            <div className="collaboration-tips">
                                <div className="tip">
                                    <i className="pi pi-comments"></i>
                                    <div>
                                        <h5>Comunicación</h5>
                                        <p>Mantén informado al equipo sobre el progreso de tus tareas</p>
                                    </div>
                                </div>
                                <div className="tip">
                                    <i className="pi pi-share-alt"></i>
                                    <div>
                                        <h5>Colaboradores</h5>
                                        <p>Añade colaboradores para tareas complejas o para mentoring</p>
                                    </div>
                                </div>
                                <div className="tip">
                                    <i className="pi pi-exclamation-triangle"></i>
                                    <div>
                                        <h5>Bloqueos</h5>
                                        <p>Reporta inmediatamente cualquier impedimento o duda</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                );
            default:
                return null;
        }
    };

    return (
        <div className="tablero-guide">
            <div className="guide-header">
                <h1>Guía de Usuario - Tablero</h1>
                <p>Aprende a usar el sistema de gestión de tareas de manera efectiva</p>
            </div>

            <TabView className="guide-tabs">
                <TabPanel header="Inicio Rápido" leftIcon="pi pi-bolt">
                    <div className="quick-start">
                        <Steps 
                            model={quickStartSteps} 
                            activeIndex={activeStep}
                            onSelect={(e) => setActiveStep(e.index)}
                            readOnly={false}
                        />
                        
                        <div className="step-content-container">
                            {getStepContent(activeStep)}
                        </div>

                        <div className="step-navigation">
                            <Button 
                                label="Anterior" 
                                icon="pi pi-chevron-left"
                                className="p-button-outlined"
                                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                                disabled={activeStep === 0}
                            />
                            <Button 
                                label="Siguiente" 
                                icon="pi pi-chevron-right"
                                iconPos="right"
                                onClick={() => setActiveStep(Math.min(quickStartSteps.length - 1, activeStep + 1))}
                                disabled={activeStep === quickStartSteps.length - 1}
                            />
                        </div>
                    </div>
                </TabPanel>

                <TabPanel header="Flujo de Trabajo" leftIcon="pi pi-sitemap">
                    <div className="workflow-section">
                        <h3>Estados de las Tareas</h3>
                        <p>Comprende cómo fluyen las tareas a través del sistema:</p>
                        
                        <Timeline 
                            value={workflowSteps}
                            align="alternate"
                            className="workflow-timeline"
                            content={(item) => (
                                <Card className="timeline-card">
                                    <div className="timeline-header">
                                        <i className={item.icon} style={{ color: item.color }}></i>
                                        <h4>{item.title}</h4>
                                    </div>
                                    <p>{item.description}</p>
                                    
                                    {item.status === 'inProgress' && (
                                        <div className="special-note">
                                            <i className="pi pi-exclamation-triangle"></i>
                                            <small>Los cambios desde esta columna requieren aprobación del jefe</small>
                                        </div>
                                    )}
                                </Card>
                            )}
                        />

                        <Card className="whatsapp-info">
                            <h4><i className="pi pi-whatsapp"></i> Notificaciones de WhatsApp</h4>
                            <p>El sistema envía notificaciones automáticas cuando:</p>
                            <ul>
                                <li>Un desarrollador solicita cambiar de tarea</li>
                                <li>Se asigna una nueva tarea crítica</li>
                                <li>Una tarea está próxima a vencer</li>
                                <li>Se requiere aprobación del jefe</li>
                            </ul>
                        </Card>
                    </div>
                </TabPanel>

                <TabPanel header="Roles y Permisos" leftIcon="pi pi-users">
                    <div className="roles-section">
                        <h3>Roles del Sistema</h3>
                        <p>Cada rol tiene diferentes permisos y responsabilidades:</p>
                        
                        <Accordion multiple>
                            {rolesData.map((roleData, index) => (
                                <AccordionTab key={index} header={roleData.role}>
                                    <div className="role-details">
                                        <div className="permissions-section">
                                            <h5><i className="pi pi-check"></i> Permisos</h5>
                                            <ul className="permissions-list">
                                                {roleData.permissions.map((permission, idx) => (
                                                    <li key={idx}>
                                                        <i className="pi pi-check-circle"></i>
                                                        {permission}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        
                                        <div className="restrictions-section">
                                            <h5><i className="pi pi-times"></i> Restricciones</h5>
                                            <ul className="restrictions-list">
                                                {roleData.restrictions.map((restriction, idx) => (
                                                    <li key={idx}>
                                                        <i className="pi pi-info-circle"></i>
                                                        {restriction}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </AccordionTab>
                            ))}
                        </Accordion>
                    </div>
                </TabPanel>

                <TabPanel header="Mejores Prácticas" leftIcon="pi pi-star">
                    <div className="practices-section">
                        <h3>Consejos para el Éxito</h3>
                        
                        <div className="practices-grid">
                            {bestPractices.map((practice, index) => (
                                <Card key={index} className="practice-card">
                                    <h4>{practice.title}</h4>
                                    <ul>
                                        {practice.tips.map((tip, idx) => (
                                            <li key={idx}>{tip}</li>
                                        ))}
                                    </ul>
                                </Card>
                            ))}
                        </div>

                        <Card className="shortcuts-card">
                            <h4>Atajos de Teclado</h4>
                            <div className="shortcuts-grid">
                                {shortcuts.map((shortcut, index) => (
                                    <div key={index} className="shortcut">
                                        <Chip label={shortcut.key} className="shortcut-key" />
                                        <span>{shortcut.action}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </TabPanel>

                <TabPanel header="Preguntas Frecuentes" leftIcon="pi pi-question-circle">
                    <div className="faq-section">
                        <h3>Preguntas Frecuentes</h3>
                        
                        <Accordion>
                            {faqData.map((faq, index) => (
                                <AccordionTab key={index} header={faq.question}>
                                    <p>{faq.answer}</p>
                                </AccordionTab>
                            ))}
                        </Accordion>

                        <Card className="support-card">
                            <h4>¿Necesitas más ayuda?</h4>
                            <p>Si no encuentras la respuesta a tu pregunta, contacta al equipo de soporte:</p>
                            <div className="support-contacts">
                                <div className="contact">
                                    <i className="pi pi-envelope"></i>
                                    <span>soporte@empresa.com</span>
                                </div>
                                <div className="contact">
                                    <i className="pi pi-phone"></i>
                                    <span>+57 300 123 4567</span>
                                </div>
                                <div className="contact">
                                    <i className="pi pi-whatsapp"></i>
                                    <span>WhatsApp: +57 300 123 4567</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </TabPanel>
            </TabView>
        </div>
    );
};

export default TableroGuide;
