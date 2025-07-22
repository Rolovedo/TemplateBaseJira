import React, {
    useContext,
    useState,
    useRef,
    useMemo,
    useEffect,
    Suspense,
    useCallback,
} from "react";

// Contexts
import { AuthContext } from "@context/auth/AuthContext";
import { ToastContext } from "@context/toast/ToastContext";

// Hooks
import useHandleData from "@hook/useHandleData";
import useHandleApiError from "@hook/useHandleApiError";
import usePaginationData from "@hook/usePaginationData";

// PrimeReact Components
import { Button } from "primereact/button";

// Utils
import { estados, propsSelect } from "@utils/converAndConst";
import { formatNotificationDateTime } from "@utils/formatTime";

// Custom Components
import ChipStatusComponent from "@components/fields/ChipStatusComponent";
import { RightToolbar } from "@components/generales";
import VenPerfil from "./components/VenPerfil";

// Services
import { deleteProfileAPI, paginationProfilesAPI } from "@api/requests";
import PageHeader from "@components/layout/PageHeader";
import LoadingComponent from "@components/layout/LoadingComponent";
import SkeletonMasterLoader from "@components/generales/SkeletonMasterLoader";
import ContextMenuActions from "@components/data/ContextMenuActions";
import usePermissions from "@context/permissions/usePermissions";
import { ConfirmDialog } from "primereact/confirmdialog";
import EmptyState from "@components/data/EmptyState";

// Lazy Loaded Components
const LazyDataTable = React.lazy(() => import("@components/data/DataTableComponent"));
const DataTableComponentMemo = React.memo(LazyDataTable);
const LazyFilterComponent = React.lazy(() => import("@components/data/FilterOverlay"));
const FilterComponentMemo = React.memo(LazyFilterComponent);
const VenPerfilMemo = React.memo(VenPerfil);

const generateFiltersConfig = ({ filtros }) => [
    { key: "nombre", type: "input", label: "Nombre", filtro: filtros.nombre },
    {
        key: "estado",
        type: "dropdown",
        props: { ...propsSelect, options: estados },
        label: "Estado",
        showClear: true,
        filtro: filtros.estado,
    },
];

const columnsConfig = [
    {
        field: "nombre",
        header: "Nombre",
        style: { flexGrow: 1, flexBasis: "12rem", minWidth: "12rem" },
        mobile: true,
    },

    {
        field: "usuact,fecact",
        header: "Actualizado Por",
        style: { flexGrow: 1, flexBasis: "12rem", minWidth: "12rem" },
        body: ({ usuact, fecact }) => (
            <div>
                <div>
                    <span style={{ fontWeight: 600 }}>{usuact}</span>
                </div>
                <div>{formatNotificationDateTime(fecact)}</div>
            </div>
        ),
    },
    {
        field: "nomestado",
        header: "Estado",
        style: { maxWidth: "8rem" },
        body: ({ estid, nomestado }) => <ChipStatusComponent id={estid} nameStatus={nomestado} />,
    },
];

