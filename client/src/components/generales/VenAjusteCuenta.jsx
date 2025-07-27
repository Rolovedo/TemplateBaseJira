import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "@context/auth/AuthContext";
import { ToastContext } from "@context/toast/ToastContext";
// PRIMEREACT
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Accordion, AccordionTab } from "primereact/accordion";
import { classNames } from "primereact/utils";
// OTROS
import { useForm } from "react-hook-form";
//import Axios from "axios";
// UTILS
//import { headers } from "@utils/converAndConst";
//import { ActualizarClave } from "./ActualizarClave";
//import Cookies from "js-cookie";

export const VenAjusteCuenta = ({ visible, setVisible }) => {
    const { idusuario } = useContext(AuthContext);
    const { showSuccess, showError, showInfo } = useContext(ToastContext);

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            nombre: "",
            apellido: "",
            usuario: "",
            correo: "",
        },
    });

    const [originalData, setOriginalData] = useState({
        nombre: "",
        apellido: "",
        usuario: "",
        correo: "",
    });

    useEffect(() => {
        const abortController = new AbortController();

        if (idusuario > 0) {
            // ← USAR DATOS MOCK EN LUGAR DE API
            console.log('📊 Cargando datos mock para desarrollo...');
            
            // Simular datos del usuario
            const mockData = {
                nombre: "Administrador",
                apellido: "Sistema", 
                usuario: "admin@tablero.com",
                correo: "admin@tablero.com"
            };

            // ← INTENTAR OBTENER DATOS REALES DEL LOCALSTORAGE
            try {
                const storedUser = localStorage.getItem('user');
                const tableroUser = localStorage.getItem('user_data');
                
                if (tableroUser) {
                    const parsedUser = JSON.parse(tableroUser);
                    mockData.nombre = parsedUser.nombre || "Administrador";
                    mockData.correo = parsedUser.correo || "admin@tablero.com";
                    mockData.usuario = parsedUser.usuario || "admin@tablero.com";
                    mockData.apellido = parsedUser.apellido || "Sistema";
                } else if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    mockData.nombre = parsedUser.nombre || "Administrador";
                    mockData.correo = parsedUser.email || parsedUser.correo || "admin@tablero.com";
                    mockData.usuario = parsedUser.usuario || parsedUser.email || "admin@tablero.com";
                    mockData.apellido = parsedUser.apellido || "Sistema";
                }
            } catch (error) {
                console.log('⚠️ Error leyendo datos del localStorage, usando defaults');
            }

            // ← ESTABLECER VALORES EN EL FORMULARIO
            Object.keys(mockData).forEach((fieldName) => {
                const fieldExists = getValues(fieldName);
                if (fieldExists !== undefined) {
                    setValue(fieldName, mockData[fieldName]);
                }
            });

            setOriginalData(mockData);
            console.log('✅ Datos mock cargados:', mockData);

            // ← COMENTAR LA LLAMADA A API HASTA QUE ESTÉ LISTA
            /*
            Axios.get("api/auth/get_basic_information", {
                params: { usuId: idusuario },
                headers: { ...headers, Authorization: `Bearer ${Cookies.get("tokenPONTO")}` },
            })
                .then(({ data }) => {
                    Object.keys(data).forEach((fieldName) => {
                        const fieldExists = getValues(fieldName);

                        if (fieldExists !== undefined) {
                            const type = typeof fieldExists;
                            const value =
                                type === "number" ? Number(data[fieldName]) : data[fieldName];
                            setValue(fieldName, value);
                        }
                    });

                    setOriginalData(data);
                })
                .catch((error) => {
                    if (error.response) {
                        if (error.response.status === 404) return showError("Api no encontrada");
                        return showError(error.response?.data.message);
                    }
                    showError(error);
                });
            */
        }

        return () => abortController.abort();
    }, [idusuario, setValue, getValues, showError]);

    const modificarCuenta = async ({ nombre, apellido, usuario, correo }) => {
        if (
            nombre === originalData.nombre &&
            apellido === originalData.apellido &&
            usuario === originalData.usuario &&
            correo === originalData.correo
        ) {
            return showInfo("No has hecho ninguna actualización");
        }

        // ← SIMULAR ACTUALIZACIÓN EXITOSA
        console.log('🔄 Simulando actualización de cuenta...');
        
        try {
            // Simular delay de API
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Actualizar datos mock
            const newData = { nombre, apellido, usuario, correo };
            setOriginalData(newData);
            
            // Actualizar localStorage si existe
            try {
                const storedUserData = localStorage.getItem('user_data');
                if (storedUserData) {
                    const updatedUser = {
                        ...JSON.parse(storedUserData),
                        nombre,
                        apellido,
                        usuario,
                        correo
                    };
                    localStorage.setItem('user_data', JSON.stringify(updatedUser));
                }
            } catch (error) {
                console.log('⚠️ Error actualizando localStorage');
            }
            
            showSuccess("Datos de cuenta actualizados exitosamente (modo desarrollo)");
            console.log('✅ Datos actualizados:', newData);
            
        } catch (error) {
            showError("Error simulando la actualización");
        }

        // ← COMENTAR LA LLAMADA A API HASTA QUE ESTÉ LISTA
        /*
        const params = {
            nombre,
            apellido,
            usuario,
            correo,
            usuarioact: nombreusuario,
            usuId: idusuario,
        };

        try {
            const { data } = await Axios.put("api/security/users/update_account", params, {
                headers: { ...headers, Authorization: `Bearer ${Cookies.get("tokenPONTO")}` },
            });
            showSuccess(data.message);
            reset();
            setVisible(false);
        } catch (error) {
            if (error.response) {
                if (error.response.status === 404) return showError("Api no encontrada");
                return showError(error.response?.data.message);
            }
            showError(error);
        }
        */
    };

    return (
        <Dialog
            closeOnEscape={false}
            header="Ajuste de Cuenta"
            visible={visible}
            onHide={() => {
                setVisible(false);
                reset();
            }}
            breakpoints={{ "960px": "75vw", "640px": "100vw" }}
            style={{ width: "40vw" }}
        >
            <form onSubmit={handleSubmit(modificarCuenta)}>
                <div className="grid p-fluid">
                    <div className="col-12 md:col-6">
                        <label>Nombre</label>
                        <InputText
                            placeholder="Nombre"
                            className={classNames({ "p-invalid": errors.nombre })}
                            {...register("nombre", { required: "El campo nombre es requerido" })}
                        />
                        <div className={classNames({ "p-error": errors.nombre })}>
                            {errors.nombre?.message}
                        </div>
                    </div>
                    <div className="col-12 md:col-6">
                        <label>Apellido</label>
                        <InputText
                            placeholder="Apellido"
                            className={classNames({ "p-invalid": errors.apellido })}
                            {...register("apellido")}
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <label>Usuario</label>
                        <InputText
                            placeholder="Usuario"
                            className={classNames({ "p-invalid": errors.usuario })}
                            {...register("usuario", { required: "El campo usuario es requerido" })}
                        />
                        <div className={classNames({ "p-error": errors.usuario })}>
                            {errors.usuario?.message}
                        </div>
                    </div>
                    <div className="col-12 md:col-6">
                        <label>Correo Electrónico</label>
                        <InputText
                            placeholder="Correo"
                            type="email"
                            className={classNames({ "p-invalid": errors.correo })}
                            {...register("correo", { 
                                required: "El campo correo es requerido",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Formato de correo inválido"
                                }
                            })}
                        />
                        <div className={classNames({ "p-error": errors.correo })}>
                            {errors.correo?.message}
                        </div>
                    </div>

                    {/* ← AGREGAR BOTONES DE ACCIÓN */}
                    <div className="col-12 mt-3">
                        <div className="flex justify-content-end gap-2">
                            <button
                                type="button"
                                className="p-button p-component p-button-secondary"
                                onClick={() => {
                                    setVisible(false);
                                    reset();
                                }}
                            >
                                <span className="p-button-icon pi pi-times"></span>
                                <span className="p-button-label">Cancelar</span>
                            </button>
                            <button
                                type="submit"
                                className="p-button p-component p-button-primary"
                            >
                                <span className="p-button-icon pi pi-check"></span>
                                <span className="p-button-label">Guardar</span>
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            <div className="col-12 mt-3">
                <Accordion activeIndex={null}>
                    <AccordionTab header="Cambiar contraseña">
                        <div className="p-4 text-center">
                            <i className="pi pi-lock" style={{ fontSize: '2rem', color: '#007bff', marginBottom: '1rem' }}></i>
                            <h4>Cambio de contraseña</h4>
                            <p style={{ color: '#6c757d', marginBottom: '1rem' }}>
                                Esta funcionalidad estará disponible cuando se implemente el backend completo.
                            </p>
                            <div style={{ 
                                background: '#f8f9fa', 
                                border: '1px solid #dee2e6', 
                                borderRadius: '8px', 
                                padding: '1rem',
                                fontSize: '0.9rem',
                                color: '#495057'
                            }}>
                                <strong>Para desarrollo:</strong><br />
                                Por ahora los datos se guardan temporalmente en memoria local.
                            </div>
                        </div>
                    </AccordionTab>
                </Accordion>
            </div>
        </Dialog>
    );
};
