import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from 'primereact/card';
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
import { ProgressBar } from 'primereact/progressbar';
import { Splitter, SplitterPanel } from 'primereact/splitter';
// import { TreeTable } from 'primereact/treetable';
// import { Column } from 'primereact/column';
import { confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { MultiSelect } from 'primereact/multiselect';
// import { Slider } from 'primereact/slider';
import { useToast } from '../../context/toast/ToastContext';
import './TaskAssignment.scss';

const TaskAssignment = () => {
    const { showSuccess, showError, showInfo, showWarn } = useToast();
    const toast = useRef(null);
    const [developers, setDevelopers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [selectedDeveloper, setSelectedDeveloper] = useState(null);
    const [showAssignDialog, setShowAssignDialog] = useState(false);
    const [showReassignDialog, setShowReassignDialog] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [filterCriteria, setFilterCriteria] = useState({
        status: '',
        priority: '',
        category: '',
        assignee: null
    });

    const [assignmentData, setAssignmentData] = useState({
        taskId: null,
        assigneeId: null,
        collaborators: [],
        priority: null,
        dueDate: null,
        estimatedHours: 0,
        notes: ''
    });

    const [priorities] = useState([
        { label: 'Muy Alta', value: 'very-high', severity: 'danger', weight: 4 },
        { label: 'Alta', value: 'high', severity: 'warning', weight: 3 },
        { label: 'Media', value: 'medium', severity: 'info', weight: 2 },
        { label: 'Baja', value: 'low', severity: 'success', weight: 1 }
    ]);

    const [categories] = useState([
        { label: 'Frontend', value: 'frontend' },
        { label: 'Backend', value: 'backend' },
        { label: 'Base de Datos', value: 'database' },
        { label: 'DevOps', value: 'devops' },
        { label: 'Testing', value: 'testing' },
        { label: 'Documentación', value: 'documentation' }
    ]);

    const [statuses] = useState([
        { label: 'Backlog', value: 'backlog' },
        { label: 'Por Hacer', value: 'todo' },
        { label: 'En Progreso', value: 'inProgress' },
        { label: 'En Revisión', value: 'review' },
        { label: 'Completado', value: 'done' }
    ]);

    const applyFilters = useCallback(() => {
        let filtered = [...tasks];

        if (filterCriteria.status) {
            filtered = filtered.filter(task => task.status === filterCriteria.status);
        }

        if (filterCriteria.priority) {
            filtered = filtered.filter(task => task.priority === filterCriteria.priority);
        }

        if (filterCriteria.category) {
            filtered = filtered.filter(task => task.category === filterCriteria.category);
        }

        if (filterCriteria.assignee) {
            if (filterCriteria.assignee === 'unassigned') {
                filtered = filtered.filter(task => !task.assignee);
            } else {
                filtered = filtered.filter(task => task.assignee?.id === filterCriteria.assignee);
            }
        }

        setFilteredTasks(filtered);
    }, [filterCriteria, tasks]);

    useEffect(() => {
        loadDevelopers();
        loadTasks();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    const loadDevelopers = async () => {
        try {
            const mockDevelopers = [
                {
                    id: 1,
                    name: 'Juan Pérez',
                    avatar: 'JP',
                    role: 'Backend Developer',
                    level: 'senior',
                    skills: ['JavaScript', 'Node.js', 'MySQL', 'AWS'],
                    workload: 32,
                    maxCapacity: 40,
                    efficiency: 0.85,
                    currentTasks: 3,
                    avgTaskTime: 2.5
                },
                {
                    id: 2,
                    name: 'María García',
                    avatar: 'MG',
                    role: 'Frontend Developer',
                    level: 'semi-senior',
                    skills: ['React', 'TypeScript', 'CSS', 'Testing'],
                    workload: 28,
                    maxCapacity: 40,
                    efficiency: 0.92,
                    currentTasks: 2,
                    avgTaskTime: 3.1
                },
                {
                    id: 3,
                    name: 'Carlos López',
                    avatar: 'CL',
                    role: 'Full Stack Developer',
                    level: 'senior',
                    skills: ['React', 'Node.js', 'MongoDB', 'Docker'],
                    workload: 35,
                    maxCapacity: 40,
                    efficiency: 0.78,
                    currentTasks: 4,
                    avgTaskTime: 2.8
                },
                {
                    id: 4,
                    name: 'Ana Rodríguez',
                    avatar: 'AR',
                    role: 'DevOps Engineer',
                    level: 'senior',
                    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
                    workload: 20,
                    maxCapacity: 40,
                    efficiency: 0.95,
                    currentTasks: 2,
                    avgTaskTime: 1.9
                },
                {
                    id: 5,
                    name: 'Luis Martínez',
                    avatar: 'LM',
                    role: 'QA Tester',
                    level: 'junior',
                    skills: ['Testing', 'Selenium', 'Jest', 'Cypress'],
                    workload: 25,
                    maxCapacity: 40,
                    efficiency: 0.88,
                    currentTasks: 2,
                    avgTaskTime: 1.5
                }
            ];
            setDevelopers(mockDevelopers);
        } catch (error) {
            console.error('Error loading developers:', error);
        }
    };

    const loadTasks = async () => {
        try {
            const mockTasks = [
                {
                    id: 1,
                    title: 'Implementar API de autenticación',
                    description: 'Desarrollar endpoints para login, registro y gestión de sesiones',
                    assignee: { id: 1, name: 'Juan Pérez', avatar: 'JP' },
                    collaborators: [],
                    priority: 'high',
                    status: 'inProgress',
                    category: 'backend',
                    dueDate: new Date('2024-08-15'),
                    estimatedHours: 20,
                    actualHours: 12,
                    progress: 60,
                    requiredSkills: ['Node.js', 'JWT', 'MySQL'],
                    createdDate: new Date('2024-07-20')
                },
                {
                    id: 2,
                    title: 'Diseñar dashboard de administración',
                    description: 'Crear interfaz para gestión de usuarios y configuración',
                    assignee: null,
                    collaborators: [],
                    priority: 'medium',
                    status: 'backlog',
                    category: 'frontend',
                    dueDate: new Date('2024-08-25'),
                    estimatedHours: 32,
                    actualHours: 0,
                    progress: 0,
                    requiredSkills: ['React', 'CSS', 'UI/UX'],
                    createdDate: new Date('2024-07-22')
                },
                {
                    id: 3,
                    title: 'Configurar CI/CD pipeline',
                    description: 'Implementar pipeline automatizado para despliegues',
                    assignee: { id: 4, name: 'Ana Rodríguez', avatar: 'AR' },
                    collaborators: [{ id: 3, name: 'Carlos López', avatar: 'CL' }],
                    priority: 'very-high',
                    status: 'todo',
                    category: 'devops',
                    dueDate: new Date('2024-08-10'),
                    estimatedHours: 16,
                    actualHours: 0,
                    progress: 0,
                    requiredSkills: ['Docker', 'Jenkins', 'AWS'],
                    createdDate: new Date('2024-07-18')
                },
                {
                    id: 4,
                    title: 'Escribir tests unitarios',
                    description: 'Crear suite de tests para módulos principales',
                    assignee: null,
                    collaborators: [],
                    priority: 'low',
                    status: 'backlog',
                    category: 'testing',
                    dueDate: new Date('2024-09-01'),
                    estimatedHours: 24,
                    actualHours: 0,
                    progress: 0,
                    requiredSkills: ['Jest', 'Testing', 'JavaScript'],
                    createdDate: new Date('2024-07-25')
                },
                {
                    id: 5,
                    title: 'Optimizar consultas de base de datos',
                    description: 'Mejorar rendimiento de queries principales',
                    assignee: null,
                    collaborators: [],
                    priority: 'medium',
                    status: 'backlog',
                    category: 'database',
                    dueDate: new Date('2024-08-30'),
                    estimatedHours: 12,
                    actualHours: 0,
                    progress: 0,
                    requiredSkills: ['MySQL', 'SQL', 'Database'],
                    createdDate: new Date('2024-07-26')
                }
            ];
            setTasks(mockTasks);
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    };

    const calculateRecommendedAssignee = (task) => {
        const availableDevelopers = developers.filter(dev => 
            dev.workload < dev.maxCapacity * 0.9 // No más del 90% de capacidad
        );

        if (availableDevelopers.length === 0) return null;

        // Calcular puntuación para cada desarrollador
        const scoredDevelopers = availableDevelopers.map(dev => {
            let score = 0;

            // Puntuación por habilidades coincidentes
            const matchingSkills = task.requiredSkills?.filter(skill => 
                dev.skills.includes(skill)
            ).length || 0;
            score += matchingSkills * 20;

            // Puntuación por disponibilidad (menor carga de trabajo = mejor)
            const workloadPercentage = dev.workload / dev.maxCapacity;
            score += (1 - workloadPercentage) * 30;

            // Puntuación por eficiencia
            score += dev.efficiency * 25;

            // Puntuación por nivel (senior = mejor para tareas complejas)
            if (task.priority === 'very-high' || task.priority === 'high') {
                if (dev.level === 'senior' || dev.level === 'tech-lead') score += 15;
            }

            // Penalización por número de tareas actuales
            score -= dev.currentTasks * 5;

            return { ...dev, score };
        });

        // Ordenar por puntuación y devolver el mejor
        scoredDevelopers.sort((a, b) => b.score - a.score);
        return scoredDevelopers[0];
    };

    const openAssignDialog = (task) => {
        const recommended = calculateRecommendedAssignee(task);
        setSelectedTask(task);
        setAssignmentData({
            taskId: task.id,
            assigneeId: recommended?.id || null,
            collaborators: [],
            priority: task.priority,
            dueDate: task.dueDate,
            estimatedHours: task.estimatedHours,
            notes: ''
        });
        setShowAssignDialog(true);
    };

    const openReassignDialog = (task) => {
        setSelectedTask(task);
        setAssignmentData({
            taskId: task.id,
            assigneeId: task.assignee?.id || null,
            collaborators: task.collaborators || [],
            priority: task.priority,
            dueDate: task.dueDate,
            estimatedHours: task.estimatedHours,
            notes: ''
        });
        setShowReassignDialog(true);
    };

    const assignTask = async () => {
        try {
            if (!assignmentData.assigneeId) {
                showWarn('Debe seleccionar un desarrollador');
                return;
            }

            const assignee = developers.find(dev => dev.id === assignmentData.assigneeId);
            const collaborators = developers.filter(dev => 
                assignmentData.collaborators.includes(dev.id)
            );

            // Actualizar la tarea
            setTasks(prev => prev.map(task => 
                task.id === assignmentData.taskId 
                    ? {
                        ...task,
                        assignee: { id: assignee.id, name: assignee.name, avatar: assignee.avatar },
                        collaborators: collaborators.map(c => ({ id: c.id, name: c.name, avatar: c.avatar })),
                        priority: assignmentData.priority,
                        dueDate: assignmentData.dueDate,
                        estimatedHours: assignmentData.estimatedHours,
                        status: task.status === 'backlog' ? 'todo' : task.status
                    }
                    : task
            ));

            // Actualizar carga de trabajo del desarrollador
            setDevelopers(prev => prev.map(dev => 
                dev.id === assignmentData.assigneeId 
                    ? { ...dev, workload: dev.workload + assignmentData.estimatedHours, currentTasks: dev.currentTasks + 1 }
                    : dev
            ));

            setShowAssignDialog(false);
            setShowReassignDialog(false);
            showSuccess(`Tarea asignada exitosamente a ${assignee.name}`);

            // Enviar notificación (simulado)
            setTimeout(() => {
                showInfo('Se ha notificado al desarrollador por WhatsApp');
            }, 1000);

        } catch (error) {
            console.error('Error assigning task:', error);
            showError('No se pudo asignar la tarea');
        }
    };

    const unassignTask = (task) => {
        confirmDialog({
            message: `¿Estás seguro de que quieres desasignar la tarea "${task.title}"?`,
            header: 'Confirmar Desasignación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                // Actualizar la tarea
                setTasks(prev => prev.map(t => 
                    t.id === task.id 
                        ? { ...t, assignee: null, collaborators: [], status: 'backlog' }
                        : t
                ));

                // Actualizar carga de trabajo del desarrollador
                if (task.assignee) {
                    setDevelopers(prev => prev.map(dev => 
                        dev.id === task.assignee.id 
                            ? { 
                                ...dev, 
                                workload: Math.max(0, dev.workload - task.estimatedHours),
                                currentTasks: Math.max(0, dev.currentTasks - 1)
                            }
                            : dev
                    ));
                }

                showSuccess('La tarea ha sido desasignada exitosamente');
            }
        });
    };

    const getDeveloperCard = (developer) => {
        const workloadPercentage = (developer.workload / developer.maxCapacity) * 100;
        const getWorkloadColor = () => {
            if (workloadPercentage >= 90) return 'danger';
            if (workloadPercentage >= 75) return 'warning';
            return 'success';
        };

        return (
            <Card key={developer.id} className="developer-card">
                <div className="developer-header">
                    <Avatar label={developer.avatar} size="large" />
                    <div className="developer-info">
                        <h4>{developer.name}</h4>
                        <span className="role">{developer.role}</span>
                        <Badge value={developer.level} severity="info" />
                    </div>
                </div>

                <div className="developer-stats">
                    <div className="stat-item">
                        <span className="label">Carga de Trabajo</span>
                        <ProgressBar 
                            value={workloadPercentage} 
                            className={`workload-bar ${getWorkloadColor()}`}
                        />
                        <span className="value">{developer.workload}/{developer.maxCapacity}h</span>
                    </div>

                    <div className="stat-item">
                        <span className="label">Eficiencia</span>
                        <ProgressBar value={developer.efficiency * 100} className="efficiency-bar" />
                        <span className="value">{Math.round(developer.efficiency * 100)}%</span>
                    </div>

                    <div className="stat-item">
                        <span className="label">Tareas Actuales</span>
                        <span className="value">{developer.currentTasks}</span>
                    </div>
                </div>

                <div className="developer-skills">
                    <span className="skills-label">Habilidades:</span>
                    <div className="skills-list">
                        {developer.skills.slice(0, 3).map((skill, index) => (
                            <Chip key={index} label={skill} className="skill-chip" />
                        ))}
                        {developer.skills.length > 3 && (
                            <Chip label={`+${developer.skills.length - 3}`} className="skill-chip-more" />
                        )}
                    </div>
                </div>

                <Button
                    label="Ver Tareas"
                    icon="pi pi-list"
                    className="p-button-text p-button-sm"
                    onClick={() => {
                        setFilterCriteria(prev => ({ ...prev, assignee: developer.id }));
                        setSelectedDeveloper(developer);
                    }}
                />
            </Card>
        );
    };

    const getTaskCard = (task) => {
        const priority = priorities.find(p => p.value === task.priority);
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
        const recommended = !task.assignee ? calculateRecommendedAssignee(task) : null;

        return (
            <Card key={task.id} className={`task-card ${isOverdue ? 'overdue' : ''}`}>
                <div className="task-header">
                    <h4>{task.title}</h4>
                    <div className="task-badges">
                        {priority && <Badge value={priority.label} severity={priority.severity} />}
                        <Chip label={task.category} className="category-chip" />
                    </div>
                </div>

                <p className="task-description">{task.description}</p>

                {task.requiredSkills && task.requiredSkills.length > 0 && (
                    <div className="required-skills">
                        <span className="skills-label">Habilidades requeridas:</span>
                        <div className="skills-list">
                            {task.requiredSkills.map((skill, index) => (
                                <Chip key={index} label={skill} className="required-skill-chip" />
                            ))}
                        </div>
                    </div>
                )}

                <div className="task-meta">
                    <div className="meta-item">
                        <i className="pi pi-clock"></i>
                        <span>{task.estimatedHours}h estimadas</span>
                    </div>
                    {task.dueDate && (
                        <div className="meta-item">
                            <i className="pi pi-calendar"></i>
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                    )}
                </div>

                {task.assignee ? (
                    <div className="task-assignment">
                        <div className="assignee-info">
                            <Avatar label={task.assignee.avatar} size="small" />
                            <span>{task.assignee.name}</span>
                        </div>
                        {task.collaborators && task.collaborators.length > 0 && (
                            <div className="collaborators">
                                <AvatarGroup>
                                    {task.collaborators.map(collab => (
                                        <Avatar 
                                            key={collab.id}
                                            label={collab.avatar} 
                                            size="small"
                                            title={collab.name}
                                        />
                                    ))}
                                </AvatarGroup>
                            </div>
                        )}
                        <div className="assignment-actions">
                            <Button
                                icon="pi pi-refresh"
                                className="p-button-text p-button-sm"
                                onClick={() => openReassignDialog(task)}
                                tooltip="Reasignar"
                            />
                            <Button
                                icon="pi pi-times"
                                className="p-button-text p-button-sm p-button-danger"
                                onClick={() => unassignTask(task)}
                                tooltip="Desasignar"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="task-unassigned">
                        {recommended && (
                            <div className="recommendation">
                                <i className="pi pi-lightbulb"></i>
                                <span>Recomendado: {recommended.name}</span>
                            </div>
                        )}
                        <Button
                            label="Asignar"
                            icon="pi pi-user-plus"
                            className="p-button-success p-button-sm"
                            onClick={() => openAssignDialog(task)}
                        />
                    </div>
                )}
            </Card>
        );
    };

    return (
        <div className="task-assignment">
            <div className="page-header">
                <h2>Asignación de Tareas</h2>
                <p>Gestiona la asignación de tareas a desarrolladores</p>
            </div>

            <Splitter style={{ height: 'calc(100vh - 200px)' }}>
                <SplitterPanel size={30} minSize={25}>
                    <div className="developers-panel">
                        <h3>Equipo de Desarrollo</h3>
                        <div className="developers-list">
                            {developers.map(developer => getDeveloperCard(developer))}
                        </div>
                    </div>
                </SplitterPanel>

                <SplitterPanel size={70} minSize={50}>
                    <div className="tasks-panel">
                        <div className="tasks-header">
                            <h3>
                                Tareas 
                                {selectedDeveloper && ` - ${selectedDeveloper.name}`}
                            </h3>
                            <div className="filters">
                                <Dropdown
                                    value={filterCriteria.status}
                                    options={[{ label: 'Todos los Estados', value: '' }, ...statuses]}
                                    onChange={(e) => setFilterCriteria(prev => ({ ...prev, status: e.value }))}
                                    optionLabel="label"
                                    placeholder="Estado"
                                />
                                <Dropdown
                                    value={filterCriteria.priority}
                                    options={[{ label: 'Todas las Prioridades', value: '' }, ...priorities]}
                                    onChange={(e) => setFilterCriteria(prev => ({ ...prev, priority: e.value }))}
                                    optionLabel="label"
                                    placeholder="Prioridad"
                                />
                                <Dropdown
                                    value={filterCriteria.category}
                                    options={[{ label: 'Todas las Categorías', value: '' }, ...categories]}
                                    onChange={(e) => setFilterCriteria(prev => ({ ...prev, category: e.value }))}
                                    optionLabel="label"
                                    placeholder="Categoría"
                                />
                                <Dropdown
                                    value={filterCriteria.assignee}
                                    options={[
                                        { label: 'Todos', value: '' },
                                        { label: 'Sin Asignar', value: 'unassigned' },
                                        ...developers.map(dev => ({ label: dev.name, value: dev.id }))
                                    ]}
                                    onChange={(e) => setFilterCriteria(prev => ({ ...prev, assignee: e.value }))}
                                    optionLabel="label"
                                    placeholder="Desarrollador"
                                />
                                {selectedDeveloper && (
                                    <Button
                                        icon="pi pi-times"
                                        className="p-button-text p-button-sm"
                                        onClick={() => {
                                            setSelectedDeveloper(null);
                                            setFilterCriteria(prev => ({ ...prev, assignee: '' }));
                                        }}
                                        tooltip="Limpiar filtro"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="tasks-list">
                            {filteredTasks.length > 0 ? (
                                filteredTasks.map(task => getTaskCard(task))
                            ) : (
                                <div className="no-tasks">
                                    <i className="pi pi-inbox"></i>
                                    <p>No se encontraron tareas con los filtros aplicados</p>
                                </div>
                            )}
                        </div>
                    </div>
                </SplitterPanel>
            </Splitter>

            {/* Dialog para asignar tarea */}
            <Dialog
                header={`Asignar Tarea: ${selectedTask?.title}`}
                visible={showAssignDialog}
                style={{ width: '600px' }}
                onHide={() => setShowAssignDialog(false)}
                footer={
                    <div>
                        <Button 
                            label="Cancelar" 
                            icon="pi pi-times" 
                            className="p-button-text"
                            onClick={() => setShowAssignDialog(false)} 
                        />
                        <Button 
                            label="Asignar" 
                            icon="pi pi-check" 
                            onClick={assignTask} 
                        />
                    </div>
                }
            >
                <div className="assignment-form">
                    <div className="p-field">
                        <label htmlFor="assignee">Desarrollador *</label>
                        <Dropdown
                            id="assignee"
                            value={assignmentData.assigneeId}
                            options={developers.map(dev => ({
                                label: `${dev.name} (${dev.workload}/${dev.maxCapacity}h)`,
                                value: dev.id,
                                disabled: dev.workload >= dev.maxCapacity * 0.95
                            }))}
                            onChange={(e) => setAssignmentData({...assignmentData, assigneeId: e.value})}
                            optionLabel="label"
                            placeholder="Seleccione un desarrollador"
                        />
                    </div>

                    <div className="p-field">
                        <label htmlFor="collaborators">Colaboradores</label>
                        <MultiSelect
                            id="collaborators"
                            value={assignmentData.collaborators}
                            options={developers.filter(dev => dev.id !== assignmentData.assigneeId)}
                            onChange={(e) => setAssignmentData({...assignmentData, collaborators: e.value})}
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Seleccione colaboradores"
                            display="chip"
                        />
                    </div>

                    <div className="form-row">
                        <div className="p-field">
                            <label htmlFor="priority">Prioridad</label>
                            <Dropdown
                                id="priority"
                                value={assignmentData.priority}
                                options={priorities}
                                onChange={(e) => setAssignmentData({...assignmentData, priority: e.value})}
                                optionLabel="label"
                                placeholder="Seleccione prioridad"
                            />
                        </div>

                        <div className="p-field">
                            <label htmlFor="estimatedHours">Horas Estimadas</label>
                            <InputText
                                id="estimatedHours"
                                type="number"
                                value={assignmentData.estimatedHours}
                                onChange={(e) => setAssignmentData({...assignmentData, estimatedHours: parseInt(e.target.value) || 0})}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="p-field">
                        <label htmlFor="dueDate">Fecha Límite</label>
                        <Calendar
                            id="dueDate"
                            value={assignmentData.dueDate}
                            onChange={(e) => setAssignmentData({...assignmentData, dueDate: e.value})}
                            showIcon
                            placeholder="Seleccione fecha límite"
                        />
                    </div>

                    <div className="p-field">
                        <label htmlFor="notes">Notas de Asignación</label>
                        <InputTextarea
                            id="notes"
                            value={assignmentData.notes}
                            onChange={(e) => setAssignmentData({...assignmentData, notes: e.target.value})}
                            rows={3}
                            placeholder="Instrucciones adicionales para el desarrollador"
                        />
                    </div>
                </div>
            </Dialog>

            {/* Dialog para reasignar tarea */}
            <Dialog
                header={`Reasignar Tarea: ${selectedTask?.title}`}
                visible={showReassignDialog}
                style={{ width: '600px' }}
                onHide={() => setShowReassignDialog(false)}
                footer={
                    <div>
                        <Button 
                            label="Cancelar" 
                            icon="pi pi-times" 
                            className="p-button-text"
                            onClick={() => setShowReassignDialog(false)} 
                        />
                        <Button 
                            label="Reasignar" 
                            icon="pi pi-check" 
                            onClick={assignTask} 
                        />
                    </div>
                }
            >
                <div className="assignment-form">
                    <div className="p-field">
                        <label htmlFor="assignee">Desarrollador *</label>
                        <Dropdown
                            id="assignee"
                            value={assignmentData.assigneeId}
                            options={developers.map(dev => ({
                                label: `${dev.name} (${dev.workload}/${dev.maxCapacity}h)`,
                                value: dev.id,
                                disabled: dev.workload >= dev.maxCapacity * 0.95 && dev.id !== selectedTask?.assignee?.id
                            }))}
                            onChange={(e) => setAssignmentData({...assignmentData, assigneeId: e.value})}
                            optionLabel="label"
                            placeholder="Seleccione un desarrollador"
                        />
                    </div>

                    <div className="p-field">
                        <label htmlFor="collaborators">Colaboradores</label>
                        <MultiSelect
                            id="collaborators"
                            value={assignmentData.collaborators}
                            options={developers.filter(dev => dev.id !== assignmentData.assigneeId)}
                            onChange={(e) => setAssignmentData({...assignmentData, collaborators: e.value})}
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Seleccione colaboradores"
                            display="chip"
                        />
                    </div>

                    <div className="form-row">
                        <div className="p-field">
                            <label htmlFor="priority">Prioridad</label>
                            <Dropdown
                                id="priority"
                                value={assignmentData.priority}
                                options={priorities}
                                onChange={(e) => setAssignmentData({...assignmentData, priority: e.value})}
                                optionLabel="label"
                                placeholder="Seleccione prioridad"
                            />
                        </div>

                        <div className="p-field">
                            <label htmlFor="estimatedHours">Horas Estimadas</label>
                            <InputText
                                id="estimatedHours"
                                type="number"
                                value={assignmentData.estimatedHours}
                                onChange={(e) => setAssignmentData({...assignmentData, estimatedHours: parseInt(e.target.value) || 0})}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="p-field">
                        <label htmlFor="dueDate">Fecha Límite</label>
                        <Calendar
                            id="dueDate"
                            value={assignmentData.dueDate}
                            onChange={(e) => setAssignmentData({...assignmentData, dueDate: e.value})}
                            showIcon
                            placeholder="Seleccione fecha límite"
                        />
                    </div>

                    <div className="p-field">
                        <label htmlFor="notes">Notas de Reasignación</label>
                        <InputTextarea
                            id="notes"
                            value={assignmentData.notes}
                            onChange={(e) => setAssignmentData({...assignmentData, notes: e.target.value})}
                            rows={3}
                            placeholder="Razón del cambio y instrucciones adicionales"
                        />
                    </div>
                </div>
            </Dialog>

            <Toast ref={toast} />
        </div>
    );
};

export default TaskAssignment;
