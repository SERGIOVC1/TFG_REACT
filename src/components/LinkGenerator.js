// Importación de React y hooks
import React, { useState, useEffect } from "react";

// Importación de estilos CSS específicos del componente
import styles from "../css/LinkGenerator.module.css";

// Imagen decorativa del banner superior
import bannerImg from "../assets/banner.avif";

// Componente principal que genera enlaces trampa y muestra accesos
const LinkGenerator = () => {
  // Estados del componente
  const [originalUrl, setOriginalUrl] = useState("");   // URL original introducida por el usuario
  const [shortened, setShortened] = useState(null);     // Enlace acortado/trampa generado
  const [code, setCode] = useState(null);               // Código único del enlace generado
  const [logs, setLogs] = useState([]);                 // Registros de accesos al enlace
  const [loading, setLoading] = useState(false);        // Indicador de carga durante la creación
  const [error, setError] = useState("");               // Mensaje de error

  // Función para generar el enlace a partir de la URL ingresada
  const generateLink = async () => {
    if (!originalUrl.trim()) {
      setError("Introduce una URL válida.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Enviar URL al backend para generar el enlace acortado
      const res = await fetch("http://localhost:8080/api/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: originalUrl }),
      });

      const data = await res.json();

      // Guardar enlace y código en estado
      setShortened(data.shortened);
      setCode(data.code);

      // También guardarlos en localStorage para persistencia al recargar
      localStorage.setItem("iplogger_shortened", data.shortened);
      localStorage.setItem("iplogger_code", data.code);
    } catch (err) {
      setError("❌ Error al generar el enlace.");
      console.error(err);
    } finally {
      setLoading(false); // Finaliza la carga
    }
  };

  // Función para consultar los logs del enlace por su código
  const fetchLogs = async (codeParam) => {
    try {
      const res = await fetch(`http://localhost:8080/api/link/logs/${codeParam}`);
      const data = await res.json();
      setLogs(data); // Guardar los registros recibidos
    } catch (err) {
      console.error("❌ Error al obtener logs:", err);
    }
  };

  // Al montar el componente, intenta recuperar datos guardados localmente
  useEffect(() => {
    const storedShortened = localStorage.getItem("iplogger_shortened");
    const storedCode = localStorage.getItem("iplogger_code");
    if (storedShortened && storedCode) {
      setShortened(storedShortened);
      setCode(storedCode);
    }
  }, []);

  // Si existe código, consulta periódicamente (cada 5 segundos) los logs del enlace
  useEffect(() => {
    if (code) {
      fetchLogs(code); // Llamada inicial
      const interval = setInterval(() => fetchLogs(code), 5000); // Intervalo
      return () => clearInterval(interval); // Limpiar al desmontar
    }
  }, [code]);

  // Render del componente
  return (
    <>
      {/* Banner decorativo */}
      <div className={styles.toolBanner}>
        <img src={bannerImg} alt="Banner Link Logger" />
      </div>

      {/* Contenedor principal */}
      <div className={styles.container}>
        <h2 className={styles.title}>Generador de Link Logger</h2>

        {/* Campo para ingresar la URL original */}
        <input
          type="text"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          placeholder="Introduce una URL (ej. https://youtube.com/...)"
          className={styles.input}
        />

        {/* Botón para generar el enlace */}
        <button onClick={generateLink} className={styles.button} disabled={loading}>
          {loading ? "Creando..." : "Generar Enlace Trampa"}
        </button>

        {/* Mostrar mensaje de error si hay */}
        {error && <p className={styles.error}>{error}</p>}

        {/* Mostrar enlace generado */}
        {shortened && (
          <div className={styles.linkBox}>
            <p>🔗 Enlace generado:</p>
            <a href={shortened} target="_blank" rel="noopener noreferrer">
              {shortened}
            </a>
          </div>
        )}

        {/* Mostrar tabla de accesos si hay logs */}
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

export default LinkGenerator; // Exporta el componente para su uso en la app
