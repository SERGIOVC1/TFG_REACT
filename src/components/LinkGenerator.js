// Importación de React y hooks
import React, { useState, useEffect } from "react";

// Importación de estilos CSS específicos del componente
import styles from "../css/LinkGenerator.module.css";

// Imagen decorativa del banner superior
import bannerImg from "../assets/banner.avif";

// URL del backend desplegado en Render
const API_BASE = "https://tfg-backend-wfvn.onrender.com";

// Componente principal que genera enlaces trampa y muestra accesos
const LinkGenerator = () => {
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortened, setShortened] = useState(null);
  const [code, setCode] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateLink = async () => {
    if (!originalUrl.trim()) {
      setError("Introduce una URL válida.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: originalUrl }),
      });

      const data = await res.json();
      setShortened(data.shortened);
      setCode(data.code);

      localStorage.setItem("iplogger_shortened", data.shortened);
      localStorage.setItem("iplogger_code", data.code);
    } catch (err) {
      setError("❌ Error al generar el enlace.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (codeParam) => {
    try {
      const res = await fetch(`${API_BASE}/api/link/logs/${codeParam}`);
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("❌ Error al obtener logs:", err);
    }
  };

  useEffect(() => {
    const storedShortened = localStorage.getItem("iplogger_shortened");
    const storedCode = localStorage.getItem("iplogger_code");
    if (storedShortened && storedCode) {
      setShortened(storedShortened);
      setCode(storedCode);
    }
  }, []);

  useEffect(() => {
    if (code) {
      fetchLogs(code);
      const interval = setInterval(() => fetchLogs(code), 5000);
      return () => clearInterval(interval);
    }
  }, [code]);

  return (
    <>
      <div className={styles.toolBanner}>
        <img src={bannerImg} alt="Banner Link Logger" />
      </div>

      <div className={styles.container}>
        <h2 className={styles.title}>Generador de Link Logger</h2>

        <input
          type="text"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          placeholder="Introduce una URL (ej. https://youtube.com/...)"
          className={styles.input}
        />

        <button onClick={generateLink} className={styles.button} disabled={loading}>
          {loading ? "Creando..." : "Generar Enlace Trampa"}
        </button>

        {error && <p className={styles.error}>{error}</p>}

        {shortened && (
          <div className={styles.linkBox}>
            <p>🔗 Enlace generado:</p>
            <a href={shortened} target="_blank" rel="noopener noreferrer">
              {shortened}
            </a>
          </div>
        )}

        {logs.length > 0 && (
          <div className={styles.tableWrapper}>
            <h3 className={styles.subtitle}>📊 Últimos accesos:</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>IP Cliente</th>
                  <th>User Agent</th>
                  <th>IP Pública Servidor</th>
                  <th>IP Local Servidor</th>
                  <th>Hora</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{log.clientIp}</td>
                    <td>{log.userAgent}</td>
                    <td>{log.serverPublicIp}</td>
                    <td>{log.serverLocalIp}</td>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default LinkGenerator;
