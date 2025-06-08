import React, { useState, useEffect } from "react";

// URL del backend en producción (Render)
const API_BASE = "https://tfg-backend-wfvn.onrender.com";

const UserMenu = ({ userId }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  useEffect(() => {
    if (userId && showDropdown) {
      setLoading(true);
      fetch(`${API_BASE}/api/audit/user/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          setAuditLogs(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [userId, showDropdown]);

  return (
    <div style={{ position: "relative", cursor: "pointer" }}>
      <div onClick={toggleDropdown}>
        Cuenta ▼
      </div>

      {showDropdown && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            backgroundColor: "white",
            color: "black",
            width: "300px",
            maxHeight: "400px",
            overflowY: "auto",
            boxShadow: "0 0 10px rgba(0,0,0,0.3)",
            zIndex: 1000,
          }}
        >
          <h4 style={{ padding: "10px" }}>Movimientos</h4>
          {loading && <p style={{ padding: "10px" }}>Cargando...</p>}
          {!loading && auditLogs.length === 0 && (
            <p style={{ padding: "10px" }}>No hay movimientos.</p>
          )}

          <ul style={{ listStyle: "none", padding: "0 10px", margin: 0 }}>
            {auditLogs.map((log, idx) => (
              <li
                key={idx}
                style={{
                  marginBottom: "10px",
                  borderBottom: "1px solid #ccc",
                  paddingBottom: "5px",
                }}
              >
                <strong>Acción:</strong> {log.action} <br />
                <strong>Tabla:</strong> {log.tableName} <br />
                <strong>Detalles:</strong> {log.details} <br />
                <small>{new Date(log.timestamp).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
