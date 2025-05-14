// src/components/WhoisLookup.js
import React, { useState } from "react";
import styles from "../css/WhoisLookup.module.css";
import bannerImg from "../assets/banner.avif"; // Usa el mismo banner que en GetIpForm

function WhoisLookup() {
  const [domain, setDomain] = useState("");
  const [rawResult, setRawResult] = useState("");
  const [filteredResult, setFilteredResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLookup = async () => {
    setLoading(true);
    setError("");
    setRawResult("");
    setFilteredResult(null);

    if (!domain.trim()) {
      setError("Por favor, introduce un dominio válido.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/whois?domain=${encodeURIComponent(domain.trim())}`);
      const data = await response.text();

      if (response.ok) {
        setRawResult(data);
        const parsed = extractImportantInfo(data);
        setFilteredResult(parsed);
      } else {
        setError("Error al consultar WHOIS.");
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
      console.error("❌ Error en WHOIS:", err);
    } finally {
      setLoading(false);
    }
  };

  const extractImportantInfo = (raw) => {
    const lines = raw.split("\n");
    const info = {};

    lines.forEach(line => {
      if (line.includes("Domain Name:")) info.domain = line.split(":")[1]?.trim();
      if (line.includes("Registrar:") && !line.includes("WHOIS Server") && !info.registrar)
        info.registrar = line.split(":")[1]?.trim();
      if (line.includes("Registrar URL:")) info.registrarURL = line.split(":")[1]?.trim();
      if (line.includes("Registrar Abuse Contact Email:")) info.abuseEmail = line.split(":")[1]?.trim();
      if (line.includes("Registrar Abuse Contact Phone:")) info.abusePhone = line.split(":")[1]?.trim();
      if (line.includes("Creation Date:")) info.creationDate = line.split(":")[1]?.trim();
      if (line.includes("Updated Date:")) info.updatedDate = line.split(":")[1]?.trim();
      if (line.includes("Registry Expiry Date:")) info.expiryDate = line.split(":")[1]?.trim();
      if (line.includes("Name Server:")) {
        if (!info.nameServers) info.nameServers = [];
        info.nameServers.push(line.split(":")[1]?.trim());
      }
      if (line.includes("Domain Status:")) info.status = line.split(":")[1]?.trim();
      if (line.includes("DNSSEC:")) info.dnssec = line.split(":")[1]?.trim();
    });

    return info;
  };

  return (
    <>
      <div className={styles.toolBanner}>
        <img src={bannerImg} alt="Banner WHOIS" />
      </div>

      <div className={styles.wrapper}>
        <h2 className={styles.title}>📄 WHOIS Lookup</h2>

        <div className={styles.form}>
          <input
            type="text"
            placeholder="Introduce el dominio (ej. ejemplo.com)"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className={styles.input}
          />

          <button onClick={handleLookup} disabled={loading} className={styles.button}>
            {loading ? "Consultando..." : "Consultar"}
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {filteredResult && (
          <div className={styles.tableWrapper}>
            <h3>📋 Información esencial del dominio</h3>
            <table className={styles.table}>
              <tbody>
                {Object.entries(filteredResult).map(([key, value]) => (
                  <tr key={key}>
                    <td className={styles.tdKey}>{key}</td>
                    <td className={styles.tdValue}>
                      {Array.isArray(value) ? value.join(", ") : value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {rawResult && (
          <div className={styles.rawOutput}>
            <h4>🗒️ Resultado completo (raw WHOIS)</h4>
            <pre>{rawResult}</pre>
          </div>
        )}
      </div>
    </>
  );
}

export default WhoisLookup;
