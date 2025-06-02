import React, { useState, useEffect, useRef } from "react";
import styles from "../css/DirectoryScanner.module.css";
import bannerImg from "../assets/banner.avif";

const DirectoryScanner = ({ userId }) => {
  const [target, setTarget] = useState("");
  const [logs, setLogs] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const terminalRef = useRef(null);
  const eventSourceRef = useRef(null);

  const handleScan = async () => {
    if (!target.trim()) return;

    setLogs([]);
    setScanning(true);
    setShowTerminal(true);

    const publicIp = await fetch("https://api.ipify.org?format=json")
      .then(res => res.json())
      .then(data => data.ip)
      .catch(() => "Desconocida");

    let location = "Desconocida";
    try {
      const geo = await fetch(`https://ipapi.co/json/`);
      const { city, country_name } = await geo.json();
      location = `${city}, ${country_name}`;
    } catch {
      console.warn("No se pudo obtener la ubicación.");
    }

    const eventSource = new EventSource(
      `http://localhost:8080/api/webscan/directories?target=${encodeURIComponent(target)}&userId=${encodeURIComponent(userId || "")}`
    );

    eventSource.onmessage = async (event) => {
      const line = event.data;
      const logEntry = formatLog(line);
      setLogs(prev => [...prev, logEntry]);

      const statusMatch = line.match(/\(Status:\s*(\d{3})\)/);
      if (statusMatch) {
        const code = parseInt(statusMatch[1]);
        if (code >= 200 && code < 400) {
          await fetch("http://localhost:8080/honeypot/log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ipAddress: publicIp,
              internalIpAddress: "localhost",
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
    const regex = /^(\/\S+)\s+\(Status:\s*(\d+)\)\s+\[Size:\s*(\d+)\](?:\s+\[-->\s*(.*?)\])?/;
    const match = line.match(regex);

    if (match) {
      const [_, url, status, size, redirect] = match;
      let statusClass = "white";
      if (status.startsWith("2")) statusClass = "green";
      else if (status.startsWith("3")) statusClass = "blue";

      return `
        <span class="${styles.url}">${url}</span> 
        <span class="${styles.status} ${styles[statusClass]}">(Status: ${status})</span>  
        <span class="${styles.size}">[Size: ${size}]</span>  
        ${redirect ? `<span class="${styles.redirect}">[→ ${redirect}]</span>` : ""}
      `;
    }

    return `<span class="${styles.resultLine}">${line}</span>`;
  };

  return (
    <>
      <div className={styles.toolBanner}>
        <img src={bannerImg} alt="Banner Directory Scan" />
      </div>

      <div className={styles.wrapper}>
        <h2 className={styles.title}> Escaneo de Directorios</h2>

        <input
          type="text"
          placeholder="Introduce la URL"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className={styles.input}
        />

        <button
          onClick={scanning ? handleStop : handleScan}
          className={styles.button}
        >
          {scanning ? "Detener Escaneo" : "Iniciar Escaneo"}
        </button>

        {showTerminal && (
          <div className={styles.resultContainer}>
            <h4 className={styles.resultTitle}> Resultado:</h4>
            <div ref={terminalRef} className={styles.resultBox}>
              {logs.map((log, i) => (
                <div key={i} dangerouslySetInnerHTML={{ __html: log }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DirectoryScanner;
