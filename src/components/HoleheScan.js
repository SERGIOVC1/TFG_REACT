import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import styles from "../css/HoleheScan.module.css";
import bannerImg from "../assets/banner.avif";

// 🔁 Cambia si estás en desarrollo local
const API_BASE =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8080"
    : "https://tfg-backend-wfvn.onrender.com";

function HoleheScan() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!email.trim()) {
      setError("Introduce un correo válido.");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      // Geolocalización e IP pública
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

      // 🔁 Nuevo endpoint POST
      const response = await fetch(`${API_BASE}/api/holehe/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid || "desconocido",
          ipAddress: publicIp,
          internalIpAddress: "localhost",
          action: "Email Scan",
          details: email.trim(),
          result: "", // el backend lo sobrescribe
          toolUsed: "holehe",
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
        setError("Error al realizar el escaneo.");
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
      if (line.startsWith("[+]")) color = "limegreen";
      else if (line.startsWith("[-]")) color = "#ff5252";
      else if (line.startsWith("[x]")) color = "orange";
      else if (
        line.includes("Twitter") ||
        line.includes("Github") ||
        line.includes("Donations")
      )
        color = "gray";

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
        <img src={bannerImg} alt="Banner Holehe" />
      </div>

      <div className={styles.wrapper}>
        <h2 className={styles.title}>🕵️‍♂️ Escaneo de Email con Holehe</h2>

        <input
          type="email"
          placeholder="Introduce un correo (ej. ejemplo@gmail.com)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
        />

        <button onClick={handleSearch} className={styles.button} disabled={loading}>
          {loading ? "Buscando..." : "Buscar"}
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

export default HoleheScan;
