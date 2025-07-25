import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputTextarea } from 'primereact/inputtextarea';
import { Badge } from 'primereact/badge';
import { Avatar } from 'primereact/avatar';
import { Chip } from 'primereact/chip';
import { confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './tableroBoard.scss';

const TableroBoard = () => {
    const toast = useRef(null);

    // Estados principales
    const [tasks, setTasks] = useState({
        backlog: [],
        todo: [],
        inProgress: [],
        review: [],
        done: []
    });
    
    const [showTaskDialog, setShowTaskDialog] = useState(false);
    const [showChangeRequestDialog, setShowChangeRequestDialog] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedColumn, setSelectedColumn] = useState('backlog'); // ← AGREGAR ESTA LÍNEA
    
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        assignee: null,
        priority: null,
        dueDate: null,
        category: '',
        estimatedHours: 0
    });
    
    const [developers, setDevelopers] = useState([]);
    
    const [categories] = useState([
        { label: 'Frontend', value: 'frontend' },
        { label: 'Backend', value: 'backend' },
        { label: 'Base de Datos', value: 'database' },
        { label: 'DevOps', value: 'devops' },
        { label: 'Testing', value: 'testing' },
        { label: 'Documentación', value: 'documentation' }
    ]);
    
    const [priorities] = useState([
        { label: 'Muy Alta', value: 'very-high', severity: 'danger' },
        { label: 'Alta', value: 'high', severity: 'warning' },
        { label: 'Media', value: 'medium', severity: 'info' },
        { label: 'Baja', value: 'low', severity: 'success' }
    ]);

    const columns = [
        { id: 'backlog', title: 'Backlog', color: '#6c757d' },
        { id: 'todo', title: 'Por Hacer', color: '#17a2b8' },
        { id: 'inProgress', title: 'En Progreso', color: '#ffc107' },
        { id: 'review', title: 'En Revisión', color: '#fd7e14' },
        { id: 'done', title: 'Completado', color: '#28a745' }
    ];

    // Función para mostrar toast
    const showToast = (severity, summary, detail) => {
        if (toast.current) {
            toast.current.show({ severity, summary, detail });
        }
    };

    const loadTasks = useCallback(async () => {
        try {
            // Datos de ejemplo más llamativos
            setTasks({
                backlog: [
                    {
                        id: '1',
                        title: '🔐 Implementar autenticación',
                        description: 'Crear sistema de login y registro de usuarios',
                        assignee: { id: 1, name: 'Juan Pérez', avatar: 'JP' },
                        priority: 'high',
                        dueDate: new Date('2024-08-15'),
                        category: 'backend',
                        estimatedHours: 16,
                        createdDate: new Date(),
                        collaborators: []
                    },
                    {
                        id: '2',
                        title: '🎨 Diseñar interfaz principal',
                        description: 'Crear el diseño de la página principal del dashboard',
                        assignee: { id: 2, name: 'María García', avatar: 'MG' },
                        priority: 'medium',
                        dueDate: new Date('2024-08-20'),
                        category: 'frontend',
                        estimatedHours: 12,
                        createdDate: new Date(),
                        collaborators: []
                    },
                    {
                        id: '6',
                        title: '📱 Responsive Design',
                        description: 'Hacer que la aplicación sea responsive para móviles',
                        assignee: { id: 2, name: 'María García', avatar: 'MG' },
                        priority: 'medium',
                        dueDate: new Date('2024-08-25'),
                        category: 'frontend',
                        estimatedHours: 10,
                        createdDate: new Date(),
                        collaborators: []
                    }
                ],
                todo: [
                    {
                        id: '3',
                        title: '📊 Configurar base de datos',
                        description: 'Configurar las tablas y relaciones de la base de datos',
                        assignee: { id: 3, name: 'Carlos López', avatar: 'CL' },
                        priority: 'very-high',
                        dueDate: new Date('2024-08-10'),
                        category: 'database',
                        estimatedHours: 8,
                        createdDate: new Date(),
                        collaborators: []
                    },
                    {
                        id: '7',
                        title: '🔧 Setup CI/CD',
                        description: 'Configurar pipelines de integración continua',
                        assignee: { id: 3, name: 'Carlos López', avatar: 'CL' },
                        priority: 'high',
                        dueDate: new Date('2024-08-12'),
                        category: 'devops',
                        estimatedHours: 6,
                        createdDate: new Date(),
                        collaborators: []
                    }
                ],
                inProgress: [
                    {
                        id: '4',
                        title: '🔧 Desarrollo de API REST',
                        description: 'Implementar endpoints para el manejo de datos',
                        assignee: { id: 1, name: 'Juan Pérez', avatar: 'JP' },
                        priority: 'high',
                        dueDate: new Date('2024-08-18'),
                        category: 'backend',
                        estimatedHours: 20,
                        createdDate: new Date(),
                        collaborators: []
                    }
                ],
                review: [
                    {
                        id: '8',
                        title: '🧪 Testing de componentes',
                        description: 'Crear tests unitarios para componentes React',
                        assignee: { id: 2, name: 'María García', avatar: 'MG' },
                        priority: 'medium',
                        dueDate: new Date('2024-08-22'),
                        category: 'testing',
                        estimatedHours: 14,
                        createdDate: new Date(),
                        collaborators: []
                    }
                ],
                done: [
                    {
                        id: '5',
                        title: '✅ Configuración inicial del proyecto',
                        description: 'Configurar estructura de carpetas y dependencias',
                        assignee: { id: 3, name: 'Carlos López', avatar: 'CL' },
                        priority: 'medium',
                        dueDate: new Date('2024-08-05'),
                        category: 'devops',
                        estimatedHours: 4,
                        createdDate: new Date(),
                        collaborators: []
                    },
                    {
                        id: '9',
                        title: '📚 Documentación base',
                        description: 'Crear documentación básica del proyecto',
                        assignee: { id: 1, name: 'Juan Pérez', avatar: 'JP' },
                        priority: 'low',
                        dueDate: new Date('2024-08-07'),
                        category: 'documentation',
                        estimatedHours: 3,
                        createdDate: new Date(),
                        collaborators: []
                    }
                ]
            });
        } catch (error) {
            console.error('Error loading tasks:', error);
            showToast('error', 'Error', 'No se pudieron cargar las tareas');
        }
    }, []);

    const loadDevelopers = useCallback(async () => {
        try {
            setDevelopers([
                { id: 1, name: 'Juan Pérez', avatar: 'JP', role: 'Frontend Developer' },
                { id: 2, name: 'María García', avatar: 'MG', role: 'Backend Developer' },
                { id: 3, name: 'Carlos López', avatar: 'CL', role: 'Full Stack Developer' }
            ]);
        } catch (error) {
            console.error('Error loading developers:', error);
        }
    }, []);

    useEffect(() => {
        console.log("🎯 TABLERO KANBAN CARGADO EXITOSAMENTE!");
        console.log("📊 Componente TableroBoard renderizado correctamente");
        console.log("✅ Si ves este mensaje, el tablero está funcionando");
        
        loadTasks();
        loadDevelopers();
    }, [loadTasks, loadDevelopers]);

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const { source, destination } = result;
        
        if (source.droppableId === destination.droppableId) {
            // Reordenar dentro de la misma columna
            const column = [...tasks[source.droppableId]];
            const [removed] = column.splice(source.index, 1);
            column.splice(destination.index, 0, removed);
            
            setTasks(prev => ({
                ...prev,
                [source.droppableId]: column
            }));
        } else {
            // Mover entre columnas
            const sourceColumn = [...tasks[source.droppableId]];
            const destColumn = [...tasks[destination.droppableId]];
            const [removed] = sourceColumn.splice(source.index, 1);
            
            // Si el desarrollador quiere cambiar de tarea, solicitar confirmación
            if (source.droppableId === 'inProgress' && destination.droppableId !== 'inProgress') {
                confirmTaskChange(removed, sourceColumn, destColumn, source.droppableId, destination.droppableId);
                return;
            }
            
            destColumn.splice(destination.index, 0, removed);
            
            setTasks(prev => ({
                ...prev,
                [source.droppableId]: sourceColumn,
                [destination.droppableId]: destColumn
            }));
            
            // Actualizar estado en la base de datos
            updateTaskStatus(removed.id, destination.droppableId);
        }
    };

    const confirmTaskChange = (task, sourceColumn, destColumn, sourceId, destId) => {
        confirmDialog({
            message: '¿Estás seguro de que quieres cambiar esta tarea? Se notificará al jefe de programadores.',
            header: 'Confirmar Cambio de Tarea',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                // Enviar notificación de WhatsApp al jefe
                sendWhatsAppNotification(task);
                setSelectedTask({ ...task, sourceColumn, destColumn, sourceId, destId });
                setShowChangeRequestDialog(true);
            }
        });
    };

    const sendWhatsAppNotification = async (task) => {
        try {
            showToast('info', 'Notificación Enviada', 'Se ha notificado al jefe de programadores');
        } catch (error) {
            console.error('Error sending WhatsApp notification:', error);
        }
    };

    const updateTaskStatus = async (taskId, newStatus) => {
        try {
            console.log(`Actualizando tarea ${taskId} a estado ${newStatus}`);
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };

    const createTask = async () => {
        try {
            if (!newTask.title || !newTask.assignee) {
                showToast('warn', 'Campos Requeridos', 'Título y asignado son obligatorios');
                return;
            }

            const task = {
                ...newTask,
                id: Date.now().toString(),
                createdDate: new Date(),
                collaborators: []
            };

            setTasks(prev => ({
                ...prev,
                [selectedColumn]: [...prev[selectedColumn], task]
            }));

            setNewTask({
                title: '',
                description: '',
                assignee: null,
                priority: null,
                dueDate: null,
                category: '',
                estimatedHours: 0
            });

            setShowTaskDialog(false);
            showToast('success', 'Tarea Creada', 'La tarea se ha creado exitosamente');
        } catch (error) {
            console.error('Error creating task:', error);
            showToast('error', 'Error', 'No se pudo crear la tarea');
        }
    };

    const getPriorityColor = (priority) => {
        const priorityObj = priorities.find(p => p.value === priority);
        return priorityObj?.severity || 'info';
    };

    // FUNCIÓN renderTaskCard que faltaba
    const renderTaskCard = (task, index) => (
        <Draggable key={task.id} draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`task-card ${snapshot.isDragging ? 'dragging' : ''}`}
                >
                    <Card className="task-card-content">
                        <div className="task-header">
                            <h4 className="task-title">{task.title}</h4>
                            <Badge 
                                value={task.priority} 
                                severity={getPriorityColor(task.priority)} 
                                size="small" 
                            />
                        </div>
                        
                        {task.description && (
                            <p className="task-description">{task.description}</p>
                        )}
                        
                        <div className="task-meta">
                            <Chip label={task.category} className="category-chip" />
                            <span className="estimated-hours">{task.estimatedHours}h</span>
                        </div>
                        
                        <div className="task-footer">
                            <div className="assignee">
                                <Avatar 
                                    label={task.assignee?.avatar || task.assignee?.name?.substring(0, 2) || 'U'} 
                                    size="small" 
                                    style={{ backgroundColor: '#007bff' }}
                                />
                                <span>{task.assignee?.name || 'Sin asignar'}</span>
                            </div>
                            {task.dueDate && (
                                <span className="due-date">
                                    {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </Card>
                </div>
            )}
        </Draggable>
    );

    return (
        <div className="tablero-board">
            <Toast ref={toast} />
            
            <div className="board-header">
                <h1>
                    <span role="img" aria-label="tablero">📋</span> Tablero Kanban - PAVAS
                </h1>
                <Button 
                    label="➕ Nueva Tarea" 
                    className="p-button-success"
                    onClick={() => {
                        setSelectedColumn('backlog');
                        setShowTaskDialog(true);
                    }}
                />
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="board-columns">
                    {columns.map(column => (
                        <div key={column.id} className="board-column">
                            <div className="column-header" style={{ borderLeftColor: column.color }}>
                                <h3>{column.title}</h3>
                                <Badge value={tasks[column.id]?.length || 0} />
                            </div>
                            
                            <Droppable droppableId={column.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`column-content ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
                                    >
                                        {tasks[column.id]?.map((task, index) => 
                                            renderTaskCard(task, index)
                                        )}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>

            {/* Dialog para crear/editar tareas */}
            <Dialog
                header="Nueva Tarea"
                visible={showTaskDialog}
                style={{ width: '600px' }}
                onHide={() => setShowTaskDialog(false)}
                footer={
                    <div>
                        <Button 
                            label="Cancelar" 
                            icon="pi pi-times" 
                            className="p-button-text"
                            onClick={() => setShowTaskDialog(false)} 
                        />
                        <Button 
                            label="Crear" 
                            icon="pi pi-check" 
                            onClick={createTask} 
                        />
                    </div>
                }
            >
                <div className="task-form">
                    <div className="p-field">
                        <label htmlFor="title">Título *</label>
                        <InputText
                            id="title"
                            value={newTask.title}
                            onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                            placeholder="Ingrese el título de la tarea"
                        />
                    </div>

                    <div className="p-field">
                        <label htmlFor="description">Descripción</label>
                        <InputTextarea
                            id="description"
                            value={newTask.description}
                            onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                            rows={3}
                            placeholder="Describa la tarea"
                        />
                    </div>

                    <div className="p-field">
                        <label htmlFor="assignee">Asignado a *</label>
                        <Dropdown
                            id="assignee"
                            value={newTask.assignee}
                            options={developers}
                            onChange={(e) => setNewTask({...newTask, assignee: e.value})}
                            optionLabel="name"
                            placeholder="Seleccione un desarrollador"
                        />
                    </div>

                    <div className="p-field">
                        <label htmlFor="priority">Prioridad</label>
                        <Dropdown
                            id="priority"
                            value={newTask.priority}
                            options={priorities}
                            onChange={(e) => setNewTask({...newTask, priority: e.value})}
                            optionLabel="label"
                            placeholder="Seleccione prioridad"
                        />
                    </div>

                    <div className="p-field">
                        <label htmlFor="category">Categoría</label>
                        <Dropdown
                            id="category"
                            value={newTask.category}
                            options={categories}
                            onChange={(e) => setNewTask({...newTask, category: e.value})}
                            optionLabel="label"
                            placeholder="Seleccione categoría"
                        />
                    </div>

                    <div className="p-field">
                        <label htmlFor="dueDate">Fecha Límite</label>
                        <Calendar
                            id="dueDate"
                            value={newTask.dueDate}
                            onChange={(e) => setNewTask({...newTask, dueDate: e.value})}
                            showIcon
                            placeholder="Seleccione fecha límite"
                        />
                    </div>

                    <div className="p-field">
                        <label htmlFor="estimatedHours">Horas Estimadas</label>
                        <InputText
                            id="estimatedHours"
                            type="number"
                            value={newTask.estimatedHours}
                            onChange={(e) => setNewTask({...newTask, estimatedHours: parseInt(e.target.value) || 0})}
                            placeholder="0"
                        />
                    </div>
                </div>
            </Dialog>

            {/* Dialog para solicitud de cambio de tarea */}
            <Dialog
                header="Solicitud de Cambio de Tarea"
                visible={showChangeRequestDialog}
                style={{ width: '500px' }}
                onHide={() => setShowChangeRequestDialog(false)}
            >
                <p>Se ha enviado una notificación de WhatsApp al jefe de programadores.</p>
                <p>Esperando respuesta para aprobar o rechazar el cambio de tarea.</p>
                {selectedTask && (
                    <div className="p-mt-2 p-p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                        <strong>Tarea:</strong> {selectedTask.title}<br />
                        <strong>Asignado a:</strong> {selectedTask.assignee?.name}
                    </div>
                )}
                <div className="p-mt-3">
                    <Button 
                        label="Cerrar" 
                        className="p-button-text"
                        onClick={() => setShowChangeRequestDialog(false)} 
                    />
                </div>
            </Dialog>
        </div>
    );
};

export default TableroBoard;
