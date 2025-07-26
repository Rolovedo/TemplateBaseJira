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
import { Toast } from 'primereact/toast';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Layout from '@components/layout/Layout'; // ← IMPORTAR LAYOUT
import authService from '../../services/auth.service';
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

    const [developers] = useState([
        { id: 1, name: 'Juan Pérez', email: 'juan@empresa.com', avatar: 'JP' },
        { id: 2, name: 'María García', email: 'maria@empresa.com', avatar: 'MG' },
        { id: 3, name: 'Carlos López', email: 'carlos@empresa.com', avatar: 'CL' }
    ]);

    const [showTaskDialog, setShowTaskDialog] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [selectedColumn, setSelectedColumn] = useState('backlog');

    // Estados del formulario
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        assignee: null,
        priority: null,
        dueDate: null,
        category: null,
        estimatedHours: 0
    });

    // Opciones para dropdowns
    const priorityOptions = [
        { label: 'Alta', value: 'high', color: '#e74c3c' },
        { label: 'Media', value: 'medium', color: '#f39c12' },
        { label: 'Baja', value: 'low', color: '#27ae60' }
    ];

    const categoryOptions = [
        { label: 'Frontend', value: 'frontend' },
        { label: 'Backend', value: 'backend' },
        { label: 'Database', value: 'database' },
        { label: 'Testing', value: 'testing' },
        { label: 'DevOps', value: 'devops' }
    ];

    // Funciones de utilidad
    const showToastMessage = (severity, summary, detail) => {
        if (toast.current) {
            toast.current.show({ severity, summary, detail });
        }
    };

    // Cargar tareas (simuladas para desarrollo)
    const loadTasks = useCallback(async () => {
        try {
            console.log('📡 Cargando tareas simuladas...');
            
            const mockTasks = {
                backlog: [
                    {
                        id: 1,
                        title: 'Configurar autenticación JWT',
                        description: 'Implementar sistema de autenticación con tokens JWT',
                        assignee: developers[0],
                        priority: 'high',
                        dueDate: new Date('2024-02-15'),
                        category: 'backend',
                        estimatedHours: 8,
                        createdBy: 'Admin',
                        createdAt: new Date()
                    },
                    {
                        id: 2,
                        title: 'Diseñar interfaz del tablero',
                        description: 'Crear mockups y prototipos de la interfaz del tablero Kanban',
                        assignee: developers[1],
                        priority: 'medium',
                        dueDate: new Date('2024-02-20'),
                        category: 'frontend',
                        estimatedHours: 12,
                        createdBy: 'Admin',
                        createdAt: new Date()
                    }
                ],
                todo: [
                    {
                        id: 3,
                        title: 'Conectar con base de datos',
                        description: 'Establecer conexión con MySQL y crear modelos',
                        assignee: developers[2],
                        priority: 'high',
                        dueDate: new Date('2024-02-10'),
                        category: 'database',
                        estimatedHours: 6,
                        createdBy: 'Admin',
                        createdAt: new Date()
                    }
                ],
                inProgress: [],
                review: [],
                done: []
            };

            setTasks(mockTasks);
            console.log('✅ Tareas simuladas cargadas');
            
        } catch (error) {
            console.error('Error cargando tareas:', error);
            showToastMessage('error', 'Error', 'No se pudieron cargar las tareas');
        }
    }, [developers]);

    // Crear nueva tarea
    const createTask = async () => {
        try {
            console.log('🔍 Creando nueva tarea...');
            
            if (!newTask.title || !newTask.assignee) {
                showToastMessage('warn', 'Campos Requeridos', 'Título y asignado son obligatorios');
                return;
            }

            const taskToCreate = {
                id: Date.now(),
                title: newTask.title,
                description: newTask.description,
                assignee: newTask.assignee,
                priority: newTask.priority?.value || 'medium',
                dueDate: newTask.dueDate,
                category: newTask.category?.value,
                estimatedHours: newTask.estimatedHours || 0,
                createdBy: authService.getTableroUser()?.nombre || 'Usuario',
                createdAt: new Date()
            };

            setTasks(prevTasks => ({
                ...prevTasks,
                [selectedColumn]: [...prevTasks[selectedColumn], taskToCreate]
            }));

            setNewTask({
                title: '',
                description: '',
                assignee: null,
                priority: null,
                dueDate: null,
                category: null,
                estimatedHours: 0
            });

            setShowTaskDialog(false);
            showToastMessage('success', 'Tarea Creada', 'La tarea se ha creado exitosamente');
            
            console.log('✅ Tarea creada exitosamente:', taskToCreate);

        } catch (error) {
            console.error('Error creando tarea:', error);
            showToastMessage('error', 'Error', 'No se pudo crear la tarea');
        }
    };

    // Manejar drag and drop
    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        const start = tasks[source.droppableId];
        const finish = tasks[destination.droppableId];

        if (start === finish) {
            const newTaskIds = Array.from(start);
            const task = newTaskIds.find(t => t.id.toString() === draggableId);
            newTaskIds.splice(source.index, 1);
            newTaskIds.splice(destination.index, 0, task);

            setTasks(prev => ({
                ...prev,
                [source.droppableId]: newTaskIds
            }));
        } else {
            const startTaskIds = Array.from(start);
            const task = startTaskIds.find(t => t.id.toString() === draggableId);
            startTaskIds.splice(source.index, 1);

            const finishTaskIds = Array.from(finish);
            finishTaskIds.splice(destination.index, 0, task);

            setTasks(prev => ({
                ...prev,
                [source.droppableId]: startTaskIds,
                [destination.droppableId]: finishTaskIds
            }));

            showToastMessage('success', 'Tarea Movida', `Tarea movida a ${destination.droppableId}`);
        }
    };

    useEffect(() => {
        console.log("🎯 TABLERO KANBAN CARGADO EXITOSAMENTE!");
        
        if (!authService.isTableroAuthenticated()) {
            if (!authService.useExistingPontoAuth()) {
                authService.setDevelopmentAuth();
            }
        }
        
        loadTasks();
    }, [loadTasks]);

    const columns = [
        { id: 'backlog', title: 'Backlog', color: '#6c757d' },
        { id: 'todo', title: 'Por Hacer', color: '#007bff' },
        { id: 'inProgress', title: 'En Progreso', color: '#ffc107' },
        { id: 'review', title: 'En Revisión', color: '#17a2b8' },
        { id: 'done', title: 'Completado', color: '#28a745' }
    ];

    const renderTaskCard = (task, index) => (
        <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
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
                                severity={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'success'}
                            />
                        </div>
                        
                        {task.description && (
                            <p className="task-description">{task.description}</p>
                        )}
                        
                        <div className="task-footer">
                            <div className="task-assignee">
                                <Avatar 
                                    label={task.assignee?.avatar || task.assignee?.name?.substring(0, 2) || 'U'} 
                                    size="small" 
                                    style={{ backgroundColor: '#007bff' }}
                                />
                                <span>{task.assignee?.name || 'Sin asignar'}</span>
                            </div>
                            
                            {task.category && (
                                <Chip label={task.category} className="category-chip" />
                            )}
                        </div>
                        
                        {task.estimatedHours > 0 && (
                            <div className="task-hours">
                                <i className="pi pi-clock"></i>
                                <span>{task.estimatedHours}h</span>
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </Draggable>
    );

    // ← ENVOLVER TODO EL CONTENIDO EN EL LAYOUT
    return (
        <Layout>
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

                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="board-columns">
                        {columns.map(column => (
                            <div key={column.id} className="board-column">
                                <div className="column-header" style={{ borderTopColor: column.color }}>
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

                <Dialog
                    visible={showTaskDialog}
                    style={{ width: '600px' }}
                    header={editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
                    modal
                    onHide={() => {
                        setShowTaskDialog(false);
                        setEditingTask(null);
                    }}
                >
                    <div className="task-form">
                        <div className="p-field">
                            <label htmlFor="title">Título *</label>
                            <InputText
                                id="title"
                                value={newTask.title}
                                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Ingresa el título de la tarea"
                            />
                        </div>

                        <div className="p-field">
                            <label htmlFor="description">Descripción</label>
                            <InputTextarea
                                id="description"
                                value={newTask.description}
                                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                                placeholder="Describe la tarea"
                            />
                        </div>

                        <div className="p-field">
                            <label htmlFor="assignee">Asignado a *</label>
                            <Dropdown
                                id="assignee"
                                value={newTask.assignee}
                                options={developers}
                                onChange={(e) => setNewTask(prev => ({ ...prev, assignee: e.value }))}
                                optionLabel="name"
                                placeholder="Selecciona un desarrollador"
                            />
                        </div>

                        <div className="p-field">
                            <label htmlFor="priority">Prioridad</label>
                            <Dropdown
                                id="priority"
                                value={newTask.priority}
                                options={priorityOptions}
                                onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.value }))}
                                optionLabel="label"
                                placeholder="Selecciona prioridad"
                            />
                        </div>

                        <div className="p-field">
                            <label htmlFor="category">Categoría</label>
                            <Dropdown
                                id="category"
                                value={newTask.category}
                                options={categoryOptions}
                                onChange={(e) => setNewTask(prev => ({ ...prev, category: e.value }))}
                                optionLabel="label"
                                placeholder="Selecciona categoría"
                            />
                        </div>

                        <div className="p-field">
                            <label htmlFor="estimatedHours">Horas Estimadas</label>
                            <InputText
                                id="estimatedHours"
                                type="number"
                                value={newTask.estimatedHours}
                                onChange={(e) => setNewTask(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 0 }))}
                                placeholder="0"
                            />
                        </div>

                        <div className="p-field">
                            <label htmlFor="dueDate">Fecha de Vencimiento</label>
                            <Calendar
                                id="dueDate"
                                value={newTask.dueDate}
                                onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.value }))}
                                showIcon
                                dateFormat="dd/mm/yy"
                            />
                        </div>

                        <div className="form-buttons">
                            <Button 
                                label="Cancelar" 
                                className="p-button-secondary"
                                onClick={() => setShowTaskDialog(false)}
                            />
                            <Button 
                                label={editingTask ? 'Actualizar' : 'Crear Tarea'} 
                                className="p-button-success"
                                onClick={createTask}
                            />
                        </div>
                    </div>
                </Dialog>
            </div>
        </Layout>
    );
};

export default TableroBoard;
