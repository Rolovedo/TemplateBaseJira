import React from "react";
import { Dialog } from "primereact/dialog";
// import { InputText } from "primereact/inputtext";
// import { InputNumber } from "primereact/inputnumber";
// import { Checkbox } from "primereact/checkbox";
// import { Button } from "primereact/button";
// import { ToastContext } from "@context/toast/ToastContext";
// import Axios from "axios";
// import Cookies from "js-cookie";
import "@styles/VenReglas.css";
// import { MultiSelect } from "primereact/multiselect";

// const initialState = {
//     horarioInicio: "08:00",
//     horarioFin: "17:00",
//     anticipacionMinimaReagendar: 2, // horas
//     permitirCancelarMismoDia: false,
//     notificarAntesMinutos: 30,
//     metodoNotificacion: "email",
//     maxSesionesPorDia: 5,
//     habilitarWhatsapp: false,
//     whatsappToken: "",
//     whatsappNumero: "",
//     habilitarCorreo: false,
//     habilitarSMS: false,
//     smsAPIKey: "",
//     numeroPrincipal: "",
//     otroNumero: "",
// };

// const metodoOptions = [
//     { label: "Correo", value: "email" },
//     { label: "WhatsApp", value: "whatsapp" },
//     { label: "SMS", value: "sms" },
// ];
// const reglasConfig = [
//     {
//         key: "cronRecordatorio",
//         title: "Recordatorio de Citas",
//         description:
//             "Configura cuándo y cómo se enviarán recordatorios automáticos de citas a los pacientes.",
//         fields: [
//             {
//                 key: "habilitarCronRecordatorio",
//                 label: "Habilitar recordatorio de citas",
//                 type: "checkbox",
//                 component: Checkbox,
//             },
//             {
//                 key: "recordarNDiasAntes",
//                 label: "¿Recordar N días antes?",
//                 type: "checkbox",
//                 component: Checkbox,
//                 showIf: (rules) => rules.habilitarCronRecordatorio,
//             },
//             {
//                 key: "cronDiasAnticipacion",
//                 label: "¿Cuántos días antes recordar?",
//                 type: "number",
//                 component: InputNumber,
//                 props: { showButtons: true, min: 1, max: 7 },
//                 showIf: (rules) => rules.habilitarCronRecordatorio && rules.recordarNDiasAntes,
//             },
//             {
//                 key: "recordarMismoDia",
//                 label: "¿Recordar el mismo día?",
//                 type: "checkbox",
//                 component: Checkbox,
//                 showIf: (rules) => rules.habilitarCronRecordatorio && !rules.recordarNDiasAntes,
//             },
//             {
//                 key: "cronHorasAnticipacion",
//                 label: "¿Cuántas horas antes recordar el mismo día?",
//                 type: "number",
//                 component: InputNumber,
//                 props: { showButtons: true, min: 1, max: 24 },
//                 showIf: (rules) =>
//                     rules.habilitarCronRecordatorio &&
//                     rules.recordarMismoDia &&
//                     !rules.recordarNDiasAntes,
//             },
//         ],
//     },
//     {
//         key: "horario",
//         title: "Horario laboral",
//         description: "Define el horario base durante el cual se pueden agendar sesiones.",
//         fields: [
//             {
//                 key: "horarioInicio",
//                 label: "Desde",
//                 type: "time",
//                 component: InputText,
//             },
//             {
//                 key: "horarioFin",
//                 label: "Hasta",
//                 type: "time",
//                 component: InputText,
//             },
//         ],
//     },
//     {
//         key: "modificacion",
//         title: "Política de modificación",
//         description: "Controla cuándo un usuario puede cancelar o reagendar una sesión.",
//         fields: [
//             {
//                 key: "anticipacionMinimaReagendar",
//                 label: "Horas mínimas para reagendar",
//                 type: "number",
//                 component: InputNumber,
//                 props: { showButtons: true, min: 0, max: 48 },
//             },
//             {
//                 key: "permitirCancelarMismoDia",
//                 label: "Permitir cancelar sesiones el mismo día",
//                 type: "checkbox",
//                 component: Checkbox,
//             },
//             {
//                 key: "anticipacionMinimaCancelar",
//                 label: "Horas mínimas para cancelar el mismo día",
//                 type: "number",
//                 component: InputNumber,
//                 props: { showButtons: true, min: 0, max: 24 },
//                 showIf: (rules) => !!rules.permitirCancelarMismoDia, // <-- solo si está activo
//             },
//         ],
//     },
//     {
//         key: "Contacto",
//         title: "Números de contacto para el paciente.",
//         description: "Proporciona los números de contacto al paciente para atención al cliente..",
//         fields: [
//             {
//                 key: "numeroPrincipal",
//                 label: "Número de WhatsApp",
//                 type: "text",
//                 component: InputText,
//             },
//             {
//                 key: "otroNumero",
//                 label: "Otro número de contacto",
//                 type: "text",
//                 component: InputText,
//             },
//         ],
//     },
//     // {
//     //     key: "notificaciones",
//     //     title: "Alertas y notificaciones",
//     //     description: "Configura cuándo y cómo se notifica a los usuarios sobre sus sesiones.",
//     //     fields: [
//     //         {
//     //             key: "notificarAntesMinutos",
//     //             label: "Minutos de anticipación",
//     //             type: "number",
//     //             component: InputNumber,
//     //             props: { showButtons: true, min: 5, max: 240 },
//     //         },
//     //         {
//     //             key: "metodosNotificacion",
//     //             label: "Métodos de notificación",
//     //             type: "multiselect",
//     //             component: MultiSelect,
//     //             props: { options: metodoOptions, placeholder: "Seleccionar métodos" },
//     //         },
//     //     ],
//     // },
//     {
//         key: "limites",
//         title: "Límites",
//         description: "Controla cuántas sesiones puede tener una persona al día.",
//         fields: [
//             {
//                 key: "maxSesionesPorDia",
//                 label: "Máx. sesiones por día por usuario",
//                 type: "number",
//                 component: InputNumber,
//                 props: { showButtons: true, min: 1, max: 20 },
//             },
//         ],
//     },
//     {
//         key: "mensajeria",
//         title: "Mensajería (WhatsApp & Correo electrónico)",
//         description: "Configura los servicios de mensajería automatizada para recordatorios.",
//         fields: [
//             {
//                 key: "habilitarCorreo",
//                 label: "Habilitar notificaciones por correo.",
//                 type: "checkbox",
//                 component: Checkbox,
//             },
//             {
//                 key: "habilitarWhatsapp",
//                 label: "Habilitar WhatsApp",
//                 type: "checkbox",
//                 component: Checkbox,
//             },
//             {
//                 key: "whatsappToken",
//                 label: "Token API",
//                 type: "text",
//                 component: InputText,
//                 showIf: (rules) => rules.habilitarWhatsapp,
//             },
//             {
//                 key: "whatsappNumero",
//                 label: "Número emisor",
//                 type: "text",
//                 component: InputText,
//                 showIf: (rules) => rules.habilitarWhatsapp,
//             },

