// Importación de React y hooks
import React, { useState } from "react";

// Estilos específicos del componente
import styles from "../css/GetIpForm.module.css";

// Imagen decorativa (banner)
import bannerImg from "../assets/banner.avif";

// Importa el contexto de autenticación para acceder al usuario actual
import { useAuth } from "../components/AuthContext";

// Componente funcional que permite al usuario introducir un dominio y resolver su IP
const GetIpForm = ({ setResolvedIp }) => {
  const { user } = useAuth(); // Obtiene el usuario actual del contexto

  // Estados locales del componente
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");
  const [userIdDisplayed, setUserIdDisplayed] = useState("");

  // Extrae el dominio base de una URL completa
  const extractDomain = (url) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!domain.trim()) {
      setError("Por favor ingresa un dominio válido");
      return;
    }

    const cleanDomain = extractDomain(domain);
    const userId = user?.uid || "desconocido";
    setUserIdDisplayed(userId);

    try {
      // Llamada al backend desplegado
      const response = await fetch(
        `https://tfg-backend-wfvn.onrender.com/api/ipresolver/resolve-ip?domain=${cleanDomain}`
      );
      const data = await response.json();

      if (data.ip) {
        setResolvedIp(data.ip);
        setError("");

        const ipRes = await fetch("https://api.ipify.org?format=json");
        const { ip: publicIp } = await ipRes.json();

        let location = "Desconocido";
        try {
          const locRes = await fetch("https://ipapi.co/json/");
          const locData = await locRes.json();
          location = `${locData.city}, ${locData.country_name}`;
        } catch {
          console.warn("No se pudo obtener la localización.");
        }

        await fetch("https://tfg-backend-wfvn.onrender.com/api/ipresolver/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ipAddress: publicIp,
            internalIpAddress: "localhost",
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
      <div className={styles.toolBanner}>
        <img src={bannerImg} alt="Banner IP Resolver" />
      </div>

      <div className={styles.wrapper}>
        <h2 className={styles.title}> Resolver IP de un Dominio</h2>

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

        {error && <p className={styles.error}>{error}</p>}

        {userIdDisplayed && (
          <p style={{ marginTop: "1rem", color: "#ccc" }}>
            Usuario: <strong>{userIdDisplayed}</strong>
          </p>
        )}
      </div>
    </>
  );
};

export default GetIpForm;
