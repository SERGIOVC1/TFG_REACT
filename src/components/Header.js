// src/components/Header.js
import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../css/Header.module.css";
import menuIcon from "../assets/rallas.png";

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <div className={styles.logo} onClick={() => navigate("/")}>
        <img
          src={menuIcon}
          alt="Menú"
          className={styles.menuIcon}
          onClick={(e) => {
            e.stopPropagation(); // para evitar conflicto con el navigate
            onMenuClick();
          }}
        />
        <span className={styles.brand}>SecureOps</span>
      </div>
    </header>
  );
};

export default Header;
