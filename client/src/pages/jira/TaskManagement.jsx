import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputTextarea } from 'primereact/inputtextarea';
import { Badge } from 'primereact/badge';
import { Avatar } from 'primereact/avatar';
import { AvatarGroup } from 'primereact/avatargroup';
import { Chip } from 'primereact/chip';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import { Toolbar } from 'primereact/toolbar';
// import { FileUpload } from 'primereact/fileupload';
import { confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { MultiSelect } from 'primereact/multiselect';
import { useToast } from '@context/toast/ToastContext';
import './TaskManagement.scss';

const TaskManagement = () => {
    const { showToast } = useToast();
    const toast = useRef(null);
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [showTaskDialog, setShowTaskDialog] = useState(false);
    const [showCollaboratorsDialog, setShowCollaboratorsDialog] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    
    const [taskData, setTaskData] = useState({
        id: null,
        title: '',
        description: '',
        assignee: null,
        collaborators: [],
        priority: null,
        status: 'backlog',
        dueDate: null,
        category: '',
        estimatedHours: 0,
        actualHours: 0,
        progress: 0,
        attachments: []
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

    const [statuses] = useState([
        { label: 'Backlog', value: 'backlog' },
        { label: 'Por Hacer', value: 'todo' },
        { label: 'En Progreso', value: 'inProgress' },
        { label: 'En Revisión', value: 'review' },
        { label: 'Completado', value: 'done' }
    ]);

    const loadTasks = useCallback(async () => {
        try {
            // Aquí cargarías las tareas desde la API
            const mockTasks = [
                {
                    id: 1,
                    title: 'Implementar autenticación JWT',
                    description: 'Crear sistema de autenticación usando JWT tokens',
                    assignee: { id: 1, name: 'Juan Pérez', avatar: 'JP', role: 'Backend Developer' },
                    collaborators: [
                        { id: 2, name: 'María García', avatar: 'MG' },
                        { id: 3, name: 'Carlos López', avatar: 'CL' }
                    ],
                    priority: 'high',
                    status: 'inProgress',
                    dueDate: new Date('2024-08-15'),
                    category: 'backend',
                    estimatedHours: 24,
                    actualHours: 16,
                    progress: 65,
                    createdDate: new Date('2024-07-20'),
                    attachments: ['auth-requirements.pdf', 'api-specs.json']
                },
                {
                    id: 2,
                    title: 'Diseñar interfaz de usuario',
                    description: 'Crear mockups y componentes para la nueva interfaz',
                    assignee: { id: 2, name: 'María García', avatar: 'MG', role: 'Frontend Developer' },
                    collaborators: [],
                    priority: 'medium',
                    status: 'todo',
                    dueDate: new Date('2024-08-20'),
                    category: 'frontend',
                    estimatedHours: 32,
                    actualHours: 0,
                    progress: 0,
                    createdDate: new Date('2024-07-22'),
                    attachments: []
                }
            ];
            setTasks(mockTasks);
            setFilteredTasks(mockTasks);
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    }, []);

    const loadDevelopers = useCallback(async () => {
        try {
            setDevelopers([
                { id: 1, name: 'Juan Pérez', avatar: 'JP', role: 'Backend Developer' },
                { id: 2, name: 'María García', avatar: 'MG', role: 'Frontend Developer' },
                { id: 3, name: 'Carlos López', avatar: 'CL', role: 'Full Stack Developer' },
                { id: 4, name: 'Ana Rodríguez', avatar: 'AR', role: 'DevOps Engineer' },
                { id: 5, name: 'Luis Martínez', avatar: 'LM', role: 'QA Tester' }
            ]);
        } catch (error) {
            console.error('Error loading developers:', error);
        }
    }, []);

    const filterTasks = useCallback(() => {
        if (!globalFilter.trim()) {
            setFilteredTasks(tasks);
            return;
        }

        const filtered = tasks.filter(task => 
            task.title.toLowerCase().includes(globalFilter.toLowerCase()) ||
            task.description.toLowerCase().includes(globalFilter.toLowerCase()) ||
            task.assignee?.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
            task.category.toLowerCase().includes(globalFilter.toLowerCase())
        );
        setFilteredTasks(filtered);
    }, [globalFilter, tasks]);

    useEffect(() => {
        loadTasks();
        loadDevelopers();
    }, [loadTasks, loadDevelopers]);

    useEffect(() => {
        filterTasks();
    }, [filterTasks]);

    const openNew = () => {
        setTaskData({
            id: null,
            title: '',
            description: '',
            assignee: null,
            collaborators: [],
            priority: null,
            status: 'backlog',
            dueDate: null,
            category: '',
            estimatedHours: 0,
            actualHours: 0,
            progress: 0,
            attachments: []
        });
        setIsEditing(false);
        setShowTaskDialog(true);
    };

    const editTask = (task) => {
        setTaskData({ ...task });
        setIsEditing(true);
        setShowTaskDialog(true);
    };

    const deleteTask = (task) => {
        confirmDialog({
            message: `¿Estás seguro de que quieres eliminar la tarea "${task.title}"?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                setTasks(prev => prev.filter(t => t.id !== task.id));
                showToast('success', 'Tarea Eliminada', 'La tarea se ha eliminado exitosamente');
            }
        });
    };

    const saveTask = async () => {
        try {
            if (!taskData.title || !taskData.assignee) {
                showToast('warn', 'Campos Requeridos', 'Título y asignado son obligatorios');
                return;
            }

            if (isEditing) {
                setTasks(prev => prev.map(task => 
                    task.id === taskData.id ? { ...taskData } : task
                ));
                showToast('success', 'Tarea Actualizada', 'La tarea se ha actualizado exitosamente');
            } else {
                const newTask = {
                    ...taskData,
                    id: Date.now(),
                    createdDate: new Date(),
                    actualHours: 0,
                    progress: 0
                };
                setTasks(prev => [...prev, newTask]);
                showToast('success', 'Tarea Creada', 'La tarea se ha creado exitosamente');
            }

            setShowTaskDialog(false);
        } catch (error) {
            console.error('Error saving task:', error);
            showToast('error', 'Error', 'No se pudo guardar la tarea');
        }
    };

    const assigneeBodyTemplate = (rowData) => {
        if (!rowData.assignee) return '-';
        
        return (
            <div className="assignee-cell">
                <Avatar label={rowData.assignee.avatar} size="small" />
                <div className="assignee-info">
                    <div className="name">{rowData.assignee.name}</div>
                    <div className="role">{rowData.assignee.role}</div>
                </div>
            </div>
        );
    };

    const collaboratorsBodyTemplate = (rowData) => {
        if (!rowData.collaborators || rowData.collaborators.length === 0) {
            return <span>-</span>;
        }

        return (
            <div className="collaborators-cell">
                <AvatarGroup>
                    {rowData.collaborators.slice(0, 3).map(collaborator => (
                        <Avatar 
                            key={collaborator.id}
                            label={collaborator.avatar} 
                            size="small"
                            title={collaborator.name}
                        />
                    ))}
                    {rowData.collaborators.length > 3 && (
                        <Avatar 
                            label={`+${rowData.collaborators.length - 3}`} 
                            size="small"
                            style={{ backgroundColor: '#9c27b0', color: '#ffffff' }}
                        />
                    )}
                </AvatarGroup>
                <Button
                    icon="pi pi-users"
                    className="p-button-text p-button-sm"
                    onClick={() => {
                        setSelectedTask(rowData);
                        setShowCollaboratorsDialog(true);
                    }}
                />
            </div>
        );
    };

    const priorityBodyTemplate = (rowData) => {
        const priority = priorities.find(p => p.value === rowData.priority);
        if (!priority) return '-';
        
        return <Badge value={priority.label} severity={priority.severity} />;
    };

    const statusBodyTemplate = (rowData) => {
        const statusObj = statuses.find(s => s.value === rowData.status);
        const getStatusSeverity = (status) => {
            switch (status) {
                case 'backlog': return 'secondary';
                case 'todo': return 'info';
                case 'inProgress': return 'warning';
                case 'review': return null;
                case 'done': return 'success';
                default: return 'secondary';
            }
        };
        
        return <Tag value={statusObj?.label} severity={getStatusSeverity(rowData.status)} />;
    };

    const progressBodyTemplate = (rowData) => {
        return (
            <div className="progress-cell">
                <ProgressBar value={rowData.progress} style={{ height: '8px' }} />
                <span className="progress-text">{rowData.progress}%</span>
            </div>
        );
    };

    const categoryBodyTemplate = (rowData) => {
        return <Chip label={rowData.category} className="category-chip" />;
    };

    const dueDateBodyTemplate = (rowData) => {
        if (!rowData.dueDate) return '-';
        
        const dueDate = new Date(rowData.dueDate);
        const today = new Date();
        const isOverdue = dueDate < today && rowData.status !== 'done';
        
        return (
            <span className={isOverdue ? 'overdue' : ''}>
                {dueDate.toLocaleDateString()}
            </span>
        );
    };

    const actionsBodyTemplate = (rowData) => {
        return (
            <div className="actions-cell">
                <Button
                    icon="pi pi-pencil"
                    className="p-button-rounded p-button-text p-button-sm"
                    onClick={() => editTask(rowData)}
                    tooltip="Editar"
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-text p-button-sm p-button-danger"
                    onClick={() => deleteTask(rowData)}
                    tooltip="Eliminar"
                />
            </div>
        );
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="toolbar-left">
                <Button 
                    label="Nueva Tarea" 
                    icon="pi pi-plus" 
                    className="p-button-success"
                    onClick={openNew} 
                />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <div className="toolbar-right">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        type="search"
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Buscar tareas..."
                    />
                </span>
            </div>
        );
    };

    return (
        <div className="task-management">
            <div className="page-header">
                <h2>Gestión de Tareas</h2>
                <p>Administra todas las tareas del proyecto</p>
            </div>

            <Toolbar 
                className="toolbar"
                left={leftToolbarTemplate} 
                right={rightToolbarTemplate}
            />

            <DataTable
                value={filteredTasks}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25]}
                className="task-table"
                globalFilter={globalFilter}
                emptyMessage="No se encontraron tareas"
                responsiveLayout="scroll"
            >
                <Column field="id" header="ID" style={{ width: '60px' }} />
                <Column field="title" header="Título" style={{ minWidth: '200px' }} />
                <Column 
                    field="assignee" 
                    header="Asignado" 
                    body={assigneeBodyTemplate}
                    style={{ minWidth: '150px' }}
                />
                <Column 
                    field="collaborators" 
                    header="Colaboradores" 
                    body={collaboratorsBodyTemplate}
                    style={{ minWidth: '150px' }}
                />
                <Column 
                    field="priority" 
                    header="Prioridad" 
                    body={priorityBodyTemplate}
                    style={{ width: '120px' }}
                />
                <Column 
                    field="status" 
                    header="Estado" 
                    body={statusBodyTemplate}
                    style={{ width: '120px' }}
                />
                <Column 
                    field="category" 
                    header="Categoría" 
                    body={categoryBodyTemplate}
                    style={{ width: '120px' }}
                />
                <Column 
                    field="progress" 
                    header="Progreso" 
                    body={progressBodyTemplate}
                    style={{ width: '120px' }}
                />
                <Column 
                    field="dueDate" 
                    header="Fecha Límite" 
                    body={dueDateBodyTemplate}
                    style={{ width: '120px' }}
                />
                <Column 
                    field="estimatedHours" 
                    header="Est. Hrs" 
                    style={{ width: '80px' }}
                />
                <Column 
                    body={actionsBodyTemplate} 
                    header="Acciones"
                    style={{ width: '100px' }}
                />
            </DataTable>

            {/* Dialog para crear/editar tarea */}
            <Dialog
                header={isEditing ? 'Editar Tarea' : 'Nueva Tarea'}
                visible={showTaskDialog}
                style={{ width: '700px' }}
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
                            label={isEditing ? 'Actualizar' : 'Crear'} 
                            icon="pi pi-check" 
                            onClick={saveTask} 
                        />
                    </div>
                }
            >
                <div className="task-form">
                    <div className="form-row">
                        <div className="p-field">
                            <label htmlFor="title">Título *</label>
                            <InputText
                                id="title"
                                value={taskData.title}
                                onChange={(e) => setTaskData({...taskData, title: e.target.value})}
                                placeholder="Ingrese el título de la tarea"
                            />
                        </div>
                    </div>

                    <div className="p-field">
                        <label htmlFor="description">Descripción</label>
                        <InputTextarea
                            id="description"
                            value={taskData.description}
                            onChange={(e) => setTaskData({...taskData, description: e.target.value})}
                            rows={3}
                            placeholder="Describa la tarea"
                        />
                    </div>

                    <div className="form-row">
                        <div className="p-field">
                            <label htmlFor="assignee">Asignado a *</label>
                            <Dropdown
                                id="assignee"
                                value={taskData.assignee}
                                options={developers}
                                onChange={(e) => setTaskData({...taskData, assignee: e.value})}
                                optionLabel="name"
                                placeholder="Seleccione un desarrollador"
                            />
                        </div>

                        <div className="p-field">
                            <label htmlFor="collaborators">Colaboradores</label>
                            <MultiSelect
                                id="collaborators"
                                value={taskData.collaborators}
                                options={developers.filter(dev => dev.id !== taskData.assignee?.id)}
                                onChange={(e) => setTaskData({...taskData, collaborators: e.value})}
                                optionLabel="name"
                                placeholder="Seleccione colaboradores"
                                display="chip"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="p-field">
                            <label htmlFor="priority">Prioridad</label>
                            <Dropdown
                                id="priority"
                                value={taskData.priority}
                                options={priorities}
                                onChange={(e) => setTaskData({...taskData, priority: e.value})}
                                optionLabel="label"
                                placeholder="Seleccione prioridad"
                            />
                        </div>

                        <div className="p-field">
                            <label htmlFor="status">Estado</label>
                            <Dropdown
                                id="status"
                                value={taskData.status}
                                options={statuses}
                                onChange={(e) => setTaskData({...taskData, status: e.value})}
                                optionLabel="label"
                                placeholder="Seleccione estado"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="p-field">
                            <label htmlFor="category">Categoría</label>
                            <Dropdown
                                id="category"
                                value={taskData.category}
                                options={categories}
                                onChange={(e) => setTaskData({...taskData, category: e.value})}
                                optionLabel="label"
                                placeholder="Seleccione categoría"
                            />
                        </div>

                        <div className="p-field">
                            <label htmlFor="dueDate">Fecha Límite</label>
                            <Calendar
                                id="dueDate"
                                value={taskData.dueDate}
                                onChange={(e) => setTaskData({...taskData, dueDate: e.value})}
                                showIcon
                                placeholder="Seleccione fecha límite"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="p-field">
                            <label htmlFor="estimatedHours">Horas Estimadas</label>
                            <InputText
                                id="estimatedHours"
                                type="number"
                                value={taskData.estimatedHours}
                                onChange={(e) => setTaskData({...taskData, estimatedHours: parseInt(e.target.value) || 0})}
                                placeholder="0"
                            />
                        </div>

                        {isEditing && (
                            <>
                                <div className="p-field">
                                    <label htmlFor="actualHours">Horas Actuales</label>
                                    <InputText
                                        id="actualHours"
                                        type="number"
                                        value={taskData.actualHours}
                                        onChange={(e) => setTaskData({...taskData, actualHours: parseInt(e.target.value) || 0})}
                                        placeholder="0"
                                    />
                                </div>

                                <div className="p-field">
                                    <label htmlFor="progress">Progreso (%)</label>
                                    <InputText
                                        id="progress"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={taskData.progress}
                                        onChange={(e) => setTaskData({...taskData, progress: parseInt(e.target.value) || 0})}
                                        placeholder="0"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </Dialog>

            {/* Dialog para gestionar colaboradores */}
            <Dialog
                header={`Colaboradores - ${selectedTask?.title}`}
                visible={showCollaboratorsDialog}
                style={{ width: '500px' }}
                onHide={() => setShowCollaboratorsDialog(false)}
            >
                {selectedTask?.collaborators && selectedTask.collaborators.length > 0 ? (
                    <div className="collaborators-list">
                        {selectedTask.collaborators.map(collaborator => (
                            <div key={collaborator.id} className="collaborator-item">
                                <Avatar label={collaborator.avatar} />
                                <span>{collaborator.name}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No hay colaboradores asignados a esta tarea.</p>
                )}
            </Dialog>

            <Toast ref={toast} />
        </div>
    );
};

export default TaskManagement;
