import React, { useState } from "react";
import styles from "../css/HoleheScan.module.css";
import bannerImg from "../assets/banner.avif";

function HoleheScan() {
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
      const res = await fetch(`http://localhost:8080/api/holehe?email=${encodeURIComponent(email.trim())}`);
      const text = await res.text();

      if (res.ok) {
        setResult(text);

        // 🔍 Extraer dominios donde aparece registrado
        const foundSites = text
          .split("\n")
          .filter((line) => line.startsWith("[+]"))
          .map((line) => {
            const parts = line.trim().split(" ");
            return parts[parts.length - 1];
          });

        const cleanedResult = foundSites.join(", ");

        // 🌐 Obtener IP pública
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        const { ip: publicIp } = await ipResponse.json();

        // 🌍 Obtener ubicación por IP
        let location = "Desconocido";
        try {
          const geo = await fetch(`https://ipapi.co/json/`);
          const { city, country_name } = await geo.json();
          location = `${city}, ${country_name}`;
        } catch {
          console.warn("No se pudo obtener la localización.");
        }

        // 📥 Enviar log al backend
        await fetch("http://localhost:8080/honeypot/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ipAddress: publicIp,
            internalIpAddress: "localhost", // si no capturas IP privada
            action: "Email Scan",
            details: email.trim(),
            result: cleanedResult,
            toolUsed: "holehe",
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            location: location,
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
      else if (line.includes("Twitter") || line.includes("Github") || line.includes("Donations")) color = "gray";

      return (
        <div
          key={index}
          style={{ color, fontFamily: "monospace", whiteSpace: "pre-wrap", fontSize: "0.9rem" }}
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
