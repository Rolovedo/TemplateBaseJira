import React, {
    useContext,
    useEffect,
    useState,
    useRef,
    useCallback,
    useMemo,
    Suspense,
} from "react";

// Contexts
import { AuthContext } from "@context/auth/AuthContext";
import { ToastContext } from "@context/toast/ToastContext";

// Hooks
import useHandleApiError from "@hook/useHandleApiError";
import useHandleData from "@hook/useHandleData";
import usePaginationData from "@hook/usePaginationData";

// Components
import VenUsuario from "./components/VenUsuario";
import { RightToolbar } from "@components/generales";
import ChipStatusComponent from "@components/fields/ChipStatusComponent";

// PrimeReact
import { Button } from "primereact/button";

// APIs
import { deleteUserAPI, countUsersAPI, paginationUsersAPI, getProfilesAPI } from "@api/requests";

// Utilities
import { estados, getInitials, propsSelect } from "@utils/converAndConst";
import { formatNotificationDateTime } from "@utils/formatTime";
import PageHeader from "@components/layout/PageHeader";
import LoadingComponent from "@components/layout/LoadingComponent";
import SkeletonMasterLoader from "@components/generales/SkeletonMasterLoader";
import ContextMenuActions from "@components/data/ContextMenuActions";
import usePermissions from "@context/permissions/usePermissions";
import { useMediaQueryContext } from "@context/mediaQuery/mediaQueryContext";
import { ConfirmDialog } from "primereact/confirmdialog";
import { TabPanel, TabView } from "primereact/tabview";
import EmptyState from "@components/data/EmptyState";
import { Avatar } from "primereact/avatar";

// Lazy Loaded Components
const LazyDataTable = React.lazy(() => import("@components/data/DataTableComponent"));
const DataTableComponentMemo = React.memo(LazyDataTable);

const LazyFilterComponent = React.lazy(() => import("@components/data/FilterOverlay"));
const FilterComponentMemo = React.memo(LazyFilterComponent);

const generateFiltersConfig = ({ filtros }) => [
    { key: "nombre", type: "input", label: "Nombre", filtro: filtros.nombre },
    { key: "apellido", type: "input", label: "Apellido", filtro: filtros.apellido },
    { key: "documento", type: "input", label: "Nit/CC", filtro: filtros.documento },
    { key: "correo", type: "input", label: "Correo", filtro: filtros.correo },
    { key: "telefono", type: "input", label: "Teléfono", filtro: filtros.telefono },
    { key: "usuario", type: "input", label: "Usuario", filtro: filtros.usuario },
    {
        key: "estado",
        type: "dropdown",
        props: { ...propsSelect, options: estados },
        label: "Estado",
        showClear: true,
        filtro: filtros.estado,
    },
];

