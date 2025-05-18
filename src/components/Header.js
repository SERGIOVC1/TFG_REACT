import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../css/Header.module.css";
import menuIcon from "../assets/rallas.png";

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();

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
    </header>
  );
};

export default Header;
