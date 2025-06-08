import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import styles from "../css/DirectoryScanner.module.css";
import bannerImg from "../assets/banner.avif";

const API_BASE =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8080"
    : "https://tfg-backend-wfvn.onrender.com";

function DirectoryScanner() {
  const { user } = useAuth();

  const [target, setTarget] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleScan = async () => {
    if (!target.trim()) {
      setError("Introduce una URL válida.");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      const ipRes = await fetch("https://api.ipify.org?format=json");
      const { ip: publicIp } = await ipRes.json();

      let location = "Desconocida";
      try {
        const locRes = await fetch("https://ipapi.co/json/");
        const { city, country_name } = await locRes.json();
        location = `${city}, ${country_name}`;
      } catch {
        console.warn("No se pudo obtener la localización.");
      }

      const response = await fetch(`${API_BASE}/api/webscan/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid || "desconocido",
          ipAddress: publicIp,
          internalIpAddress: "localhost",
          action: "Directory Scan",
          details: target.trim(),
          result: "", // será completado por el backend
          toolUsed: "gobuster",
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          isBot: false,
          location,
        }),
      });

      const text = await response.text();
      if (response.ok) {
        setResult(text);
      } else {
        setError("Error durante el escaneo.");
      }
    } catch (err) {
      console.error("❌ Error al conectar con el backend:", err);
      setError("No se pudo conectar con el backend.");
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedResult = () => {
    return result.split("\n").map((line, index) => {
      let color = "#ccc";
      if (/\(Status:\s*2\d{2}\)/.test(line)) color = "limegreen";
      else if (/\(Status:\s*3\d{2}\)/.test(line)) color = "deepskyblue";
      else if (/Error/i.test(line)) color = "#ff5252";

      return (
        <div
          key={index}
          style={{
            color,
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            fontSize: "0.9rem",
          }}
        >
          {line}
        </div>
      );
    });
  };

  return (
    <>
      <div className={styles.toolBanner}>
        <img src={bannerImg} alt="Banner Directory Scan" />
      </div>

      <div className={styles.wrapper}>
        <h2 className={styles.title}>🗂️ Escaneo de Directorios</h2>

        <input
          type="text"
          placeholder="Introduce la URL (ej. https://ejemplo.com)"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className={styles.input}
        />

        <button onClick={handleScan} className={styles.button} disabled={loading}>
          {loading ? "Escaneando..." : "Iniciar Escaneo"}
        </button>

        {error && <p className={styles.error}>{error}</p>}

        {result && (
          <div className={styles.resultContainer}>
            <h4 className={styles.resultTitle}>📄 Resultado:</h4>
            <div className={styles.resultBox}>{renderFormattedResult()}</div>
          </div>
        )}
      </div>
    </>
  );
}

export default DirectoryScanner;
