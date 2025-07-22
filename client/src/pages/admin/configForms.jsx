import { estados } from "@utils/converAndConst";
import memoize from "memoize-one";

export const masterTemplateForm = memoize(() => {
    return [
        {
            key: "bas-1",
            className: "col-12",
            type: "text",
            name: "nombre",
            label: "Nombre",
            props: { className: "uppercase-text" },
            validation: { required: "El campo nombre es requerido" },
            required: true,
        },
        {
            key: "bas-2",
            type: "selectButton",
            name: "estado",
            label: "Estado",
            options: estados,
            validation: { required: "El campo estado es requerido" },
            required: true,
            className: "col-12",
        },
    ];
});

export const reasonsForm = memoize(({ listModules }) => {
    return [
        {
            key: "mot-1",
            className: "col-12",
            type: "text",
            name: "nombre",
            label: "Nombre",
            props: { className: "uppercase-text" },
            validation: { required: "El campo nombre es requerido" },
            required: true,
        },
        {
            key: "mot-2",
            type: "selectButton",
            name: "estado",
            label: "Estado",
            options: estados,
            validation: { required: "El campo estado es requerido" },
            required: true,
            className: "col-12",
        },
        {
            key: "mot-3",
            type: "multiselect",
            name: "modulos",
            label: "Módulos",
            options: listModules || [],
            validation: { required: "El campo módulos es requerido" },
            required: true,
            className: "col-12",
        },
    ];
});
