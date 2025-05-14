// src/components/IpGeoLocator.js
import React, { useState, useEffect } from "react";
import styles from "../css/IpGeoLocator.module.css";

function IpGeoLocator() {
  const [ip, setIp] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserIp = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const json = await res.json();

        if (json.ip) {
          setIp(json.ip);
          setData(json);
        } else {
          setError("No se pudo detectar la IP pública.");
        }
      } catch (err) {
        console.error("❌ Error al obtener IP pública:", err);
        setError("Error al obtener la IP del usuario.");
      }
    };

    fetchUserIp();
  }, []);

  const handleLookup = async () => {
    if (!ip.trim()) {
      setError("Introduce una IP válida.");
      return;
    }

    try {
      setError("");
      setData(null);
      const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip.trim())}/json/`);
      const json = await res.json();

      if (json.error) {
        setError("IP no encontrada o formato inválido.");
      } else {
        setData(json);
      }
    } catch (err) {
      console.error("❌ Error en geolocalización:", err);
      setError("Error al conectar con el servicio de geolocalización.");
    }
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>🌍 Geolocalización de IP</h2>

      <input
        type="text"
        placeholder="Introduce una IP (ej. 8.8.8.8)"
        value={ip}
        onChange={(e) => setIp(e.target.value)}
        className={styles.input}
      />

      <button onClick={handleLookup} className={styles.button}>
        Consultar otra IP
      </button>

      {error && <p className={styles.error}>{error}</p>}

      {data && (
        <div className={styles.resultBox}>
          <p><strong>IP:</strong> {data.ip}</p>
          <p><strong>Ciudad:</strong> {data.city}</p>
          <p><strong>Región:</strong> {data.region}</p>
          <p><strong>País:</strong> {data.country_name}</p>
          <p><strong>ISP / Org:</strong> {data.org}</p>
          <p><strong>Latitud:</strong> {data.latitude}</p>
          <p><strong>Longitud:</strong> {data.longitude}</p>
        </div>
      )}
    </div>
  );
}

export default IpGeoLocator;