//             // {
//             //     key: "habilitarSMS",
//             //     label: "Habilitar SMS",
//             //     type: "checkbox",
//             //     component: Checkbox,
//             // },
//             // {
//             //     key: "smsAPIKey",
//             //     label: "API Key",
//             //     type: "text",
//             //     component: InputText,
//             //     showIf: (rules) => rules.habilitarSMS,
//             // },
//         ],
//     },
// ];

export const VenReglas = ({ visible, setVisible }) => {
    // const { showError, showSuccess } = useContext(ToastContext);
    // const [loading, setLoading] = useState(false);
    // const [rules, setRules] = useState(initialState);

    // useEffect(() => {
    //     setLoading(true);
    //     Axios.get("api/app/get_rules", {
    //         headers: { Authorization: `Bearer ${Cookies.get("tokenPONTO")}` },
    //     })
    //         .then(({ data }) => {
    //             setRules({ ...initialState, ...data });
    //             setLoading(false);
    //         })
    //         .catch((err) => {
    //             showError("Error al cargar las reglas de negocio");
    //             setLoading(false);
    //         });
    // }, []);

    // const saveRules = () => {
    //     Axios.put("api/app/update_rules", rules, {
    //         headers: { Authorization: `Bearer ${Cookies.get("tokenPONTO")}` },
    //     })
    //         .then(() => showSuccess("Reglas actualizadas"))
    //         .catch(() => showError("Error al guardar las reglas"));
    // };

    return (
        <Dialog
            header="Configuraciones del sistema"
            visible={visible}
            onHide={() => setVisible(false)}
            breakpoints={{ "960px": "75vw", "640px": "100vw" }}
            style={{ width: "25vw" }}
            footer={
                <div className="flex justify-content-end">
                    {/* <Button
                        label="Guardar Cambios"
                        className="p-button-primary"
                        onClick={saveRules}
                    /> */}
                </div>
            }
        >
            <div className="grid p-fluid">
                {/* {reglasConfig.map((section) => (
                    <div className="col-12 mb-4" key={section.key}>
                        <h5>{section.title}</h5>
                        <p className="text-sm text-secondary mb-3">{section.description}</p>
                        <hr />
                        {section.fields.map((field) => {
                            if (field.showIf && !field.showIf(rules)) return null;
                            const Comp = field.component;
                            return (
                                <div className="field" key={field.key}>
                                    {field.type === "checkbox" ? (
                                        <>
                                            <Comp
                                                inputId={field.key}
                                                checked={!!rules[field.key]}
                                                onChange={(e) =>
                                                    setRules({
                                                        ...rules,
                                                        [field.key]: e.checked,
                                                    })
                                                }
                                                {...field.props}
                                            />
                                            <label htmlFor={field.key} className="ml-2 mt-2">
                                                {field.label}
                                            </label>
                                        </>
                                    ) : (
                                        <>
                                            <label className="mt-2">{field.label}</label>
                                            <Comp
                                                value={rules[field.key]}
                                                onChange={(e) =>
                                                    setRules({
                                                        ...rules,
                                                        [field.key]:
                                                            field.type === "number"
                                                                ? e.value
                                                                : e.target.value,
                                                    })
                                                }
                                                {...field.props}
                                                type={
                                                    field.type !== "number" ? field.type : undefined
                                                }
                                            />
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))} */}
            </div>
        </Dialog>
    );
};
