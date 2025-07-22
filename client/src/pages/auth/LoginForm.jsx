import React from "react";
import { Button } from "primereact/button";

const LoginForm = ({ register, handleSubmit, errors, onLoginUser, loading, setActiveForm }) => {
    return (
        <form className={`form-login`} onSubmit={handleSubmit(onLoginUser)} noValidate>
            <label>Usuario o correo electrónico</label>
            <input
                type="text"
                name="usuario"
                placeholder="ejemplo@email.com"
                {...register("usuario", {
                    required: "El usuario o correo electrónico es obligatorio",
                })}
            />
            {errors.usuario && <p className="input-error">{errors.usuario.message}</p>}

            <label>Contraseña</label>
            <input
                type="password"
                name="clave"
                placeholder="**************"
                {...register("clave", {
                    required: "La contraseña es obligatoria",
                })}
            />
            {errors.clave && <p className="input-error">{errors.clave.message}</p>}

            <div className="forgot-password">
                <Button
                    type="button"
                    label="¿Olvidaste tu contraseña?"
                    onClick={() => setActiveForm("recover")}
                    className="p-button-link"
                />
            </div>

            <Button
                type="submit"
                label="Iniciar sesión"
                className="btn-login"
                loading={loading}
                disabled={loading}
            />
        </form>
    );
};

export default LoginForm;
