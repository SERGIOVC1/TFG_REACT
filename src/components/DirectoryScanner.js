import React, { useState, useEffect, useRef } from "react";
import styles from "../css/DirectoryScanner.module.css"; // ✅ Usando módulo CSS

const DirectoryScanner = () => {
  const [target, setTarget] = useState("");
  const [logs, setLogs] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const terminalRef = useRef(null);
  const eventSourceRef = useRef(null); // ✅ uso de ref para evitar scope issues

  const handleScan = () => {
    setLogs([]);
    setScanning(true);
    setShowTerminal(true);

    const eventSource = new EventSource(
      `http://localhost:8080/api/webscan/directories?target=${target}`
    );

    eventSource.onmessage = (event) => {
      const logEntry = formatLog(event.data);
      setLogs((prevLogs) => [...prevLogs, logEntry]);
    };

    eventSource.onerror = () => {
      eventSource.close();
      setScanning(false);
    };

    eventSourceRef.current = eventSource;
  };

  const handleStop = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      setScanning(false);
    }
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const formatLog = (line) => {
    const regex =
      /^(\/\S+)\s+\(Status:\s*(\d+)\)\s+\[Size:\s*(\d+)\](?:\s+\[-->\s*(.*?)\])?/;
    const match = line.match(regex);

    if (match) {
      const [_, url, status, size, redirect] = match;
      let statusClass = "white";

      if (status.startsWith("2")) statusClass = "green";
      else if (status.startsWith("3")) statusClass = "blue";
      else if (status.startsWith("4")) statusClass = "yellow";
      else if (status.startsWith("5")) statusClass = "red";

      return `
        <span class="${styles.url}">${url.padEnd(30, " ")}</span> 
        <span class="${styles.status} ${styles[statusClass]}">(Status: ${status})</span>  
        <span class="${styles.size}">[Size: ${size.padEnd(6, " ")}]</span>  
        ${redirect ? `<span class="${styles.redirect}">[→ ${redirect}]</span>` : ""}
      `;
    }

    return `<span class="${styles.terminalLine}">${line}</span>`;
  };

  return (
    <div className={styles.container}>
      <h2>📂 Escaneo de Directorios (Terminal en Vivo)</h2>

      <input
        type="text"
        placeholder="Introduce la URL"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        className={styles.input}
      />

      <div className={styles.buttonGroup}>
        <button onClick={handleScan} disabled={scanning} className={styles.button}>
          {scanning ? "Escaneando..." : "Iniciar Escaneo"}
        </button>
        <button onClick={handleStop} disabled={!scanning} className={styles.button}>
          Detener Escaneo
        </button>
      </div>

      {showTerminal && (
        <div ref={terminalRef} className={styles.terminal}>
          {logs.map((log, index) => (
            <div
              key={index}
              className={styles.terminalLine}
              dangerouslySetInnerHTML={{ __html: log }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DirectoryScanner;
