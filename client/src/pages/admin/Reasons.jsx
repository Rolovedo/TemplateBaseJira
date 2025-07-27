import React, {
    useRef,
    useContext,
    useState,
    useEffect,
    useMemo,
    useCallback,
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
import PageHeader from "@components/layout/PageHeader";
import { RightToolbar } from "@components/generales";
import ChipStatusComponent from "@components/fields/ChipStatusComponent";

// PrimeReact
import { Button } from "primereact/button";
import { MultiSelect } from "primereact/multiselect";
import VenReasons from "./components/modals/VenReasons";
// APIs
import { deleteReasonApi, paginationReasonsApi, saveReasonApi } from "@api/requests/reasonsAPI";
import { getModulesApi } from "@api/requests";
// Utilities
import { estados, propsSelect } from "@utils/converAndConst";
import { formatNotificationDateTime } from "@utils/formatTime";
import LoadingComponent from "@components/layout/LoadingComponent";
import SkeletonMasterLoader from "@components/generales/SkeletonMasterLoader";
import moment from "moment";
import ContextMenuActions from "@components/data/ContextMenuActions";
import usePermissions from "@context/permissions/usePermissions";
import { ConfirmDialog } from "primereact/confirmdialog";
import EmptyState from "@components/data/EmptyState";

// Lazy Loaded Components
const LazyDataTable = React.lazy(() => import("@components/data/DataTableComponent"));
const DataTableComponentMemo = React.memo(LazyDataTable);

const LazyFilterComponent = React.lazy(() => import("@components/data/FilterOverlay"));
const FilterComponentMemo = React.memo(LazyFilterComponent);

const generateFiltersConfig = ({ filtros }) => [
    { key: "nombre", type: "input", label: "Nombre", filtro: filtros.nombre },
    {
        key: "estado",
        type: "dropdown",
        label: "Estado",
        filtro: filtros.estado,
        props: { ...propsSelect, options: estados },
    },
];

const Reasons = () => {
    const venReason = useRef(null); // MODAL
    const overlayFiltersRef = useRef(null);

    const showOverlayFilters = (event) => {
        overlayFiltersRef.current.toggle(event);
    };

    const { nombreusuario } = useContext(AuthContext);
    const { showSuccess } = useContext(ToastContext);

    const { hasPermission } = usePermissions();
    const canCreate = hasPermission("management", "reasons", "create");
    const canEdit = hasPermission("management", "reasons", "edit");
    const canDelete = hasPermission("management", "reasons", "delete");

    const handleApiError = useHandleApiError();
    const { state, setInitialState, deleteItem, addItem, updateItem } = useHandleData();

    const [loading, setLoading] = useState({ table: false });
    const [listModules, setListModules] = useState([]);
    const [firstLoad, setFirstLoad] = useState(true);
    // Configuration
    const initialFilters = useMemo(() => ({ nombre: null, estado: null }), []);
    const sortField = "nombre";

    // Pagination
    const { filtros, setFiltros, datos, totalRecords, pagination, setPagination, onCustomPage } =
        usePaginationData(initialFilters, paginationReasonsApi, setLoading, sortField, () => true);

    useEffect(() => {
        if (!loading.table && firstLoad) {
            setTimeout(() => setFirstLoad(false), [400]);
        }
    }, [loading.table, firstLoad]);

    // Loading data
    useEffect(() => {
        setInitialState(datos, totalRecords);
        // eslint-disable-next-line
    }, [datos, totalRecords, setInitialState]);

    useEffect(() => {
        getModulesApi()
            .then(({ data }) => {
                setListModules(data);
            })
            .catch((error) => {
                handleApiError(error);
            });
    }, [handleApiError]);

    const filtersConfig = useMemo(() => generateFiltersConfig({ filtros }), [filtros]);

    const getActiveFiltersCount = (filters) => {
        return Object.entries(filters).filter(([key, value]) => {
            return value !== null && value !== undefined && value !== "";
        }).length;
    };

    const activeFiltersCount = useMemo(() => getActiveFiltersCount(filtros), [filtros]);

    const deleteApi = useCallback(
        async (motId) => {
            try {
                const params = { motId, usuact: nombreusuario };
                const { data } = await deleteReasonApi(params);
                showSuccess(data.message);
                venReason.current.onClose();
                deleteItem({ id: motId, idField: "motId" });
            } catch (error) {
                handleApiError(error);
            }
        },
        [deleteItem, handleApiError, nombreusuario, showSuccess]
    );

    const updateData = async ({ campo = "", rowData, newValue }) => {
        try {
            const params = {
                ...rowData,
                usuact: nombreusuario,
                fecact: moment().format("YYYY-MM-DD HH:mm:ss"),
                [campo]: campo === "modulos" ? newValue.join(",") : newValue,
            };
            await saveReasonApi(params);
            // showSuccess(data.message);
            updateItem({ idField: "motId", ...params });
        } catch (error) {
            handleApiError(error);
        }
    };

    // Renders
    const columnsConfig = [
        {
            field: "nombre",
            header: "Nombre",
            style: { flexGrow: 1, flexBasis: "20rem", minWidth: "20rem" },
            mobile: true,
        },
        {
            field: "modulos",
            header: "Módulos",
            style: { flexGrow: 1, flexBasis: "15rem", minWidth: "15rem" },
            mobile: true,
            body: (rowData) => {
                const value = rowData.modulos ? rowData.modulos.split(",").map(Number) : [];
                return (
                    <MultiSelect
                        {...propsSelect}
                        value={value}
                        options={listModules}
                        style={{ width: "100%" }}
                        onChange={(e) =>
                            updateData({ campo: "modulos", rowData, newValue: e.value })
                        }
                    />
                );
            },
        },
        {
            field: "usuact, fecact",
            header: "Actualizado Por",
            style: { flexGrow: 1, flexBasis: "20rem", minWidth: "20rem" },
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
            body: ({ estado, nomestado }) => (
                <ChipStatusComponent id={estado} nameStatus={nomestado} />
            ),
        },
    ];

    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [currentReason, setCurrentReason] = useState(null);

    const renderActions = (item) => {
        const { motId, nombre } = item;
        const menuItems = [
            {
                label: "Editar",
                icon: "pi pi-pencil",
                command: () => venReason.current.editReason(item),
                disabled: !canEdit,
                color: "#fda53a", // Color naranja para editar
            },
            {
                label: "Eliminar",
                icon: "pi pi-trash",
                command: () => {
                    setCurrentReason({ motId, nombre });
                    setDeleteDialogVisible(true);
                },
                disabled: !canDelete,
                color: "#f43f51",
            },
        ];

        return <ContextMenuActions menuItems={menuItems} itemId={motId} />;
    };

    const actionsToolbar = useMemo(
        () => (
            <>
                <div style={{ position: "relative", display: "inline-block" }}>
                    <Button
                        icon="pi pi-sliders-h"
                        label="Filtros"
                        iconPos="left"
                        className="p-button-rounded p-button-sm ml-2"
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
                    label="Nuevo"
                    onClick={() => venReason.current.newReason()}
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

        venReason.current.editReason(e.value);
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
                        message={`Realmente desea eliminar el motivo ${currentReason?.nombre}?`}
                        header="Confirmar Eliminación"
                        icon="pi pi-exclamation-triangle"
                        acceptLabel="Sí"
                        accept={() => {
                            deleteApi(currentReason?.motId);
                            setDeleteDialogVisible(false);
                        }}
                        reject={() => setDeleteDialogVisible(false)}
                        acceptClassName="p-button-danger"
                    />
                    <VenReasons
                        ref={venReason}
                        addItem={addItem}
                        updateItem={updateItem}
                        setCurrentReason={setCurrentReason}
                        setDeleteDialogVisible={setDeleteDialogVisible}
                        canDelete={canDelete}
                    />

                    <PageHeader
                        page="Administración"
                        title="Motivos"
                        description="Gestiona la creación y asignación de motivos, ya sean razones de rechazo u otras causas."
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
                                title="No hay motivos registrados"
                                description="Puedes crear un nueva motivo para comenzar."
                                buttonLabel="Registrar nuevo motivo"
                                onButtonClick={() => venReason.current.newReason()}
                                canCreate={canCreate}
                            />
                        ) : (
                            <div className="grid">
                                <div className="col-12">
                                    <DataTableComponentMemo
                                        KeyModule={"module_reasons"}
                                        dataKey="motId"
                                        columns={columnsConfig}
                                        header={headerTemplate}
                                        datos={state.datos}
                                        totalRecords={state.totalRecords}
                                        loading={loading.table}
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

export default Reasons;
