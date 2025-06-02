import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "../css/Sidebar.module.css";

const tools = [
  { path: "/ip", label: "IP Resolver" },
  { path: "/whois", label: "WHOIS" },
  { path: "/geo", label: "Geolocalización" },
  { path: "/holehe", label: "Email Scan" },
  { path: "/network", label: "Escaneo de Red" },
  { path: "/dir", label: "Directorios" },
  { path: "/headers", label: "Headers HTTP" },
  { path: "/tech", label: "Tech Scanner" },
  { path: "/traceroute", label: "Traceroute" },
  { path: "/logger", label: "Link Logger" },
];

const Sidebar = ({ visible, onLogout, onLinkClick }) => {
  const location = useLocation();

  return (
    <aside
      className={styles.sidebar}
      style={{
        transform: visible ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.3s ease-in-out",
        position: "fixed",
        height: "100%",
        zIndex: 200,
      }}
      aria-label="Sidebar de navegación"
    >
      <h1 className={styles.logo}>🔒 SecureOps</h1>

      <nav>
        <p className={styles.sectionTitle}>Herramientas</p>
        <ul>
          {tools.map(({ path, label }) => (
            <li key={path}>
              <Link
                to={path}
                onClick={onLinkClick}
                className={`${styles.toolItem} ${
                  location.pathname === path ? styles.active : ""
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <button className={styles.logoutButton} onClick={onLogout}>
        Cerrar sesión
      </button>
    </aside>
  );
};

export default Sidebar;
