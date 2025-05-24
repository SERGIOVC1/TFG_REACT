// src/components/Header.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../css/Header.module.css";
import menuIcon from "../assets/rallas.png";

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <img
          src={menuIcon}
          alt="Menú"
          className={styles.menuIcon}
          onClick={onMenuClick}
        />
        <span className={styles.brand} onClick={() => navigate("/")}>
          SecureOps
        </span>
      </div>

      <div className={styles.accountSection}>
        <button
          className={styles.accountButton}
          onClick={toggleDropdown}
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
        >
          Cuenta ▼
        </button>

        {dropdownOpen && (
          <div className={styles.dropdownMenu}>
            <button
              className={styles.dropdownItem}
              onClick={() => {
                navigate("/movimientos");
                setDropdownOpen(false);
              }}
            >
              Movimientos
            </button>
            {/* Puedes añadir más opciones aquí */}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
