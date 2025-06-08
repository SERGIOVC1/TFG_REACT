// Importa React y el hook useState para manejar estado local
import React, { useState } from "react";

// Importa estilos CSS en módulo para el componente
import styles from "../css/GetIpForm.module.css";

// Importa una imagen de banner para el encabezado visual
import bannerImg from "../assets/banner.avif";

// Importa el contexto de autenticación para saber qué usuario está conectado
import { useAuth } from "../components/AuthContext";

// URL del backend desplegado en Azure (reemplaza a localhost)
const API_URL = "https://tfg-backend-c4d6daajhgfhheb.italynorth-01.azurewebsites.net";

// Componente principal que permite resolver la IP de un dominio
const GetIpForm = ({ setResolvedIp }) => {
  const { user } = useAuth(); // Accede al usuario autenticado (si lo hay)

  // Estados para manejar el dominio ingresado, errores y el ID del usuario
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");
  const [userIdDisplayed, setUserIdDisplayed] = useState("");

  // Función auxiliar para extraer el dominio de una URL completa
  const extractDomain = (url) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url; // Si no es URL válida, devuelve el valor original
    }
  };

  // Función principal que se ejecuta al enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita recargar la página
    setError(""); // Limpia errores anteriores

    // Validación básica del campo
    if (!domain.trim()) {
      setError("Por favor ingresa un dominio válido");
      return;
    }

    // Limpia y extrae solo el dominio, sin protocolo ni ruta
    const cleanDomain = extractDomain(domain);
    const userId = user?.uid || "desconocido";
    setUserIdDisplayed(userId); // Guarda el UID del usuario (si lo hay)

    try {
      // Petición al backend para obtener la IP del dominio
      const response = await fetch(`${API_URL}/api/ipresolver/resolve-ip?domain=${cleanDomain}`);
      const data = await response.json();

      // Si se obtiene una IP válida
      if (data.ip) {
        setResolvedIp(data.ip);
        setError("");

        // Obtiene la IP pública del cliente (navegador)
        const ipRes = await fetch("https://api.ipify.org?format=json");
        const { ip: publicIp } = await ipRes.json();

        // Intenta determinar la ubicación geográfica aproximada
        let location = "Desconocido";
        try {
          const locRes = await fetch("https://ipapi.co/json/");
          const locData = await locRes.json();
          location = `${locData.city}, ${locData.country_name}`;
        } catch {
          console.warn("No se pudo obtener la localización.");
        }

        // Registra la actividad del usuario en el backend
        await fetch(`${API_URL}/api/ipresolver/log`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ipAddress: publicIp,
            internalIpAddress: "localhost", // Simulado: en frontend no puedes obtenerlo realmente
            result: data.ip,
            toolUsed: "ipresolver",
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            isBot: false,
            location,
            action: "IP Resolver",
            details: cleanDomain,
            userId,
          }),
        });
      } else {
        // Si no hay IP devuelta, muestra error
        setResolvedIp("");
        setError("No se pudo resolver la IP del dominio");
        setUserIdDisplayed("");
      }
    } catch (err) {
      // Captura errores de red o backend
      console.error("Error al obtener la IP:", err);
      setError("Error al conectar con el servidor");
      setUserIdDisplayed("");
    }
  };

  // Render del componente
  return (
    <>
      {/* Imagen decorativa del banner */}
      <div className={styles.toolBanner}>
        <img src={bannerImg} alt="Banner IP Resolver" />
      </div>

      <div className={styles.wrapper}>
        <h2 className={styles.title}>Resolver IP de un Dominio</h2>

        {/* Formulario de entrada del dominio */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            className={styles.input}
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="Introduce el dominio o URL (ej. example.com)"
          />
          <button className={styles.button} type="submit">
            Obtener IP
          </button>
        </form>

        {/* Mensaje de error, si existe */}
        {error && <p className={styles.error}>{error}</p>}

        {/* Mostrar el ID del usuario logueado, si lo hay */}
        {userIdDisplayed && (
          <p style={{ marginTop: "1rem", color: "#ccc" }}>
            Usuario: <strong>{userIdDisplayed}</strong>
          </p>
        )}
      </div>
    </>
  );
};

// Exporta el componente para que se use en la aplicación
export default GetIpForm;
