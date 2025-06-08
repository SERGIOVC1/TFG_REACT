// Importaciones necesarias de React
import React, { useState } from "react";

// Importación del contexto de autenticación para obtener el userId
import { useAuth } from "./AuthContext";

// Importación de estilos CSS específicos del componente
import styles from "../css/HoleheScan.module.css";

// Imagen decorativa para el banner
import bannerImg from "../assets/banner.avif";

// URL base del backend desplegado
const API_BASE = "https://tfg-backend-wfvn.onrender.com";

// Componente principal del escáner de correos usando la herramienta Holehe
function HoleheScan() {
  const { user } = useAuth(); // Obtener el usuario autenticado (o null si no ha iniciado sesión)

  // Estados internos del componente
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
      const res = await fetch(`${API_BASE}/api/holehe?email=${encodeURIComponent(email.trim())}`);
      const text = await res.text();

      if (res.ok) {
        setResult(text);

        const foundSites = text
          .split("\n")
          .filter((line) => line.startsWith("[+]"))
          .map((line) => {
            const parts = line.trim().split(" ");
            return parts[parts.length - 1];
          });

        const cleanedResult = foundSites.join(", ");

        const ipResponse = await fetch("https://api.ipify.org?format=json");
        const { ip: publicIp } = await ipResponse.json();

        let location = "Desconocido";
        try {
          const geo = await fetch("https://ipapi.co/json/");
          const { city, country_name } = await geo.json();
          location = `${city}, ${country_name}`;
        } catch {
          console.warn("No se pudo obtener la localización.");
        }

        await fetch(`${API_BASE}/api/holehe/log`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?.uid || "desconocido",
            ipAddress: publicIp,
            internalIpAddress: "localhost",
            action: "Email Scan",
            details: email.trim(),
            result: cleanedResult,
            toolUsed: "holehe",
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            isBot: false,
            location,
          }),
        });
      } else {
        setError("Error desde el servidor.");
      }
    } catch (err) {
      console.error("❌ Error al conectar con el backend:", err);
      setError("No se pudo conectar con el backend.");
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedResult = () => {
    const lines = result.split("\n");

    return lines.map((line, index) => {
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
