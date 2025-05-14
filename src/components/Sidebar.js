// src/components/Sidebar.js
import React from "react";
import { Link } from "react-router-dom";
import styles from "../css/Sidebar.module.css";

const Sidebar = ({ visible, onLogout, onLinkClick }) => {
  return (
    <div
      className={styles.sidebar}
      style={{
        transform: visible ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.3s ease-in-out",
        position: "fixed",
        height: "100%",
        zIndex: 200,
      }}
    >
      <h1 className={styles.logo}>🔒 SecureOps</h1>
      <nav>
        <ul>
          <li><Link to="/ip" onClick={onLinkClick} className={styles.toolItem}> IP Resolver</Link></li>
          <li><Link to="/whois" onClick={onLinkClick} className={styles.toolItem}> WHOIS</Link></li>
          <li><Link to="/geo" onClick={onLinkClick} className={styles.toolItem}> Geolocalización</Link></li>
          <li><Link to="/holehe" onClick={onLinkClick} className={styles.toolItem}> Email Scan</Link></li>
          <li><Link to="/network" onClick={onLinkClick} className={styles.toolItem}> Escaneo de Red</Link></li>
          <li><Link to="/dir" onClick={onLinkClick} className={styles.toolItem}> Directorios</Link></li>
          <li><Link to="/headers" onClick={onLinkClick} className={styles.toolItem}> Headers HTTP</Link></li>
          <li><Link to="/tech" onClick={onLinkClick} className={styles.toolItem}> Tech Scanner</Link></li>
          <li><Link to="/traceroute" onClick={onLinkClick} className={styles.toolItem}> Traceroute</Link></li>
          <li><Link to="/logger" onClick={onLinkClick} className={styles.toolItem}> Link Logger</Link></li>
        </ul>
      </nav>
      <button className="logout" onClick={onLogout}>Cerrar sesión</button>
    </div>
  );
};

export default Sidebar;
