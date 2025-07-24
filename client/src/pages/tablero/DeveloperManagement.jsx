import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Badge } from 'primereact/badge';
import { Avatar } from 'primereact/avatar';
import { Chip } from 'primereact/chip';
import { Card } from 'primereact/card';
import { ProgressBar } from 'primereact/progressbar';
import { Toolbar } from 'primereact/toolbar';
import { confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { TabView, TabPanel } from 'primereact/tabview';
import { Chart } from 'primereact/chart';
import { useToast } from '@context/toast/ToastContext';
import './DeveloperManagement.scss';

const DeveloperManagement = () => {
    const { showToast } = useToast();
    const toast = useRef(null);
    const [developers, setDevelopers] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [showDeveloperDialog, setShowDeveloperDialog] = useState(false);
    const [showStatsDialog, setShowStatsDialog] = useState(false);
    const [selectedDeveloper, setSelectedDeveloper] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    
    const [developerData, setDeveloperData] = useState({
        id: null,
        name: '',
        email: '',
        phone: '',
        role: '',
        level: '',
        avatar: '',
        skills: [],
        status: 'active',
        workload: 0,
        maxCapacity: 40
    });

    const [roles] = useState([
        { label: 'Frontend Developer', value: 'frontend' },
        { label: 'Backend Developer', value: 'backend' },
        { label: 'Full Stack Developer', value: 'fullstack' },
        { label: 'DevOps Engineer', value: 'devops' },
        { label: 'QA Tester', value: 'qa' },
        { label: 'UI/UX Designer', value: 'designer' },
        { label: 'Project Manager', value: 'pm' },
        { label: 'Technical Lead', value: 'lead' }
    ]);

    const [levels] = useState([
        { label: 'Junior', value: 'junior' },
        { label: 'Semi Senior', value: 'semi-senior' },
        { label: 'Senior', value: 'senior' },
        { label: 'Tech Lead', value: 'tech-lead' },
        { label: 'Architect', value: 'architect' }
    ]);

    // const [skillsOptions] = useState([
    //     'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue.js',
    //     'Node.js', 'Python', 'Java', 'C#', '.NET',
    //     'PHP', 'Laravel', 'Spring Boot', 'Express.js',
    //     'MySQL', 'PostgreSQL', 'MongoDB', 'Redis',
    //     'AWS', 'Azure', 'Docker', 'Kubernetes',
    //     'Git', 'Jenkins', 'CI/CD', 'Testing',
    //     'Scrum', 'Agile', 'Project Management'
    // ]);

    const [statusOptions] = useState([
        { label: 'Activo', value: 'active' },
        { label: 'Inactivo', value: 'inactive' },
        { label: 'En Vacaciones', value: 'vacation' },
        { label: 'Licencia', value: 'leave' }
    ]);

    const [developerStats, setDeveloperStats] = useState(null);

    const loadDevelopers = useCallback(async () => {
        try {
            // Datos de ejemplo
            const mockDevelopers = [
                {
                    id: 1,
                    name: 'Juan Pérez',
                    email: 'juan.perez@company.com',
                    phone: '+57 300 123 4567',
                    role: 'backend',
                    level: 'senior',
                    avatar: 'JP',
                    skills: ['JavaScript', 'Node.js', 'MySQL', 'AWS'],
                    status: 'active',
                    workload: 32,
                    maxCapacity: 40,
                    tasksCompleted: 15,
                    tasksInProgress: 3,
                    avgTaskTime: 2.5,
                    joinDate: new Date('2022-03-15')
                },
                {
                    id: 2,
                    name: 'María García',
                    email: 'maria.garcia@company.com',
                    phone: '+57 301 234 5678',
                    role: 'frontend',
                    level: 'semi-senior',
                    avatar: 'MG',
                    skills: ['React', 'TypeScript', 'CSS', 'Testing'],
                    status: 'active',
                    workload: 28,
                    maxCapacity: 40,
                    tasksCompleted: 12,
                    tasksInProgress: 2,
                    avgTaskTime: 3.1,
                    joinDate: new Date('2022-07-20')
                },
                {
                    id: 3,
                    name: 'Carlos López',
                    email: 'carlos.lopez@company.com',
                    phone: '+57 302 345 6789',
                    role: 'fullstack',
                    level: 'senior',
                    avatar: 'CL',
                    skills: ['React', 'Node.js', 'MongoDB', 'Docker'],
                    status: 'vacation',
                    workload: 0,
                    maxCapacity: 40,
                    tasksCompleted: 20,
                    tasksInProgress: 0,
                    avgTaskTime: 2.8,
                    joinDate: new Date('2021-11-10')
                },
                {
                    id: 4,
                    name: 'Ana Rodríguez',
                    email: 'ana.rodriguez@company.com',
                    phone: '+57 303 456 7890',
                    role: 'devops',
                    level: 'senior',
                    avatar: 'AR',
                    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
                    status: 'active',
                    workload: 35,
                    maxCapacity: 40,
                    tasksCompleted: 18,
                    tasksInProgress: 4,
                    avgTaskTime: 1.9,
                    joinDate: new Date('2021-05-03')
                },
                {
                    id: 5,
                    name: 'Luis Martínez',
                    email: 'luis.martinez@company.com',
                    phone: '+57 304 567 8901',
                    role: 'qa',
                    level: 'junior',
                    avatar: 'LM',
                    skills: ['Testing', 'Selenium', 'Jest', 'Cypress'],
                    status: 'active',
                    workload: 20,
                    maxCapacity: 40,
                    tasksCompleted: 8,
                    tasksInProgress: 2,
                    avgTaskTime: 1.5,
                    joinDate: new Date('2023-01-15')
                }
            ];
            setDevelopers(mockDevelopers);
        } catch (error) {
            console.error('Error loading developers:', error);
            showToast('error', 'Error', 'No se pudieron cargar los desarrolladores');
        }
    }, [showToast]);

    useEffect(() => {
        loadDevelopers();
    }, [loadDevelopers]);

    const openNew = () => {
        setDeveloperData({
            id: null,
            name: '',
            email: '',
            phone: '',
            role: '',
            level: '',
            avatar: '',
            skills: [],
            status: 'active',
            workload: 0,
            maxCapacity: 40
        });
        setIsEditing(false);
        setShowDeveloperDialog(true);
    };

    const editDeveloper = (developer) => {
        setDeveloperData({ ...developer });
        setIsEditing(true);
        setShowDeveloperDialog(true);
    };

    const deleteDeveloper = (developer) => {
        confirmDialog({
            message: `¿Estás seguro de que quieres eliminar a ${developer.name}?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                setDevelopers(prev => prev.filter(d => d.id !== developer.id));
                showToast('success', 'Desarrollador Eliminado', 'El desarrollador se ha eliminado exitosamente');
            }
        });
    };

    const saveDeveloper = async () => {
        try {
            if (!developerData.name || !developerData.email) {
                showToast('warn', 'Campos Requeridos', 'Nombre y email son obligatorios');
                return;
            }

            // Generar avatar automáticamente si no se proporciona
            if (!developerData.avatar) {
                const nameParts = developerData.name.split(' ');
                const avatar = nameParts.length > 1 
                    ? nameParts[0][0] + nameParts[1][0] 
                    : nameParts[0][0] + nameParts[0][1];
                developerData.avatar = avatar.toUpperCase();
            }

            if (isEditing) {
                setDevelopers(prev => prev.map(dev => 
                    dev.id === developerData.id ? { ...developerData } : dev
                ));
                showToast('success', 'Desarrollador Actualizado', 'El desarrollador se ha actualizado exitosamente');
            } else {
                const newDeveloper = {
                    ...developerData,
                    id: Date.now(),
                    tasksCompleted: 0,
                    tasksInProgress: 0,
                    avgTaskTime: 0,
                    joinDate: new Date()
                };
                setDevelopers(prev => [...prev, newDeveloper]);
                showToast('success', 'Desarrollador Creado', 'El desarrollador se ha creado exitosamente');
            }

            setShowDeveloperDialog(false);
        } catch (error) {
            console.error('Error saving developer:', error);
            showToast('error', 'Error', 'No se pudo guardar el desarrollador');
        }
    };

    const viewStats = (developer) => {
        setSelectedDeveloper(developer);
        setDeveloperStats(generateStats(developer));
        setShowStatsDialog(true);
    };

    const generateStats = (developer) => {
        // Datos de ejemplo para las estadísticas
        return {
            taskDistribution: {
                labels: ['Completadas', 'En Progreso', 'Pendientes'],
                datasets: [{
                    data: [developer.tasksCompleted, developer.tasksInProgress, 2],
                    backgroundColor: ['#28a745', '#ffc107', '#17a2b8']
                }]
            },
            monthlyPerformance: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [{
                    label: 'Tareas Completadas',
                    data: [3, 5, 2, 8, 4, 6],
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)'
                }]
            },
            workloadTrend: {
                labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
                datasets: [{
                    label: 'Carga de Trabajo (hrs)',
                    data: [32, 28, 35, developer.workload],
                    borderColor: '#fd7e14',
                    backgroundColor: 'rgba(253, 126, 20, 0.1)'
                }]
            }
        };
    };

    const avatarBodyTemplate = (rowData) => {
        return (
            <div className="developer-avatar">
                <Avatar label={rowData.avatar} size="large" />
                <div className="developer-info">
                    <div className="name">{rowData.name}</div>
                    <div className="email">{rowData.email}</div>
                </div>
            </div>
        );
    };

    const roleBodyTemplate = (rowData) => {
        const role = roles.find(r => r.value === rowData.role);
        return role ? role.label : '-';
    };

    const levelBodyTemplate = (rowData) => {
        const level = levels.find(l => l.value === rowData.level);
        const getLevelColor = (level) => {
            switch (level) {
                case 'junior': return 'info';
                case 'semi-senior': return 'warning';
                case 'senior': return 'success';
                case 'tech-lead': return 'danger';
                case 'architect': return 'secondary';
                default: return 'info';
            }
        };
        
        return level ? <Badge value={level.label} severity={getLevelColor(rowData.level)} /> : '-';
    };

    const skillsBodyTemplate = (rowData) => {
        return (
            <div className="skills-container">
                {rowData.skills.slice(0, 3).map((skill, index) => (
                    <Chip key={index} label={skill} className="skill-chip" />
                ))}
                {rowData.skills.length > 3 && (
                    <Chip label={`+${rowData.skills.length - 3}`} className="skill-chip-more" />
                )}
            </div>
        );
    };

    const statusBodyTemplate = (rowData) => {
        const status = statusOptions.find(s => s.value === rowData.status);
        const getStatusSeverity = (status) => {
            switch (status) {
                case 'active': return 'success';
                case 'inactive': return 'danger';
                case 'vacation': return 'warning';
                case 'leave': return 'info';
                default: return 'secondary';
            }
        };
        
        return status ? <Badge value={status.label} severity={getStatusSeverity(rowData.status)} /> : '-';
    };

    const workloadBodyTemplate = (rowData) => {
        const percentage = (rowData.workload / rowData.maxCapacity) * 100;
        const getWorkloadSeverity = () => {
            if (percentage >= 90) return 'danger';
            if (percentage >= 75) return 'warning';
            return 'success';
        };
        
        return (
            <div className="workload-container">
                <ProgressBar 
                    value={percentage} 
                    style={{ height: '8px' }}
                    className={`workload-bar ${getWorkloadSeverity()}`}
                />
                <span className="workload-text">{rowData.workload}/{rowData.maxCapacity}h</span>
            </div>
        );
    };

    const actionsBodyTemplate = (rowData) => {
        return (
            <div className="actions-container">
                <Button
                    icon="pi pi-chart-bar"
                    className="p-button-rounded p-button-text p-button-sm p-button-info"
                    onClick={() => viewStats(rowData)}
                    tooltip="Ver Estadísticas"
                />
                <Button
                    icon="pi pi-pencil"
                    className="p-button-rounded p-button-text p-button-sm"
                    onClick={() => editDeveloper(rowData)}
                    tooltip="Editar"
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-text p-button-sm p-button-danger"
                    onClick={() => deleteDeveloper(rowData)}
                    tooltip="Eliminar"
                />
            </div>
        );
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="toolbar-left">
                <Button 
                    label="Nuevo Desarrollador" 
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
                        placeholder="Buscar desarrolladores..."
                    />
                </span>
            </div>
        );
    };

    return (
        <div className="developer-management">
            <div className="page-header">
                <h2>Gestión de Desarrolladores</h2>
                <p>Administra el equipo de desarrollo</p>
            </div>

            {/* Cards de resumen */}
            <div className="summary-cards">
                <Card className="summary-card">
                    <div className="card-content">
                        <div className="card-icon active">
                            <i className="pi pi-users"></i>
                        </div>
                        <div className="card-stats">
                            <h3>{developers.filter(d => d.status === 'active').length}</h3>
                            <span>Desarrolladores Activos</span>
                        </div>
                    </div>
                </Card>

                <Card className="summary-card">
                    <div className="card-content">
                        <div className="card-icon workload">
                            <i className="pi pi-clock"></i>
                        </div>
                        <div className="card-stats">
                            <h3>{developers.reduce((acc, dev) => acc + dev.workload, 0)}h</h3>
                            <span>Carga Total de Trabajo</span>
                        </div>
                    </div>
                </Card>

                <Card className="summary-card">
                    <div className="card-content">
                        <div className="card-icon completed">
                            <i className="pi pi-check-circle"></i>
                        </div>
                        <div className="card-stats">
                            <h3>{developers.reduce((acc, dev) => acc + dev.tasksCompleted, 0)}</h3>
                            <span>Tareas Completadas</span>
                        </div>
                    </div>
                </Card>

                <Card className="summary-card">
                    <div className="card-content">
                        <div className="card-icon progress">
                            <i className="pi pi-spinner"></i>
                        </div>
                        <div className="card-stats">
                            <h3>{developers.reduce((acc, dev) => acc + dev.tasksInProgress, 0)}</h3>
                            <span>Tareas en Progreso</span>
                        </div>
                    </div>
                </Card>
            </div>

            <Toolbar 
                className="toolbar"
                left={leftToolbarTemplate} 
                right={rightToolbarTemplate}
            />

            <DataTable
                value={developers}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25]}
                className="developer-table"
                globalFilter={globalFilter}
                emptyMessage="No se encontraron desarrolladores"
                responsiveLayout="scroll"
            >
                <Column 
                    field="name" 
                    header="Desarrollador" 
                    body={avatarBodyTemplate}
                    style={{ minWidth: '250px' }}
                />
                <Column 
                    field="role" 
                    header="Rol" 
                    body={roleBodyTemplate}
                    style={{ minWidth: '150px' }}
                />
                <Column 
                    field="level" 
                    header="Nivel" 
                    body={levelBodyTemplate}
                    style={{ width: '120px' }}
                />
                <Column 
                    field="skills" 
                    header="Habilidades" 
                    body={skillsBodyTemplate}
                    style={{ minWidth: '200px' }}
                />
                <Column 
                    field="status" 
                    header="Estado" 
                    body={statusBodyTemplate}
                    style={{ width: '120px' }}
                />
                <Column 
                    field="workload" 
                    header="Carga de Trabajo" 
                    body={workloadBodyTemplate}
                    style={{ width: '150px' }}
                />
                <Column 
                    body={actionsBodyTemplate} 
                    header="Acciones"
                    style={{ width: '130px' }}
                />
            </DataTable>

            {/* Dialog para crear/editar desarrollador */}
            <Dialog
                header={isEditing ? 'Editar Desarrollador' : 'Nuevo Desarrollador'}
                visible={showDeveloperDialog}
                style={{ width: '600px' }}
                onHide={() => setShowDeveloperDialog(false)}
                footer={
                    <div>
                        <Button 
                            label="Cancelar" 
                            icon="pi pi-times" 
                            className="p-button-text"
                            onClick={() => setShowDeveloperDialog(false)} 
                        />
                        <Button 
                            label={isEditing ? 'Actualizar' : 'Crear'} 
                            icon="pi pi-check" 
                            onClick={saveDeveloper} 
                        />
                    </div>
                }
            >
                <div className="developer-form">
                    <div className="form-row">
                        <div className="p-field">
                            <label htmlFor="name">Nombre *</label>
                            <InputText
                                id="name"
                                value={developerData.name}
                                onChange={(e) => setDeveloperData({...developerData, name: e.target.value})}
                                placeholder="Nombre completo"
                            />
                        </div>

                        <div className="p-field">
                            <label htmlFor="email">Email *</label>
                            <InputText
                                id="email"
                                type="email"
                                value={developerData.email}
                                onChange={(e) => setDeveloperData({...developerData, email: e.target.value})}
                                placeholder="correo@empresa.com"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="p-field">
                            <label htmlFor="phone">Teléfono</label>
                            <InputText
                                id="phone"
                                value={developerData.phone}
                                onChange={(e) => setDeveloperData({...developerData, phone: e.target.value})}
                                placeholder="+57 300 123 4567"
                            />
                        </div>

                        <div className="p-field">
                            <label htmlFor="avatar">Avatar</label>
                            <InputText
                                id="avatar"
                                value={developerData.avatar}
                                onChange={(e) => setDeveloperData({...developerData, avatar: e.target.value})}
                                placeholder="JD (se genera automáticamente)"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="p-field">
                            <label htmlFor="role">Rol</label>
                            <Dropdown
                                id="role"
                                value={developerData.role}
                                options={roles}
                                onChange={(e) => setDeveloperData({...developerData, role: e.value})}
                                optionLabel="label"
                                placeholder="Seleccione un rol"
                            />
                        </div>

                        <div className="p-field">
                            <label htmlFor="level">Nivel</label>
                            <Dropdown
                                id="level"
                                value={developerData.level}
                                options={levels}
                                onChange={(e) => setDeveloperData({...developerData, level: e.value})}
                                optionLabel="label"
                                placeholder="Seleccione un nivel"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="p-field">
                            <label htmlFor="status">Estado</label>
                            <Dropdown
                                id="status"
                                value={developerData.status}
                                options={statusOptions}
                                onChange={(e) => setDeveloperData({...developerData, status: e.value})}
                                optionLabel="label"
                                placeholder="Seleccione estado"
                            />
                        </div>

                        <div className="p-field">
                            <label htmlFor="maxCapacity">Capacidad Máxima (hrs/sem)</label>
                            <InputText
                                id="maxCapacity"
                                type="number"
                                value={developerData.maxCapacity}
                                onChange={(e) => setDeveloperData({...developerData, maxCapacity: parseInt(e.target.value) || 40})}
                                placeholder="40"
                            />
                        </div>
                    </div>

                    {/* Campo de habilidades (simplificado) */}
                    <div className="p-field">
                        <label htmlFor="skills">Habilidades (separadas por coma)</label>
                        <InputText
                            id="skills"
                            value={developerData.skills.join(', ')}
                            onChange={(e) => setDeveloperData({
                                ...developerData, 
                                skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                            })}
                            placeholder="JavaScript, React, Node.js"
                        />
                    </div>
                </div>
            </Dialog>

            {/* Dialog de estadísticas */}
            <Dialog
                header={`Estadísticas - ${selectedDeveloper?.name}`}
                visible={showStatsDialog}
                style={{ width: '800px' }}
                onHide={() => setShowStatsDialog(false)}
            >
                {developerStats && (
                    <TabView>
                        <TabPanel header="Distribución de Tareas">
                            <div className="stats-content">
                                <Chart type="doughnut" data={developerStats.taskDistribution} />
                            </div>
                        </TabPanel>
                        
                        <TabPanel header="Rendimiento Mensual">
                            <div className="stats-content">
                                <Chart type="line" data={developerStats.monthlyPerformance} />
                            </div>
                        </TabPanel>
                        
                        <TabPanel header="Tendencia de Carga">
                            <div className="stats-content">
                                <Chart type="bar" data={developerStats.workloadTrend} />
                            </div>
                        </TabPanel>
                    </TabView>
                )}
            </Dialog>

            <Toast ref={toast} />
        </div>
    );
};

export default DeveloperManagement;
