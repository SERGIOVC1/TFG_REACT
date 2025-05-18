import React, { useState } from "react";
import styles from "../css/GetIpForm.module.css";
import bannerImg from "../assets/banner.avif";

const GetIpForm = ({ setResolvedIp }) => {
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!domain.trim()) {
      setError("Por favor ingresa un dominio válido");
      return;
    }

    const cleanDomain = extractDomain(domain);

    try {
      const response = await fetch(
        `http://localhost:8080/api/network/resolve-ip?domain=${cleanDomain}`
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

        // Registrar en backend
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
            details: cleanDomain
          })
        });
      } else {
        setResolvedIp("");
        setError("No se pudo resolver la IP del dominio");
      }
    } catch (err) {
      console.error("Error al obtener la IP:", err);
      setError("Error al conectar con el servidor");
    }
  };

  const extractDomain = (url) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  return (
    <>
      <div className={styles.toolBanner}>
        <img src={bannerImg} alt="Banner IP Resolver" />
      </div>

      <div className={styles.wrapper}>
        <h2 className={styles.title}>🌐 Resolver IP de un Dominio</h2>

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
      </div>
    </>
  );
};

export default GetIpForm;
