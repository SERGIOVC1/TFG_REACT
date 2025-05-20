import React, { useState } from "react";
import styles from "../css/HeaderAnalysis.module.css";
import bannerImg from "../assets/banner.avif";

const HeaderAnalysis = () => {
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFetchHeaders = async (e) => {
    e.preventDefault();
    setError("");
    setHeaders(null);
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8080/api/security/headers?url=${encodeURIComponent(url)}`,
        {
          method: "GET",
          headers: {
            "User-Agent": navigator.userAgent // ✅ Enviar el user agent real
          }
        }
      );

      if (!response.ok) {
        throw new Error("No se pudieron obtener los headers.");
      }

      const data = await response.json();
      setHeaders(data);
    } catch (err) {
      console.error("❌ Error:", err);
      setError("Error al obtener los headers. Asegúrate de que la URL es válida.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.toolBanner}>
        <img src={bannerImg} alt="Banner Header Analysis" />
      </div>

      <div className={styles.container} id="headers">
        <h2 className={styles.title}>🧠 Análisis de Headers HTTP</h2>

        <form onSubmit={handleFetchHeaders} className={styles.form}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Introduce una URL (https://example.com)"
            className={styles.input}
            required
          />
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Analizando..." : "Analizar Headers"}
          </button>
        </form>

        {error && <p className={styles.error}>{error}</p>}

        {headers && (
          <div className={styles.results}>
            <h3 className={styles.subtitle}>🔍 Headers encontrados:</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Header</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(headers).map(([key, value]) => (
                  <tr key={key}>
                    <td>{key}</td>
                    <td>{value}</td>
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

export default HeaderAnalysis;
