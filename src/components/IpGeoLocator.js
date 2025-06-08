// Importación de React y sus hooks
import React, { useState, useEffect } from "react";

// Hook personalizado de autenticación para obtener el userId
import { useAuth } from "./AuthContext";

// Importación de estilos específicos del componente
import styles from "../css/IpGeoLocator.module.css";

// URL base del backend desplegado en Render
const API_BASE = "https://tfg-backend-wfvn.onrender.com";

// Componente principal para geolocalizar IPs públicas
function IpGeoLocator() {
  const { user } = useAuth();

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
        return;
      }

      setData(json);

      const publicIpRes = await fetch("https://api.ipify.org?format=json");
      const { ip: publicIp } = await publicIpRes.json();

      let location = "Desconocido";
      try {
        const geo = await fetch("https://ipapi.co/json/");
        const geoData = await geo.json();
        location = `${geoData.latitude}, ${geoData.longitude}`;
      } catch {
        console.warn("No se pudo obtener la localización.");
      }

      await fetch(`${API_BASE}/api/geoip/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid || "desconocido",
          ipAddress: ip,
          internalIpAddress: publicIp,
          result: `${json.city}, ${json.region}, ${json.country_name}`,
          toolUsed: "geoip",
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          isBot: false,
          location,
        }),
      });
    } catch (err) {
      console.error("❌ Error en geolocalización:", err);
      setError("Error al conectar con el servicio de geolocalización.");
    }
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}> Geolocalización de IP</h2>

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
