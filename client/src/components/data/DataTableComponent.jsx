import React, { useEffect, useMemo, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { propsDataTable } from "@utils/converAndConst";
import NoDataInformation from "./NoDataInformation";
import { OverlayPanel } from "primereact/overlaypanel";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { useMediaQueryContext } from "@context/mediaQuery/mediaQueryContext";

const DataTableComponent = ({
    KeyModule = null,
    editMode,
    dataKey,
    header,
    datos,
    columns,
    loading,
    totalRecords,
    pagination,
    onCustomPage,
    setPagination,
    actionBodyTemplate,
    isPagination = true,
    isChecked = false,
    isRowSelectable = false,
    selection,
    onSelectionChange,
    hasfooter = false,
    footerColumnGroup,
    width = null,
    rowClassName,
    emptyMessage = null,
}) => {
    const { isMobile } = useMediaQueryContext();
    const [isLoaded, setIsLoaded] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState(columns); // Estado para columnas visibles
    const overlayPanelRef = useRef(null); // Referencia para el OverlayPanel
    const storageKey = `visibleColumns_${KeyModule}`; // Clave única para cada módulo
    const hasLoadedFromStorage = useRef(false); // Para evitar carga múltiple

    const filteredColumns = useMemo(() => {
        if (isMobile) {
            return columns.filter((col) => col.mobile === true);
        }
        return columns;
    }, [columns, isMobile]);

    useEffect(() => {
        if (!isMobile) {
            const savedColumns = localStorage.getItem(storageKey);
            if (savedColumns) {
                const parsedColumns = JSON.parse(savedColumns);
                const orderedColumns = columns.filter((col) =>
                    parsedColumns.some((sc) => sc.field === col.field)
                );
                setVisibleColumns(orderedColumns);
            } else {
                setVisibleColumns(filteredColumns);
            }
            hasLoadedFromStorage.current = true;
        } else {
            setVisibleColumns(filteredColumns);
        }
    }, [KeyModule, columns, isMobile, filteredColumns, storageKey]);

    useEffect(() => {
        if (!isMobile && hasLoadedFromStorage.current) {
            localStorage.setItem(storageKey, JSON.stringify(visibleColumns));
        }
    }, [visibleColumns, storageKey, isMobile]);

    // Cargar configuración desde localStorage solo una vez
    useEffect(() => {
        if (!hasLoadedFromStorage.current && KeyModule) {
            const savedColumns = localStorage.getItem(storageKey);
            if (savedColumns) {
                const parsedColumns = JSON.parse(savedColumns);
                const orderedColumns = columns.filter((col) =>
                    parsedColumns.some((sc) => sc.field === col.field)
                ); // Mantener orden original
                setVisibleColumns(orderedColumns);
            }
            hasLoadedFromStorage.current = true; // Marcar como cargado
        }

        // eslint-disable-next-line
    }, [KeyModule]); // Solo cambia si cambia el módulo

    // Guardar en localStorage cada vez que el usuario cambia la configuración de columnas
    useEffect(() => {
        if (hasLoadedFromStorage.current) {
            // Solo guarda después de haber cargado la configuración inicial
            localStorage.setItem(storageKey, JSON.stringify(visibleColumns));
        }
    }, [visibleColumns, storageKey]);

    // Alternar visibilidad de columnas
    const toggleColumn = (col) => {
        setVisibleColumns((prev) => {
            if (prev.some((c) => c.field === col.field)) {
                return prev.filter((c) => c.field !== col.field);
            } else {
                return filteredColumns.filter((originalCol) =>
                    [...prev, col].some((selectedCol) => selectedCol.field === originalCol.field)
                );
            }
        });
    };

    // Restablecer columnas al estado inicial
    const resetColumns = () => {
        setVisibleColumns(columns);
        localStorage.removeItem(storageKey);
    };

    const dynamicColumns = (
        <>
            {/* Botón para abrir el menú */}
            <Button
                label="Opciones"
                icon="pi pi-microsoft"
                iconPos="left"
                onClick={(e) => overlayPanelRef.current.toggle(e)}
                className="p-button-rounded p-button-secondary p-button-sm"
            />

            {/* Menú con checkboxes dentro del OverlayPanel */}
            <OverlayPanel ref={overlayPanelRef}>
                <div style={{ padding: "15px", width: "230px", textAlign: "left" }}>
                    <h5 style={{ marginBottom: "10px", textAlign: "center" }}>
                        Seleccionar Columnas
                    </h5>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {columns.map((col) => (
                            <div
                                key={col.field}
                                style={{ display: "flex", alignItems: "center", gap: "10px" }}
                            >
                                <Checkbox
                                    inputId={col.field}
                                    checked={visibleColumns.some((c) => c.field === col.field)}
                                    onChange={() => toggleColumn(col)}
                                />
                                <label
                                    htmlFor={col.field}
                                    style={{ cursor: "pointer", flexGrow: 1 }}
                                >
                                    {col.header}
                                </label>
                            </div>
                        ))}
                    </div>
                    <hr style={{ margin: "12px 0", border: "0.5px solid #ccc" }} />
                    <Button
                        label="Restablecer"
                        icon="pi pi-refresh"
                        className="p-button-text p-button-sm"
                        onClick={resetColumns}
                        style={{ width: "100%", marginTop: "5px" }}
                    />
                </div>
            </OverlayPanel>
        </>
    );

    useEffect(() => {
        if (!loading) {
            setTimeout(() => setIsLoaded(true), 100);
        }
    }, [loading]);

    const selectionColumn = {
        selectionMode: "multiple",
        headerStyle: { width: "3rem" },
        style: { width: "3rem" },
    };

    const paginationProps = useMemo(() => {
        return isPagination
            ? {
                  paginator: true,
                  totalRecords: totalRecords,
                  rows: pagination.rows,
                  first: pagination.first,
                  sortOrder: pagination.sortOrder,
                  sortField: pagination.sortField,
                  onPage: onCustomPage,
                  onSort: (e) =>
                      setPagination({
                          ...pagination,
                          sortField: e.sortField,
                          sortOrder: e.sortOrder,
                      }),
              }
            : {
                  paginator: false,
              };
    }, [isPagination, totalRecords, onCustomPage, setPagination, pagination]);

    const selectionMode = useMemo(() => {
        if (isChecked) return "multiple";
        if (isRowSelectable) return "single";
        return null;
    }, [isChecked, isRowSelectable]);

    return (
        <div className={`datatable-container ${isLoaded ? "show" : ""}`}>
            <DataTable
                {...propsDataTable}
                {...paginationProps}
                stripedRows={true}
                dataKey={dataKey}
                header={
                    KeyModule ? (
                        <div
                            className="col-12"
                            style={{ display: "flex", justifyContent: "space-between" }}
                        >
                            {dynamicColumns}
                            {header}
                        </div>
                    ) : (
                        <>{header}</>
                    )
                }
                value={datos}
                scrollHeight={width || window.innerHeight - 320}
                loading={loading}
                selectionMode={selectionMode}
                selection={selection}
                onSelectionChange={onSelectionChange}
                footerColumnGroup={hasfooter ? footerColumnGroup() : <></>}
                rowClassName={rowClassName}
                emptyMessage={
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                            width: "100%",
                        }}
                    >
                        {emptyMessage ? (
                            emptyMessage
                        ) : (
                            <NoDataInformation
                                img="nodata.svg"
                                text="Vaya! Pero al parecer no hay información disponible"
                            />
                        )}
                    </div>
                }
                editMode={editMode || null}
            >
                {!isPagination && isChecked && (
                    <Column
                        {...selectionColumn}
                        header={<></>}
                        frozen={true}
                        alignFrozen={"left"}
                        style={{
                            flexGrow: 1,
                            flexBasis: "3rem",
                            maxWidth: "3rem",
                            minWidth: "3rem",
                        }}
                    />
                )}

                {visibleColumns.map((col) => (
                    <Column
                        key={col.field}
                        field={col.field}
                        header={col.header}
                        sortable={col.sortable ?? true}
                        style={col.style}
                        body={col.body}
                        bodyStyle={col.bodyStyle ? col.bodyStyle : null}
                        frozen={col.frozen ? col.frozen : false}
                        alignFrozen={col.alignFrozen ? col.alignFrozen : "right"}
                    />
                ))}

                {actionBodyTemplate && (
                    <Column
                        body={actionBodyTemplate}
                        frozen
                        alignFrozen="right"
                        style={{
                            flexGrow: 1,
                            flexBasis: "5rem",
                            maxWidth: "5rem",
                            minWidth: "5rem",
                        }}
                        align="center"
                    />
                )}
            </DataTable>
        </div>
    );
};

export default DataTableComponent;
