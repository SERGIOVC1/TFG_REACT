// Importaciones necesarias de React y recursos locales
import React, { useState, useEffect, useRef } from "react";
import styles from "../css/DirectoryScanner.module.css";        // Estilos específicos del componente
import bannerImg from "../assets/banner.avif";                 // Imagen del banner superior

// Componente funcional que representa el escáner de directorios web
const DirectoryScanner = ({ userId }) => {
  // Estados del componente
  const [target, setTarget] = useState("");                   // URL objetivo del escaneo
  const [logs, setLogs] = useState([]);                       // Registros de salida del escaneo
  const [scanning, setScanning] = useState(false);            // Indicador de si está escaneando
  const [showTerminal, setShowTerminal] = useState(false);    // Mostrar u ocultar la "terminal" de resultados

  // Referencias
  const terminalRef = useRef(null);           // Para hacer scroll automático en el área de resultados
  const eventSourceRef = useRef(null);        // Para controlar la conexión con Server-Sent Events (SSE)

  // Función que inicia el escaneo
  const handleScan = async () => {
    if (!target.trim()) return;  // Validar entrada vacía

    setLogs([]);                 // Limpiar logs anteriores
    setScanning(true);          // Estado: escaneando
    setShowTerminal(true);      // Mostrar resultados

    // Obtener IP pública del usuario
    const publicIp = await fetch("https://api.ipify.org?format=json")
      .then(res => res.json())
      .then(data => data.ip)
      .catch(() => "Desconocida");

    // Intentar obtener la ubicación geográfica aproximada
    let location = "Desconocida";
    try {
      const geo = await fetch(`https://ipapi.co/json/`);
      const { city, country_name } = await geo.json();
      location = `${city}, ${country_name}`;
    } catch {
      console.warn("No se pudo obtener la ubicación.");
    }

    // Crear conexión SSE para recibir líneas de salida del backend
    const eventSource = new EventSource(
      `http://localhost:8080/api/webscan/directories?target=${encodeURIComponent(target)}&userId=${encodeURIComponent(userId || "")}`
    );

    // Manejador para cada mensaje recibido desde el servidor
    eventSource.onmessage = async (event) => {
      const line = event.data;
      const logEntry = formatLog(line);                  // Formatear línea como HTML enriquecido
      setLogs(prev => [...prev, logEntry]);              // Añadir a la lista de logs

      // Si la línea contiene un código de estado HTTP válido, enviar log al backend (honeypot/log)
      const statusMatch = line.match(/\(Status:\s*(\d{3})\)/);
      if (statusMatch) {
        const code = parseInt(statusMatch[1]);
        if (code >= 200 && code < 400) {
          await fetch("http://localhost:8080/honeypot/log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ipAddress: publicIp,
              internalIpAddress: "localhost",     // Fijado como localhost por ahora
              action: "Directory Scan",
              details: target,
              result: line,
              toolUsed: "gobuster",
              timestamp: Date.now(),
              userAgent: navigator.userAgent,
              location: location,
            }),
          });
        }
      }
    };

    // Si ocurre un error en la conexión, detener el escaneo
    eventSource.onerror = () => {
      eventSource.close();
      setScanning(false);
    };

    eventSourceRef.current = eventSource;  // Guardar referencia para poder detener luego
  };

  // Función para detener el escaneo manualmente
  const handleStop = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      setScanning(false);
    }
  };

  // Efecto para hacer scroll automático hacia el final cada vez que cambian los logs
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  // Función para formatear la salida del escaneo en HTML enriquecido con estilos
  const formatLog = (line) => {
    const regex = /^(\/\S+)\s+\(Status:\s*(\d+)\)\s+\[Size:\s*(\d+)\](?:\s+\[-->\s*(.*?)\])?/;
    const match = line.match(regex);

    if (match) {
      const [_, url, status, size, redirect] = match;
      let statusClass = "white";  // Clase de color por defecto
      if (status.startsWith("2")) statusClass = "green";
      else if (status.startsWith("3")) statusClass = "blue";

      // Retorna línea con formato HTML + clases CSS específicas
      return `
        <span class="${styles.url}">${url}</span> 
        <span class="${styles.status} ${styles[statusClass]}">(Status: ${status})</span>  
        <span class="${styles.size}">[Size: ${size}]</span>  
        ${redirect ? `<span class="${styles.redirect}">[→ ${redirect}]</span>` : ""}
      `;
    }

    // Si no coincide el formato esperado, se muestra la línea sin formato especial
    return `<span class="${styles.resultLine}">${line}</span>`;
  };

  // JSX del componente
  return (
    <>
      <div className={styles.toolBanner}>
        <img src={bannerImg} alt="Banner Directory Scan" />  {/* Imagen superior decorativa */}
      </div>

      <div className={styles.wrapper}>
        <h2 className={styles.title}> Escaneo de Directorios</h2>

        {/* Campo de entrada para la URL */}
        <input
          type="text"
          placeholder="Introduce la URL"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className={styles.input}
        />

        {/* Botón que cambia su función dependiendo del estado del escaneo */}
        <button
          onClick={scanning ? handleStop : handleScan}
          className={styles.button}
        >
          {scanning ? "Detener Escaneo" : "Iniciar Escaneo"}
        </button>

        {/* Mostrar resultados si se activó el terminal */}
        {showTerminal && (
          <div className={styles.resultContainer}>
            <h4 className={styles.resultTitle}> Resultado:</h4>
            <div ref={terminalRef} className={styles.resultBox}>
              {logs.map((log, i) => (
                <div key={i} dangerouslySetInnerHTML={{ __html: log }} />  // Inyecta HTML ya formateado
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DirectoryScanner;  // Exporta el componente