const Perfiles = () => {
    const venPerfil = useRef();
    const { idusuario, nombreusuario } = useContext(AuthContext);

    const { hasPermission } = usePermissions();
    const canCreate = hasPermission("security", "profiles", "create");
    const canAssignPermission = hasPermission("security", "profiles", "assignPermission");
    const canEdit = hasPermission("security", "profiles", "edit");
    const canDelete = hasPermission("security", "profiles", "delete");

    const { showSuccess } = useContext(ToastContext);
    const handleApiError = useHandleApiError();
    const { state, setInitialState, deleteItem, addItem, updateItem } = useHandleData();
    const [loading, setLoading] = useState({ table: false });
    const [, setCurrentTime] = useState(new Date());
    const overlayFiltersRef = useRef(null);
    const [firstLoad, setFirstLoad] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Actualiza cada 60 segundos

        return () => clearInterval(interval);
    }, []);

    const initialFilters = useMemo(
        () => ({
            idusuario,
            nombre: "",
            estado: null,
        }),
        [idusuario]
    );

    const sortField = "nombre";

    const { filtros, setFiltros, datos, totalRecords, pagination, setPagination, onCustomPage } =
        usePaginationData(initialFilters, paginationProfilesAPI, setLoading, sortField, () => true);

    useEffect(() => {
        if (!loading.table && firstLoad) {
            setTimeout(() => setFirstLoad(false), [400]);
        }
    }, [loading.table, firstLoad]);

    useEffect(() => {
        setFiltros((prevFilters) => ({
            ...prevFilters,
            idusuario,
        }));
    }, [idusuario, setFiltros]);

    useEffect(() => {
        setInitialState(datos, totalRecords);
        // eslint-disable-next-line
    }, [datos, totalRecords, setInitialState]);

    const filtersConfig = useMemo(() => generateFiltersConfig({ filtros }), [filtros]);

    const getActiveFiltersCount = (filters) => {
        return Object.entries(filters).filter(([key, value]) => {
            if (key === "idusuario" && value) return false;
            return value !== null && value !== undefined && value !== "";
        }).length;
    };

    const activeFiltersCount = useMemo(() => getActiveFiltersCount(filtros), [filtros]);

    const deleteProfile = useCallback(
        async (prfId) => {
            try {
                const params = {
                    prfId,
                    usuario: nombreusuario,
                };
                const { data } = await deleteProfileAPI(params);

                showSuccess(data.message);
                venPerfil.current.onClose();
                deleteItem({ id: prfId, idField: "prfId" });
            } catch (error) {
                handleApiError(error);
            }
        },
        [deleteItem, handleApiError, nombreusuario, showSuccess]
    );

    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [currentProfile, setCurrentProfile] = useState(null);

    const renderActions = (item) => {
        const { prfId, nombre } = item;
        const menuItems = [
            {
                label: `Editar`,
                icon: "pi pi-pencil",
                command: () => venPerfil.current.editProfile(item, 0),
                disabled: !canEdit || prfId === 3,
                color: "#fda53a", // Color naranja para editar
            },
            {
                label: `Asignar permisos`,
                icon: "pi pi-lock",
                command: () => venPerfil.current.editProfile(item, 1),
                disabled: !canAssignPermission || prfId === 3,
                color: "#0eb0e9", // Color azul para permisos
            },
            {
                label: `Eliminar`,
                icon: "pi pi-trash",
                command: () => {
                    setCurrentProfile({ prfId, nombre });
                    setDeleteDialogVisible(true);
                },
                disabled: !canDelete || prfId === 3,
                color: "#f43f51",
            },
        ];

        return <ContextMenuActions menuItems={menuItems} itemId={prfId} />;
    };

    const showOverlayFilters = (event) => {
        overlayFiltersRef.current.toggle(event);
    };

    const actionsToolbar = useMemo(
        () => (
            <>
                <div style={{ position: "relative", display: "inline-block" }}>
                    <Button
                        icon="pi pi-sliders-h"
                        label="Filtros"
                        iconPos="left"
                        className="p-button-sm p-button-rounded ml-2"
                        onClick={showOverlayFilters}
                    />
                    {activeFiltersCount > 0 && (
                        <span
                            className="fade-in"
                            style={{
                                position: "absolute",
                                top: "-8px",
                                right: "-8px",
                                backgroundColor: "#f44336", // Color rojo
                                color: "#fff", // Color de texto blanco
                                borderRadius: "50%",
                                padding: "4px 8px",
                                fontSize: "8px",
                                fontWeight: "bold",
                                zIndex: 1,
                            }}
                        >
                            {activeFiltersCount}
                        </span>
                    )}
                </div>
                <RightToolbar
                    label="Crear"
                    onClick={() => venPerfil.current.newProfile()}
                    disabled={!canCreate}
                />
            </>
        ),
        [canCreate, activeFiltersCount]
    );

    const headerTemplate = useMemo(
        () => <div style={{ flexShrink: 0 }}>{actionsToolbar}</div>,
        [actionsToolbar]
    );

    const handleRowSelect = (e) => {
        const target = e.originalEvent.target;

        if (!canEdit || e.value?.prfId === 3) return; // bloquear para no permitir editar el perfil PACIENTE ya que con este se valida internamente la navegación en el login

        // Evitar la navegación si el clic ocurre dentro de elementos interactivos
        if (
            target.closest(".p-dropdown") || // Dropdown de PrimeReact
            target.closest(".p-multiselect") || // MultiSelect de PrimeReact
            target.closest(".p-dropdown-item") || // Opción dentro del dropdown
            target.closest(".p-multiselect-item") || // Opción dentro del multiselect
            target.closest("input") || // Inputs de cualquier tipo
            target.closest("button") || // Botones de cualquier tipo
            target.closest(".p-checkbox") || // Checkboxes de PrimeReact
            target.closest(".p-radiobutton") || // Radio buttons de PrimeReact
            target.closest(".p-inputtext") // Cualquier otro input de texto de PrimeReact
        ) {
            return;
        }

        // Si no hizo clic en un elemento interactivo, redirigir
        // console.log(e.value);

        venPerfil.current.editProfile(e.value);
    };

    return (
        <>
            {firstLoad ? (
                <SkeletonMasterLoader />
            ) : (
                <div className="fade-in">
                    <ConfirmDialog
                        visible={deleteDialogVisible}
                        onHide={() => setDeleteDialogVisible(false)}
                        message={`¿Realmente desea eliminar el perfil ${currentProfile?.nombre}?`}
                        header="Confirmar Eliminación"
                        icon="pi pi-exclamation-triangle"
                        acceptLabel="Sí"
                        accept={() => {
                            deleteProfile(currentProfile?.prfId);
                            setDeleteDialogVisible(false);
                        }}
                        reject={() => setDeleteDialogVisible(false)}
                        acceptClassName="p-button-danger"
                    />
                    <PageHeader
                        page="Seguridad"
                        title="Perfiles"
                        description="Configura y gestiona los perfiles del sistema, define permisos y controla los niveles de acceso para garantizar la seguridad."
                    />
                    <VenPerfilMemo
                        ref={venPerfil}
                        addItem={addItem}
                        updateItem={updateItem}
                        setCurrentProfile={setCurrentProfile}
                        setDeleteDialogVisible={setDeleteDialogVisible}
                        canAssignPermission={canAssignPermission}
                        canDelete={canDelete}
                    />

                    <Suspense fallback={<LoadingComponent />}>
                        <FilterComponentMemo
                            overlayRef={overlayFiltersRef}
                            initialFilters={initialFilters}
                            filters={filtersConfig}
                            setFilters={setFiltros}
                        />
                        {state.datos?.length <= 0 ? (
                            <EmptyState
                                title="No hay perfiles registrados"
                                description="Puedes crear un nuevo perfil para comenzar."
                                buttonLabel="Registrar nuevo perfil"
                                onButtonClick={() => venPerfil.current.newProfile()}
                                canCreate={canCreate}
                            />
                        ) : (
                            <div className="grid">
                                <div className="col-12 md:col-12">
                                    <DataTableComponentMemo
                                        KeyModule={"module_profiles"}
                                        dataKey={"prfId"}
                                        columns={columnsConfig}
                                        header={headerTemplate}
                                        datos={state.datos}
                                        loading={loading.table}
                                        totalRecords={state.totalRecords}
                                        pagination={pagination}
                                        onCustomPage={onCustomPage}
                                        setPagination={setPagination}
                                        actionBodyTemplate={renderActions}
                                        isRowSelectable={true}
                                        onSelectionChange={handleRowSelect}
                                    />
                                </div>
                            </div>
                        )}
                    </Suspense>
                </div>
            )}
        </>
    );
};

export default Perfiles;
