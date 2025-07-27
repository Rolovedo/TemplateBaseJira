import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../../context/auth/AuthContext";
import classNames from "classnames";
import PrimeReact from "primereact/api";
import { Tooltip } from "primereact/tooltip";
import { Redirect, useLocation } from "react-router-dom";
import { AppTopbar } from "./AppTopbar";
import { AppFooter } from "./AppFooter";
import { AppMenu } from "./AppMenu";
import { AppConfig } from "./AppConfig";
import Cookies from "js-cookie";
import { getMenuAPI } from "@api/requests";
import useHandleApiError from "@hook/useHandleApiError";
import "primereact/resources/primereact.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "prismjs/themes/prism-coy.css";
import "../../assets/demo/flags/flags.css";
import "../../assets/demo/Demos.scss";
import "../../assets/layout/layout.scss";
import "../../App.scss";

const Layout = ({ children }) => {
    const { autentificado } = useContext(AuthContext);
    const handleApiError = useHandleApiError();
    const [menureal, setMenu] = useState([]);
    const [layoutMode, setLayoutMode] = useState("static");
    const [layoutColorMode, setLayoutColorMode] = useState("light");
    const [inputStyle, setInputStyle] = useState("outlined");
    const [ripple, setRipple] = useState(true);
    const [staticMenuInactive, setStaticMenuInactive] = useState(false);
    const [overlayMenuActive, setOverlayMenuActive] = useState(false);
    const [mobileMenuActive, setMobileMenuActive] = useState(false);
    const [mobileTopbarMenuActive, setMobileTopbarMenuActive] = useState(false);
    const copyTooltipRef = useRef();
    const location = useLocation();

    PrimeReact.ripple = true;

    let menuClick = false;
    let mobileTopbarMenuClick = false;

    useEffect(() => {
        const abortController = new AbortController();

        if (mobileMenuActive) {
            addClass(document.body, "body-overflow-hidden");
        } else {
            removeClass(document.body, "body-overflow-hidden");
        }

        async function fetchData() {
            try {
                const params = {
                    per: Cookies.get("perfilPONTO"),
                    idu: Cookies.get("idPONTO"),
                };

                const { data } = await getMenuAPI(params);

                const menur = [];

                data.padres.forEach((item) => {
                    const it = {
                        label: item.label,
                        icon: item.icon,
                        toa: item.toa,
                        items: data.hijos.filter(({ padre }) => padre === item.id),
                    };
                    menur.push(it);
                });

                setMenu(menur);
                
                // Activar automáticamente el botón del tablero después de cargar el menú
                setTimeout(() => {
                    activateTableroButton();
                }, 500); // Esperar 500ms para que el DOM se actualice
                
            } catch (error) {
                handleApiError(error);
            }
        }

        fetchData();
        return () => abortController.abort();
        // eslint-disable-next-line
    }, [handleApiError]);

    useEffect(() => {
        copyTooltipRef && copyTooltipRef.current && copyTooltipRef.current.updateTargetEvents();
    }, [location]);

    // Función para activar automáticamente el botón del tablero
    const activateTableroButton = () => {
        try {
            // Encontrar el elemento del tablero
            const menuContainer = document.querySelector('.layout-menu-container');
            if (!menuContainer) return;
            
            const tableroCategory = Array.from(menuContainer.querySelectorAll('.layout-menuitem-category'))
                .find(category => category.textContent.toLowerCase().includes('tablero'));
            
            if (!tableroCategory) return;
            
            // Hacer clickeable el título
            const tableroTitle = tableroCategory.querySelector('.layout-menuitem-root-text');
            if (tableroTitle && !tableroTitle.hasAttribute('data-tablero-activated')) {
                // Marcar como activado para evitar duplicados
                tableroTitle.setAttribute('data-tablero-activated', 'true');
                
                // Estilos visuales
                tableroTitle.style.cursor = "pointer";
                tableroTitle.style.padding = "10px";
                tableroTitle.style.borderRadius = "5px";
                tableroTitle.style.transition = "all 0.3s ease";
                
                // Evento de click
                tableroTitle.onclick = function(e) {
                    e.preventDefault();
                    window.location.hash = '#/tablero/board';
                };
                
                // Efectos hover
                tableroTitle.onmouseenter = function() {
                    this.style.backgroundColor = "#007bff";
                    this.style.color = "white";
                    this.style.transform = "translateX(5px)";
                };
                
                tableroTitle.onmouseleave = function() {
                    this.style.backgroundColor = "";
                    this.style.color = "";
                    this.style.transform = "translateX(0)";
                };
            }
            
            // Agregar enlace en el submenu si está vacío
            const submenu = tableroCategory.querySelector('.layout-submenu-fixed');
            if (submenu && submenu.children.length === 0 && !submenu.hasAttribute('data-tablero-link-added')) {
                submenu.setAttribute('data-tablero-link-added', 'true');
                
                const listItem = document.createElement('li');
                const link = document.createElement('a');
                
                link.href = '#/tablero/board';
                link.innerHTML = `
                    <div style="padding: 10px; display: flex; align-items: center; gap: 10px; color: #007bff;">
                        <i class="pi pi-th-large"></i>
                        <span>Tablero Kanban</span>
                    </div>
                `;
                
                link.style.textDecoration = "none";
                link.style.borderRadius = "5px";
                link.style.margin = "5px";
                link.style.display = "block";
                link.style.transition = "all 0.3s ease";
                
                // Efectos hover para el enlace
                link.onmouseenter = function() {
                    this.style.backgroundColor = "#f0f8ff";
                    this.style.transform = "translateX(5px)";
                };
                
                link.onmouseleave = function() {
                    this.style.backgroundColor = "";
                    this.style.transform = "translateX(0)";
                };
                
                link.onclick = function(e) {
                    e.preventDefault();
                    window.location.hash = '#/tablero/board';
                };
                
                listItem.appendChild(link);
                submenu.appendChild(listItem);
            }
        } catch (error) {
            console.log('Error activando botón del tablero:', error);
        }
    };

    const onInputStyleChange = (inputStyle) => {
        setInputStyle(inputStyle);
    };

    const onRipple = (e) => {
        PrimeReact.ripple = e.value;
        setRipple(e.value);
    };

    const onLayoutModeChange = (mode) => {
        setLayoutMode(mode);
    };

    const onColorModeChange = (mode) => {
        setLayoutColorMode(mode);
    };

    const onWrapperClick = (event) => {
        if (!menuClick) {
            setOverlayMenuActive(false);
            setMobileMenuActive(false);
        }

        if (!mobileTopbarMenuClick) {
            setMobileTopbarMenuActive(false);
        }

        mobileTopbarMenuClick = false;
        menuClick = false;
    };

    const onToggleMenuClick = (event) => {
        menuClick = true;

        if (isDesktop()) {
            if (layoutMode === "static") {
                // Cambia este estado: solo marca como colapsado visual, no oculto
                setStaticMenuInactive((prev) => !prev);
            } else if (layoutMode === "overlay") {
                setOverlayMenuActive((prevState) => !prevState);
            }
        } else {
            // Aquí sí se oculta completamente en móvil
            setMobileMenuActive((prevState) => !prevState);
        }

        event.preventDefault();
    };

    const onSidebarClick = () => {
        menuClick = true;
    };

    const onMobileTopbarMenuClick = (event) => {
        mobileTopbarMenuClick = true;

        setMobileTopbarMenuActive((prevState) => !prevState);
        event.preventDefault();
    };

    const onMobileSubTopbarMenuClick = (event) => {
        mobileTopbarMenuClick = true;
        event.preventDefault();
    };

    const onMenuItemClick = (event) => {
        if (!event.item.items) {
            setOverlayMenuActive(false);
            setMobileMenuActive(false);
        }
    };

    const isDesktop = () => {
        return window.innerWidth >= 992;
    };

    const addClass = (element, className) => {
        if (element.classList) element.classList.add(className);
        else element.className += " " + className;
    };

    const removeClass = (element, className) => {
        if (element.classList) element.classList.remove(className);
        else
            element.className = element.className.replace(
                new RegExp("(^|\\b)" + className.split(" ").join("|") + "(\\b|$)", "gi"),
                " "
            );
    };

    const wrapperClass = classNames("layout-wrapper", {
        "layout-overlay": layoutMode === "overlay",
        "layout-static": layoutMode === "static",
        "layout-static-sidebar-inactive": staticMenuInactive && layoutMode === "static",
        "layout-overlay-sidebar-active": overlayMenuActive && layoutMode === "overlay",
        "layout-mobile-sidebar-active": mobileMenuActive,
        "p-input-filled": inputStyle === "filled",
        "p-ripple-disabled": ripple === false,
        "layout-theme-light": layoutColorMode === "light",
    });

    if (!autentificado && !Cookies.get("autentificadoPONTO")) {
        return <Redirect to="/" />;
    }

    return (
        <div className={wrapperClass} onClick={onWrapperClick}>
            <Tooltip
                ref={copyTooltipRef}
                target=".block-action-copy"
                position="bottom"
                content="Copied to clipboard"
                event="focus"
            />

            <AppTopbar
                onToggleMenuClick={onToggleMenuClick}
                layoutColorMode={layoutColorMode}
                mobileTopbarMenuActive={mobileTopbarMenuActive}
                onMobileTopbarMenuClick={onMobileTopbarMenuClick}
                onMobileSubTopbarMenuClick={onMobileSubTopbarMenuClick}
                menureal={menureal}
                isSidebarVisible={!staticMenuInactive}
            />

            <div
                className={classNames("layout-sidebar", {
                    "sidebar-collapsed":
                        staticMenuInactive && layoutMode === "static" && isDesktop(),
                })}
                onClick={onSidebarClick}
            >
                <AppMenu
                    model={menureal}
                    onMenuItemClick={onMenuItemClick}
                    layoutColorMode={layoutColorMode}
                    collapsed={staticMenuInactive && isDesktop()}
                />
            </div>
            {mobileMenuActive && (
                <div className="layout-mask" onClick={() => setMobileMenuActive(false)}></div>
            )}

            <div className="layout-main-container">
                <div className="layout-main">{children}</div>
                <AppFooter layoutColorMode={layoutColorMode} />
            </div>

            <AppConfig
                rippleEffect={ripple}
                onRippleEffect={onRipple}
                inputStyle={inputStyle}
                onInputStyleChange={onInputStyleChange}
                layoutMode={layoutMode}
                onLayoutModeChange={onLayoutModeChange}
                layoutColorMode={layoutColorMode}
                onColorModeChange={onColorModeChange}
            />
        </div>
    );
};

export default Layout;
