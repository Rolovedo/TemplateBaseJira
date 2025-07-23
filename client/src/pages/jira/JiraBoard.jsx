import React, { useState, useEffect, useCallback } from 'react';
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
import { useToast } from '@context/toast/ToastContext';
import './JiraBoard.scss';

const JiraBoard = () => {
    const { showToast } = useToast();
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

    const loadTasks = useCallback(async () => {
        try {
            // Aquí cargarías las tareas desde la API
            // const response = await fetch('/api/jira/tasks');
            // const data = await response.json();
            // setTasks(data);
            
            // Datos de ejemplo
            setTasks({
                backlog: [
                    {
                        id: '1',
                        title: 'Implementar autenticación',
                        description: 'Crear sistema de login y registro',
                        assignee: { id: 1, name: 'Juan Pérez', avatar: 'JP' },
                        priority: 'high',
                        dueDate: new Date('2024-08-15'),
                        category: 'backend',
                        estimatedHours: 16,
                        createdDate: new Date(),
                        collaborators: []
                    }
                ],
                todo: [],
                inProgress: [],
                review: [],
                done: []
            });
        } catch (error) {
            console.error('Error loading tasks:', error);
            showToast('error', 'Error', 'No se pudieron cargar las tareas');
        }
    }, [showToast]);

    const loadDevelopers = useCallback(async () => {
        try {
            // Aquí cargarías los desarrolladores desde la API
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
            // Aquí enviarías la notificación de WhatsApp
            // const message = `🔄 CAMBIO DE TAREA SOLICITADO\n\nDesarrollador: ${task.assignee?.name}\nTarea: ${task.title}\n\n¿Aprobar el cambio?`;
            
            // await fetch('/api/whatsapp/send-notification', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ message, taskId: task.id })
            // });
            
            showToast('info', 'Notificación Enviada', 'Se ha notificado al jefe de programadores');
        } catch (error) {
            console.error('Error sending WhatsApp notification:', error);
        }
    };

    const updateTaskStatus = async (taskId, newStatus) => {
        try {
            // await fetch(`/api/jira/tasks/${taskId}/status`, {
            //     method: 'PUT',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ status: newStatus })
            // });
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
                backlog: [...prev.backlog, task]
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

    const TaskCard = ({ task, index }) => (
        <Draggable key={task.id} draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <Card
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`task-card ${snapshot.isDragging ? 'dragging' : ''}`}
                    style={{
                        ...provided.draggableProps.style,
                        marginBottom: '8px'
                    }}
                >
                    <div className="task-header">
                        <h4>{task.title}</h4>
                        <Badge 
                            value={task.priority} 
                            severity={getPriorityColor(task.priority)} 
                            size="small" 
                        />
                    </div>
                    
                    <p className="task-description">{task.description}</p>
                    
                    <div className="task-meta">
                        <Chip label={task.category} className="category-chip" />
                        <span className="estimated-hours">{task.estimatedHours}h</span>
                    </div>
                    
                    <div className="task-footer">
                        <div className="assignee">
                            <Avatar label={task.assignee?.avatar} size="small" />
                            <span>{task.assignee?.name}</span>
                        </div>
                        {task.dueDate && (
                            <span className="due-date">
                                {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </Card>
            )}
        </Draggable>
    );

    return (
        <div className="jira-board">
            <div className="board-header">
                <h2>Tablero de Desarrollo</h2>
                <div className="header-actions">
                    <Button 
                        icon="pi pi-question-circle" 
                        label="Guía de Uso" 
                        className="p-button-outlined p-button-info"
                        onClick={() => window.open('/jira-guide', '_blank')}
                    />
                    <Button 
                        icon="pi pi-plus" 
                        label="Nueva Tarea" 
                        onClick={() => setShowTaskDialog(true)}
                    />
                </div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="board-columns">
                    {columns.map(column => (
                        <div key={column.id} className="board-column">
                            <div 
                                className="column-header"
                                style={{ borderColor: column.color }}
                            >
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
                                        {tasks[column.id]?.map((task, index) => (
                                            <TaskCard key={task.id} task={task} index={index} />
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>

            {/* Dialog para crear nueva tarea */}
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

            <Toast ref={showToast} />
        </div>
    );
};

export default JiraBoard;
