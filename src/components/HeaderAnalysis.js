// Importaciones de React y hooks
import React, { useState } from "react";

// Estilos específicos del componente
import styles from "../css/HeaderAnalysis.module.css";

// Imagen del banner decorativo superior
import bannerImg from "../assets/banner.avif";

// Hook de contexto para obtener el usuario actual
import { useAuth } from "../components/AuthContext";

// Componente funcional para analizar los headers HTTP de un sitio web
const HeaderAnalysis = () => {
  const { user } = useAuth(); // Obtiene el usuario autenticado (si existe)

  // Estados del componente
  const [url, setUrl] = useState("");            // URL ingresada por el usuario
  const [headers, setHeaders] = useState(null);  // Headers obtenidos del servidor
  const [error, setError] = useState("");        // Mensaje de error
  const [loading, setLoading] = useState(false); // Indicador de carga durante la petición

  // Función para manejar el envío del formulario
  const handleFetchHeaders = async (e) => {
    e.preventDefault();            // Prevenir comportamiento por defecto del form
    setError("");                  // Limpiar errores anteriores
    setHeaders(null);             // Limpiar headers anteriores
    setLoading(true);             // Activar estado de carga

    try {
      // Obtener el UID del usuario o marcar como "desconocido"
      const userId = user?.uid || "desconocido";

      // Construir parámetros de la consulta
      const queryParams = new URLSearchParams({ url, userId });

      // Realizar petición GET al backend de Render
      const response = await fetch(
        `https://tfg-backend-wfvn.onrender.com/api/security/headers?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            "User-Agent": navigator.userAgent,
          },
        }
      );

      if (!response.ok) throw new Error("No se pudieron obtener los headers.");

      const data = await response.json();
      setHeaders(data);
    } catch (err) {
      console.error("❌ Error:", err);
      setError("Error al obtener los headers. Asegúrate de que la URL es válida.");
    } finally {
      setLoading(false);
    }
  };

  // Render del componente
  return (
    <>
      {/* Banner decorativo */}
      <div className={styles.toolBanner}>
        <img src={bannerImg} alt="Banner Header Analysis" />
      </div>

      <div className={styles.container} id="headers">
        <h2 className={styles.title}> Análisis de Headers HTTP</h2>

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
            <div className={styles.resultBox}>
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
          </div>
        )}
      </div>
    </>
  );
};

export default HeaderAnalysis;
