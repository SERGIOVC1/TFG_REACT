// Importación de React y hooks
import React, { useState, useContext } from "react";

// Estilos específicos del componente
import styles from "../css/GetIpForm.module.css";

// Imagen decorativa (banner)
import bannerImg from "../assets/banner.avif";

// Importa el contexto de autenticación para acceder al usuario actual
import { useAuth } from "../components/AuthContext";

// Componente funcional que permite al usuario introducir un dominio y resolver su IP
const GetIpForm = ({ setResolvedIp }) => {
  const { user } = useAuth(); // Obtiene el usuario actual del contexto (puede ser null si no ha iniciado sesión)

  // Estados locales del componente
  const [domain, setDomain] = useState("");                 // Dominio ingresado por el usuario
  const [error, setError] = useState("");                   // Mensaje de error
  const [userIdDisplayed, setUserIdDisplayed] = useState(""); // Para mostrar el UID del usuario (si existe)

  // Función para extraer el dominio base desde una URL completa (maneja errores)
  const extractDomain = (url) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url; // Si no es una URL válida, se devuelve tal cual
    }
  };

  // Función que maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();  // Previene el comportamiento por defecto del formulario
    setError("");        // Reinicia errores previos

    if (!domain.trim()) {
      setError("Por favor ingresa un dominio válido");
      return;
    }

    const cleanDomain = extractDomain(domain);          // Limpia y extrae el dominio
    const userId = user?.uid || "desconocido";          // Si el usuario está logueado, usamos su UID
    setUserIdDisplayed(userId);                         // Mostrar el userId en pantalla

    try {
      // Llamada al backend para resolver la IP del dominio
      const response = await fetch(
        `http://localhost:8080/api/ipresolver/resolve-ip?domain=${cleanDomain}`
      );
      const data = await response.json();

      if (data.ip) {
        setResolvedIp(data.ip);    // Muestra IP resuelta en el componente padre
        setError("");              // Limpia errores

        // Obtener IP pública del cliente
        const ipRes = await fetch("https://api.ipify.org?format=json");
        const { ip: publicIp } = await ipRes.json();

        // Obtener localización aproximada
        let location = "Desconocido";
        try {
          const locRes = await fetch("https://ipapi.co/json/");
          const locData = await locRes.json();
          location = `${locData.city}, ${locData.country_name}`;
        } catch {
          console.warn("No se pudo obtener la localización.");
        }

        // Enviar log al backend para registrar la acción del usuario
        await fetch("http://localhost:8080/api/ipresolver/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ipAddress: publicIp,               // IP pública del cliente
            internalIpAddress: "localhost",    // IP interna (en este caso simulada)
            result: data.ip,                   // IP obtenida
            toolUsed: "ipresolver",            // Herramienta utilizada
            timestamp: Date.now(),             // Fecha y hora actual
            userAgent: navigator.userAgent,    // Info del navegador
            isBot: false,                      // Asume que no es bot
            location: location,                // Ciudad y país
            action: "IP Resolver",             // Acción realizada
            details: cleanDomain,              // Dominio solicitado
            userId,                            // ID del usuario (si está autenticado)
          }),
        });
      } else {
        // Si no se pudo resolver la IP, se limpian resultados y se muestra error
        setResolvedIp("");
        setError("No se pudo resolver la IP del dominio");
        setUserIdDisplayed("");
      }
    } catch (err) {
      console.error("Error al obtener la IP:", err);
      setError("Error al conectar con el servidor");
      setUserIdDisplayed("");
    }
  };

  // Renderizado del componente
  return (
    <>
      {/* Banner superior */}
      <div className={styles.toolBanner}>
        <img src={bannerImg} alt="Banner IP Resolver" />
      </div>

      <div className={styles.wrapper}>
        <h2 className={styles.title}> Resolver IP de un Dominio</h2>

        {/* Formulario para ingresar el dominio */}
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

        {/* Mostrar error si existe */}
        {error && <p className={styles.error}>{error}</p>}

        {/* Mostrar el ID del usuario si está autenticado */}
        {userIdDisplayed && (
          <p style={{ marginTop: "1rem", color: "#ccc" }}>
            Usuario: <strong>{userIdDisplayed}</strong>
          </p>
        )}
      </div>
    </>
  );
};

export default GetIpForm; // Exporta el componente para su uso en otras partes de la app
