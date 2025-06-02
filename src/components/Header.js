import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../css/Header.module.css";
import menuIcon from "../assets/rallas.png";

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setDropdownOpen((open) => !open);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <img
          src={menuIcon}
          alt="Menú"
          className={styles.menuIcon}
          onClick={onMenuClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onMenuClick();
          }}
        />
        <span
          className={styles.brand}
          onClick={() => navigate("/")}
          role="link"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") navigate("/");
          }}
        >
          SecureOps
        </span>
      </div>

      <div className={styles.accountSection} ref={dropdownRef}>
        <button
          className={styles.accountButton}
          onClick={toggleDropdown}
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
          aria-controls="account-menu"
          aria-label="Cuenta - menú desplegable"
        >
          Cuenta
          <span
            className={`${styles.dropdownArrow} ${
              dropdownOpen ? styles.open : ""
            }`}
            aria-hidden="true"
          />
        </button>

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
                navigate("/movimientos");
                setDropdownOpen(false);
              }}
            >
              Movimientos
            </button>
            {/* Más opciones aquí */}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
