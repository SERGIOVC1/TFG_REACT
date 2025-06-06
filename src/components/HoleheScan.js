// Importaciones necesarias de React
import React, { useState } from "react";

// Importación del contexto de autenticación para obtener el userId
import { useAuth } from "./AuthContext";

// Importación de estilos CSS específicos del componente
import styles from "../css/HoleheScan.module.css";

// Imagen decorativa para el banner
import bannerImg from "../assets/banner.avif";

// Componente principal del escáner de correos usando la herramienta Holehe
function HoleheScan() {
  const { user } = useAuth(); // Obtener el usuario autenticado (o null si no ha iniciado sesión)

  // Estados internos del componente
  const [email, setEmail] = useState("");          // Email ingresado
  const [result, setResult] = useState("");        // Resultado de Holehe (formato texto plano)
  const [loading, setLoading] = useState(false);   // Estado de carga (spinner/botón)
  const [error, setError] = useState("");          // Mensaje de error

  // Función principal que realiza la búsqueda
  const handleSearch = async () => {
    if (!email.trim()) {
      setError("Introduce un correo válido.");
      return;
    }

    // Resetear estados
    setLoading(true);
    setError("");
    setResult("");

    try {
      // Llamada al backend para ejecutar Holehe con el email
      const res = await fetch(`http://localhost:8080/api/holehe?email=${encodeURIComponent(email.trim())}`);
      const text = await res.text();

      if (res.ok) {
        setResult(text); // Guardar texto completo en estado

        // Filtrar las líneas que indican hallazgos positivos [+]
        const foundSites = text
          .split("\n")
          .filter((line) => line.startsWith("[+]"))
          .map((line) => {
            const parts = line.trim().split(" ");
            return parts[parts.length - 1]; // Tomar dominio final (ej. github.com)
          });

        const cleanedResult = foundSites.join(", "); // Formato limpio para guardar en log

        // Obtener IP pública
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        const { ip: publicIp } = await ipResponse.json();

        // Obtener ubicación aproximada mediante la IP pública
        let location = "Desconocido";
        try {
          const geo = await fetch(`https://ipapi.co/json/`);
          const { city, country_name } = await geo.json();
          location = `${city}, ${country_name}`;
        } catch {
          console.warn("No se pudo obtener la localización.");
        }

        // Enviar log al backend con todos los datos del escaneo
        await fetch("http://localhost:8080/api/holehe/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?.uid || "desconocido",     // UID del usuario si está autenticado
            ipAddress: publicIp,                   // IP pública
            internalIpAddress: "localhost",        // IP interna (por defecto)
            action: "Email Scan",                  // Tipo de acción
            details: email.trim(),                 // Email escaneado
            result: cleanedResult,                 // Resultado filtrado
            toolUsed: "holehe",                    // Herramienta utilizada
            timestamp: Date.now(),                 // Marca de tiempo
            userAgent: navigator.userAgent,        // Navegador usado
            isBot: false,                          // Asume que no es bot
            location: location                     // Localización geográfica aproximada
          }),
        });
      } else {
        setError("Error desde el servidor.");
      }
    } catch (err) {
      console.error("❌ Error al conectar con el backend:", err);
      setError("No se pudo conectar con el backend.");
    } finally {
      setLoading(false); // Terminar estado de carga
    }
  };

  // Función que da formato visual a cada línea del resultado
  const renderFormattedResult = () => {
    const lines = result.split("\n"); // Separar por líneas

    return lines.map((line, index) => {
      let color = "#ccc"; // Color por defecto

      // Colores según tipo de resultado
      if (line.startsWith("[+]")) color = "limegreen";    // Hallazgo positivo
      else if (line.startsWith("[-]")) color = "#ff5252"; // No encontrado
      else if (line.startsWith("[x]")) color = "orange";  // Error de consulta
      else if (line.includes("Twitter") || line.includes("Github") || line.includes("Donations"))
        color = "gray"; // Información general o redes sociales

      // Retorna la línea con estilo aplicado
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

  // Render del componente
  return (
    <>
      {/* Banner superior */}
      <div className={styles.toolBanner}>
        <img src={bannerImg} alt="Banner Holehe" />
      </div>

      {/* Contenido principal */}
      <div className={styles.wrapper}>
        <h2 className={styles.title}>🕵️‍♂️ Escaneo de Email con Holehe</h2>

        {/* Campo de entrada de email */}
        <input
          type="email"
          placeholder="Introduce un correo (ej. ejemplo@gmail.com)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
        />

        {/* Botón para iniciar búsqueda */}
        <button onClick={handleSearch} className={styles.button} disabled={loading}>
          {loading ? "Buscando..." : "Buscar"}
        </button>

        {/* Mostrar mensaje de error si hay */}
        {error && <p className={styles.error}>{error}</p>}

        {/* Mostrar resultados si existen */}
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

export default HoleheScan; // Exporta el componente para su uso
