// src/components/TechnologyScanner.js
import React, { useState } from "react";
import styles from "../css/TechnologyScanner.module.css";

const TechnologyScanner = () => {
  const [domain, setDomain] = useState("");
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleScan = async () => {
    setLoading(true);
    setError("");
    setResults({});

    try {
      const response = await fetch(`http://localhost:8080/api/tech-scan?domain=${encodeURIComponent(domain)}`);
      const data = await response.json();

      if (data.Error) {
        setError(data.Error);
      } else {
        setResults(data);
      }
    } catch (err) {
      setError("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🧠 Escáner de Tecnologías Web</h2>

      <div className={styles.form}>
        <input
          type="text"
          placeholder="Introduce un dominio (ej. example.com)"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className={styles.input}
        />
        <button onClick={handleScan} disabled={loading} className={styles.button}>
          {loading ? "Escaneando..." : "Analizar"}
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {Object.keys(results).length > 0 && (
        <div className={styles.resultsBox}>
          <h3>🔍 Tecnologías detectadas:</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Tecnología</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(results).map(([key, value], idx) => (
                <tr key={idx}>
                  <td>{key}</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TechnologyScanner;