const Usuarios = () => {
    const venUsuario = useRef();
    const { idusuario, nombreusuario } = useContext(AuthContext);
    const { isDesktop } = useMediaQueryContext();

    const { hasPermission } = usePermissions();
    const canCreate = hasPermission("security", "users", "create");
    const canAssignPermission = hasPermission("security", "users", "assignPermission");
    const canEdit = hasPermission("security", "users", "edit");
    const canDelete = hasPermission("security", "users", "delete");

    const { showSuccess } = useContext(ToastContext);
    const handleApiError = useHandleApiError();
    const [loading, setLoading] = useState({ table: true });
    const [conprf, setConprf] = useState([]);
    const overlayFiltersRef = useRef(null);
    const [firstLoad, setFirstLoad] = useState(true);
    const [listperfiles, setListperfiles] = useState([]);

    const showOverlayFilters = (event) => {
        overlayFiltersRef.current.toggle(event);
    };

    const { state, setInitialState, deleteItem, addItem, updateItem } = useHandleData();

    // ESTAR ACTUALIZANDO FECHA DE MODIFICACION
    const [, setCurrentTime] = useState(new Date());
    const getLists = async () => {
        try {
            const { data } = await getProfilesAPI();
            setListperfiles(data);
        } catch (error) {
            handleApiError(error);
        }
    };

    useEffect(() => {
        getLists();
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Actualiza cada 60 segundos

        return () => clearInterval(interval);
    }, []);

    const initialFilters = useMemo(
        () => ({
            idusuario,
            prfId: null,
            nombre: "",
            apellido: "",
            documento: "",
            correo: "",
            usuario: "",
            estado: null,
        }),
        [idusuario]
    ); // Filtros iniciales

    const columnsConfig = [
        {
            field: "usuFoto",
            sortable: false,
            style: { flexGrow: 0, flexBasis: "3rem", width: "3rem", textAlign: "center" },
            body: ({ usuFoto, nombre, apellido }) => (
                <span>
                    <Avatar
                        image={usuFoto}
                        label={
                            !usuFoto
                                ? getInitials(`${nombre ? nombre : ""} ${apellido ? apellido : ""}`)
                                : null
                        }
                        shape="circle"
                        size="normal"
                        style={{
                            border: "2px solid #fff",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                            cursor: "pointer",
                            marginRight: 10,
                        }}
                    />
                </span>
            ),
            mobile: true,
        },
        {
            field: "documento",
            header: "Nit/CC",
            style: { flexGrow: 1, flexBasis: "8rem", width: "8rem" },
            mobile: true,
        },
        {
            field: "nombre,apellido",
            header: "Nombre",
            style: { flexGrow: 1, flexBasis: "20rem", width: "20rem", wordBreak: "break-word" },
            body: ({ nombre, apellido }) => `${nombre ? nombre : ""} ${apellido ? apellido : ""}`,
            mobile: true,
        },

        {
            field: "usuario",
            header: "Usuario",
            style: { flexGrow: 1, flexBasis: "10rem", width: "10rem" },
        },
        {
            field: "correo",
            header: "Correo",
            style: { flexGrow: 1, flexBasis: "20rem", width: "20rem", wordBreak: "break-word" },
        },
        {
            field: "telefono",
            header: "Teléfono",
            style: { flexGrow: 1, flexBasis: "15rem", width: "15rem" },
        },
        {
            field: "nomperfil",
            header: "Perfil",
            style: { flexGrow: 1, flexBasis: "10rem", width: "10rem" },
        },
        {
            field: "usuact,fecact",
            header: "Actualizado Por",
            style: { flexGrow: 1, flexBasis: "20rem", width: "20rem" },
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
            style: { flexGrow: 1, flexBasis: "8rem", width: "8rem" },
            frozen: isDesktop,
            body: ({ estid, nomestado }) => (
                <ChipStatusComponent id={estid} nameStatus={nomestado} />
            ),
        },
    ];

    const sortField = "nombre";

    const { filtros, setFiltros, datos, totalRecords, pagination, setPagination, onCustomPage } =
        usePaginationData(initialFilters, paginationUsersAPI, setLoading, sortField, () => true);

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

    const contarUsuarios = async () => {
        try {
            const { data } = await countUsersAPI({ idusuario });
            setConprf(data);
        } catch (error) {
            handleApiError(error);
        }
    };
    useEffect(() => {
        if (idusuario) contarUsuarios();
        // eslint-disable-next-line
    }, [idusuario, handleApiError]);

    const deleteApi = useCallback(
        async (usuId) => {
            try {
                const params = {
                    usuId,
                    usuario: nombreusuario,
                };
                const { data } = await deleteUserAPI(params);
                deleteItem({ id: usuId, idField: "usuId" });
                contarUsuarios();
                venUsuario.current.onClose();
                showSuccess(data.message);
            } catch (error) {
                handleApiError(error);
            }
        },
        // eslint-disable-next-line
        [deleteItem, handleApiError, nombreusuario, showSuccess]
    );

    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const renderActions = (item) => {
        const { usuId, nombre } = item;
        const menuItems = [
            {
                label: `Editar`,
                icon: "pi pi-pencil",
                command: () => {
                    venUsuario.current.editUser(item, 0);
                },
                disabled: !canEdit,
                color: "#fda53a",
            },
            {
                label: `Asignar Permisos`,
                icon: "pi pi-lock",
                command: () => {
                    venUsuario.current.editUser(item, 1);
                },
                disabled: !canAssignPermission,
                color: "#0eb0e9",
            },
            {
                label: `Eliminar`,
                icon: "pi pi-trash",
                command: () => {
                    setCurrentUser({ usuId, nombre });
                    setDeleteDialogVisible(true);
                },
                disabled: !canDelete,
                color: "#f43f51",
            },
        ];

        return <ContextMenuActions menuItems={menuItems} itemId={usuId} />;
    };

    const renderTabs = useMemo(() => {
        return [
            <TabPanel
                key="all"
                header={
                    <>
                        TODOS{" "}
                        <span className="p-badge p-component p-badge-primary">
                            {conprf.reduce((acc, curr) => acc + curr.cant, 0)}
                        </span>
                    </>
                }
            />,
            ...conprf.map((perf) => (
                <TabPanel
                    key={perf.prfId}
                    header={
                        <>
                            {perf.nombre}{" "}
                            <span className="p-badge p-component p-badge-primary">{perf.cant}</span>
                        </>
                    }
                />
            )),
        ];
    }, [conprf]);

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
                    onClick={() => venUsuario.current.newUser()}
                    disabled={!canCreate}
                />
            </>
        ),
        [activeFiltersCount, canCreate]
    );

    const headerTemplate = useMemo(
        () => (
            <>
                <div style={{ flexShrink: 0 }}>{actionsToolbar}</div>
            </>
        ),
        [actionsToolbar]
    );

    const handleRowSelect = (e) => {
        const target = e.originalEvent.target;

        if (!canEdit) return;

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

        venUsuario.current.editUser(e.value);
    };

    return (
        <>
            {firstLoad ? (
                <SkeletonMasterLoader />
            ) : (
                <div className={`fade-in`}>
                    <ConfirmDialog
                        visible={deleteDialogVisible}
                        onHide={() => setDeleteDialogVisible(false)}
                        message={`¿Realmente desea eliminar al usuario ${currentUser?.nombre}?`}
                        header="Confirmar Eliminación"
                        icon="pi pi-exclamation-triangle"
                        acceptLabel="Sí"
                        accept={() => {
                            deleteApi(currentUser?.usuId);
                            setDeleteDialogVisible(false);
                        }}
                        reject={() => setDeleteDialogVisible(false)}
                        acceptClassName="p-button-danger"
                    />
                    <PageHeader
                        page="Seguridad"
                        title="Usuarios"
                        description="Administra los usuarios del sistema, asigna perfiles, permisos y gestiona su acceso."
                    />

                    <VenUsuario
                        ref={venUsuario}
                        addItem={(item) => {
                            addItem(item);
                            contarUsuarios();
                        }}
                        updateItem={updateItem}
                        setCurrentUser={setCurrentUser}
                        setDeleteDialogVisible={setDeleteDialogVisible}
                        canAssignPermission={canAssignPermission}
                        canDelete={canDelete}
                        listperfiles={listperfiles}
                    />

                    <Suspense fallback={<LoadingComponent />}>
                        <FilterComponentMemo
                            overlayRef={overlayFiltersRef}
                            initialFilters={initialFilters}
                            filters={filtersConfig}
                            setFilters={setFiltros}
                        />
                        <div className="grid">
                            <div className="col-12 md:col-12">
                                <>
                                    <TabView
                                        activeIndex={
                                            filtros.prfId === null
                                                ? 0
                                                : conprf.findIndex(
                                                      (perf) => perf.prfId === filtros.prfId
                                                  ) + 1
                                        }
                                        onTabChange={(e) => {
                                            const selectedTab =
                                                e.index === 0 ? null : conprf[e.index - 1].prfId;
                                            setFiltros({ ...filtros, prfId: selectedTab });
                                        }}
                                    >
                                        {renderTabs}
                                    </TabView>
                                    {/* <Menubar model={buildOptions()} /> */}
                                    <DataTableComponentMemo
                                        KeyModule={"module_users"}
                                        dataKey={"usuId"}
                                        columns={columnsConfig}
                                        header={headerTemplate}
                                        emptyMessage={
                                            <EmptyState
                                                title="No hay usuarios registrados"
                                                description="Puedes crear un nuevo usuario para comenzar."
                                                buttonLabel="Registrar nuevo usuario"
                                                onButtonClick={() => venUsuario.current.newUser()}
                                                canCreate={canCreate}
                                            />
                                        }
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
                                </>
                            </div>
                        </div>
                    </Suspense>
                </div>
            )}
        </>
    );
};

export default Usuarios;
