import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import Cookies from "js-cookie";
import { AuthContext } from "@context/auth/AuthContext";
import { useForm } from "react-hook-form";
import { VentanaRecuperar } from "@components/generales";
import { VenCambioClave } from "@components/generales/VenCambioClave";
import "./styles/login.css";
import { ruta } from "@utils/converAndConst";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import OtpVerificationModal from "./OtpVerificationModal";
import useHandleApiError from "@hook/useHandleApiError";
import { registerAPI, resendOtpAPI } from "@api/requests";
import { ToastContext } from "@context/toast/ToastContext";

const Login = () => {
    const history = useHistory();
    const { login } = useContext(AuthContext);
    const { showSuccess } = useContext(ToastContext);
    const [activeForm, setActiveForm] = useState("login"); // "login", "register", "recover"
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [loadingLogin, setLoadingLogin] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpUserData, setOtpUserData] = useState(null);
    const handleApiError = useHandleApiError();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            usuario: "",
            clave: "",
        },
    });

    const {
        register: registerSignup,
        handleSubmit: handleSubmitSignup,
        watch,
        formState: { errors: errorsSignup },
    } = useForm();

    const onLoginUser = async ({ usuario, clave }) => {
        setLoadingLogin(true);

        try {
            const data = await login(usuario, clave);

            if (!data) return;

            const { cambioclave, usuId, perfil } = data;

            if (Number(cambioclave) === 1) {
                Cookies.set("autentificadoCASAL", false);
                setShowChangePasswordModal(true);
            } else if (usuId > 0) {
                if (Number(perfil) === 3) {
                    history.push("/patients");
                } else {
                    history.push("/dashboard");
                }
            }
        } catch (error) {
            // manejar error si es necesario
        } finally {
            setLoadingLogin(false);
        }
    };

    const onRegisterUser = async (data) => {
        try {
            const { data: dataRes } = await registerAPI(data);

            if (dataRes?.usuId) {
                // Guardamos info para reintento de OTP y login
                setOtpUserData({
                    usuId: dataRes.usuId,
                    correo: dataRes.correo,
                    usuario: dataRes.usuario,
                    clave: dataRes.clave,
                });
                setShowOtpModal(true);
            }
        } catch (error) {
            handleApiError(error);
        }
    };

    const handleOtpVerifySuccess = async () => {
        const { usuario, clave } = otpUserData;

        try {
            const data = await login(usuario, clave);

            if (!data) return;

            const { cambioclave, usuId } = data;

            if (Number(cambioclave) === 1) {
                Cookies.set("autentificadoCASAL", false);
                setShowChangePasswordModal(true);
            } else if (usuId > 0) {
                window.location.href = `${ruta}#/dashboard`;
            }
        } catch (error) {
            handleApiError(error);
        }
    };

    const handleResendOtp = async () => {
        try {
            await resendOtpAPI({ usuId: otpUserData.usuId });
            showSuccess("Código reenviado nuevamente.");
        } catch (error) {
            handleApiError(error);
        }
    };

    return (
        <>
            <VenCambioClave
                visible={showChangePasswordModal}
                onClose={() => setShowChangePasswordModal(false)}
            />

            {showOtpModal && otpUserData && (
                <OtpVerificationModal
                    usuId={otpUserData.usuId}
                    correo={otpUserData.correo}
                    onVerifySuccess={handleOtpVerifySuccess}
                    onResendOtp={handleResendOtp}
                />
            )}

            <div className="login-wrapper">
                <div className="login-card">
                    <div className="login-form-section">
                        <div className="logos-header">
                            <img
                                src={`${process.env.PUBLIC_URL}/images/logos/logo.png`}
                                alt="Logo Cliente"
                                className="logo-cliente"
                            />
                        </div>

                        <div className="form-switcher">
                            <div
                                className={`form-slider ${
                                    activeForm === "recover"
                                        ? "show-recover"
                                        : activeForm === "login"
                                        ? "show-login"
                                        : "show-register"
                                }`}
                            >
                                <div className={`form-panel recover-account-form`}>
                                    {activeForm === "recover" && (
                                        <VentanaRecuperar onClose={() => setActiveForm("login")} />
                                    )}
                                </div>

                                <div className={`form-panel login-form`}>
                                    {activeForm === "login" && (
                                        <>
                                            <h2>Bienvenido de nuevo</h2>
                                            <p className="description">
                                                Inicia sesión y sigue creciendo con nosotros.
                                            </p>
                                            <LoginForm
                                                register={register}
                                                handleSubmit={handleSubmit}
                                                errors={errors}
                                                onLoginUser={onLoginUser}
                                                loading={loadingLogin}
                                                setActiveForm={setActiveForm}
                                            />
                                        </>
                                    )}
                                </div>

                                <div className={`form-panel register-form`}>
                                    {activeForm === "register" && (
                                        <>
                                            <h2>Crea tu cuenta</h2>
                                            <p className="description">
                                                Regístrate para comenzar a disfrutar de nuestros
                                                servicios.
                                            </p>
                                            <RegisterForm
                                                register={registerSignup}
                                                handleSubmit={handleSubmitSignup}
                                                errors={errorsSignup}
                                                onRegisterUser={onRegisterUser}
                                                watch={watch}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* <p className="signup-text">
                            {activeForm === "login" ? (
                                <Button
                                    label="¿No tienes una cuenta? Regístrate"
                                    onClick={() => setActiveForm("register")}
                                    className="p-button-link"
                                />
                            ) : activeForm === "register" ? (
                                <Button
                                    label="¿Ya tienes una cuenta? Inicia sesión"
                                    onClick={() => setActiveForm("login")}
                                    className="p-button-link"
                                />
                            ) : null}
                        </p> */}

                        <footer>
                            <div>© 2025 TODOS LOS DERECHOS RESERVADOS</div>
                            <img
                                src={`${process.env.PUBLIC_URL}/images/logos/logoPavasStay.png`}
                                alt="Desarrollado por"
                                className="logo-desarrollador-footer"
                            />
                        </footer>
                    </div>

                    <div className="login-image-section">
                        <div
                            className="image-inner"
                            style={{
                                width: "100%",
                                height: "100%",
                                backgroundImage: `url(${process.env.PUBLIC_URL}/images/bgLoginPage.jpg)`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                borderRadius: "16px",
                            }}
                        ></div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;
