import React, { useState } from "react";
import styles from "../css/GetIpForm.module.css";
import bannerImg from "../assets/banner.avif"; // Asegúrate de tener esta imagen

const GetIpForm = ({ setResolvedIp }) => {
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!domain) {
      setError("Por favor ingresa un dominio válido");
      return;
    }

    const cleanDomain = extractDomain(domain);

    try {
      const response = await fetch(`http://localhost:8080/api/network/resolve-ip?domain=${cleanDomain}`);
      const data = await response.json();

      if (data.ip) {
        setResolvedIp(data.ip);
        setError("");
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
    } catch (error) {
      return url;
    }
  };

  return (
    <>
      <div className={styles.toolBanner}>
        <img src={bannerImg} alt="Banner IP Resolver" />
      </div>

      <div className={styles.wrapper}>
       
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
