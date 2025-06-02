import React, { useState, useContext } from "react";
import styles from "../css/GetIpForm.module.css";
import bannerImg from "../assets/banner.avif";
// Importa tu contexto de auth
import { useAuth } from "../components/AuthContext";

const GetIpForm = ({ setResolvedIp }) => {
  const { user } = useAuth(); // Obtener usuario logueado, con uid o null
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");
  const [userIdDisplayed, setUserIdDisplayed] = useState("");

  const extractDomain = (url) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

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
      const response = await fetch(
        `http://localhost:8080/api/ipresolver/resolve-ip?domain=${cleanDomain}`
      );
      const data = await response.json();

      if (data.ip) {
        setResolvedIp(data.ip);
        setError("");

        // Obtener IP pública
        const ipRes = await fetch("https://api.ipify.org?format=json");
        const { ip: publicIp } = await ipRes.json();

        // Obtener localización
        let location = "Desconocido";
        try {
          const locRes = await fetch("https://ipapi.co/json/");
          const locData = await locRes.json();
          location = `${locData.city}, ${locData.country_name}`;
        } catch {
          console.warn("No se pudo obtener la localización.");
        }

        // Enviar log al backend con userId
        await fetch("http://localhost:8080/api/ipresolver/log", {
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
            location: location,
            action: "IP Resolver",
            details: cleanDomain,
            userId,  // Aquí enviamos el userId
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
