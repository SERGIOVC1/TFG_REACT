// Importación de hooks y herramientas de React
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Estilos y recursos visuales
import styles from "../css/Header.module.css";   // CSS modular
import menuIcon from "../assets/rallas.png";     // Icono del botón de menú (≡)

// Componente de cabecera que incluye: logo, botón de menú lateral y menú de usuario
const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();               // Hook para navegación programática entre rutas

  const [dropdownOpen, setDropdownOpen] = useState(false); // Controla si el menú de cuenta está abierto
  const dropdownRef = useRef(null);                         // Referencia al menú desplegable para detectar clics externos

  // Función para alternar visibilidad del menú de usuario
  const toggleDropdown = () => setDropdownOpen((open) => !open);

  // Efecto para cerrar el menú si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Si se hace clic fuera del dropdown, lo cerramos
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    // Solo agrega el listener si el menú está abierto
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Limpieza del listener al desmontar o cambiar estado
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // JSX que representa la cabecera
  return (
    <header className={styles.header}>
      {/* Contenedor del logo y botón del menú */}
      <div className={styles.logoContainer}>
        {/* Botón para abrir el menú lateral (≡) */}
        <img
          src={menuIcon}
          alt="Menú"
          className={styles.menuIcon}
          onClick={onMenuClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onMenuClick(); // Soporte para accesibilidad (teclado)
          }}
        />

        {/* Nombre de la marca, clicable hacia la home */}
        <span
          className={styles.brand}
          onClick={() => navigate("/")}
          role="link"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") navigate("/"); // Accesible también por teclado
          }}
        >
          SecureOps
        </span>
      </div>

      {/* Sección del usuario (cuenta) con menú desplegable */}
      <div className={styles.accountSection} ref={dropdownRef}>
        <button
          className={styles.accountButton}
          onClick={toggleDropdown}
          aria-haspopup="true"                       // Accesibilidad: botón abre menú
          aria-expanded={dropdownOpen}              // Estado del menú
          aria-controls="account-menu"              // ID del menú que controla
          aria-label="Cuenta - menú desplegable"    // Descripción accesible
        >
          Cuenta
          {/* Flecha indicadora de desplegable */}
          <span
            className={`${styles.dropdownArrow} ${
              dropdownOpen ? styles.open : ""
            }`}
            aria-hidden="true"
          />
        </button>

        {/* Menú desplegable de opciones del usuario */}
        {dropdownOpen && (
          <div
            className={styles.dropdownMenu}
            id="account-menu"
            role="menu"
            tabIndex={-1}
          >
            <button
              className={styles.dropdownItem}
              role="menuitem"
              onClick={() => {
                navigate("/movimientos");    // Navegar a la sección de movimientos
                setDropdownOpen(false);      // Cerrar el menú
              }}
            >
              Movimientos
            </button>
            {/* Puedes añadir más opciones aquí (perfil, cerrar sesión, etc.) */}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;  // Exporta el componente para ser usado en App.js u otras páginas
