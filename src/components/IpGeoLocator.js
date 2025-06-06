// Importación de React y sus hooks
import React, { useState, useEffect } from "react";

// Hook personalizado de autenticación para obtener el userId
import { useAuth } from "./AuthContext";  // Ajusta la ruta si es necesario

// Importación de estilos específicos del componente
import styles from "../css/IpGeoLocator.module.css";

// Componente principal para geolocalizar IPs públicas
function IpGeoLocator() {
  const { user } = useAuth();  // Obtener usuario autenticado (si existe)

  // Estados del componente
  const [ip, setIp] = useState("");       // IP que se va a consultar
  const [data, setData] = useState(null); // Información geográfica de la IP
  const [error, setError] = useState(""); // Mensajes de error

  // useEffect que se ejecuta al cargar el componente
  useEffect(() => {
    const fetchUserIp = async () => {
      try {
        // Obtener datos geográficos de la IP pública actual del usuario
        const res = await fetch("https://ipapi.co/json/");
        const json = await res.json();

        if (json.ip) {
          setIp(json.ip);     // Establecer IP detectada automáticamente
          setData(json);      // Establecer datos iniciales
        } else {
          setError("No se pudo detectar la IP pública.");
        }
      } catch (err) {
        console.error("❌ Error al obtener IP pública:", err);
        setError("Error al obtener la IP del usuario.");
      }
    };

    fetchUserIp();  // Ejecutar al montar el componente
  }, []);

  // Función para consultar manualmente otra IP
  const handleLookup = async () => {
    if (!ip.trim()) {
      setError("Introduce una IP válida.");
      return;
    }

    try {
      setError("");
      setData(null);  // Limpiar resultados previos

      // Consultar la IP ingresada por el usuario
      const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip.trim())}/json/`);
      const json = await res.json();

      if (json.error) {
        setError("IP no encontrada o formato inválido.");
        return;
      }

      setData(json);  // Guardar datos obtenidos

      // Obtener la IP pública del navegador para logging
      const publicIpRes = await fetch("https://api.ipify.org?format=json");
      const { ip: publicIp } = await publicIpRes.json();

      // Obtener ubicación de referencia para logging (lat/lon)
      let location = "Desconocido";
      try {
        const geo = await fetch("https://ipapi.co/json/");
        const geoData = await geo.json();
        location = `${geoData.latitude}, ${geoData.longitude}`;
      } catch {
        console.warn("No se pudo obtener la localización.");
      }

      // Registrar la búsqueda en el backend
      await fetch("http://localhost:8080/api/geoip/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid || "desconocido",                          // UID si está logueado
          ipAddress: ip,                                              // IP consultada
          internalIpAddress: publicIp,                                // IP pública real del usuario
          result: `${json.city}, ${json.region}, ${json.country_name}`, // Resultado simplificado
          toolUsed: "geoip",                                          // Herramienta utilizada
          timestamp: Date.now(),                                      // Fecha y hora
          userAgent: navigator.userAgent,                             // Navegador
          isBot: false,                                               // Se asume que no es bot
          location: location                                          // Ubicación del cliente
        }),
      });
    } catch (err) {
      console.error("❌ Error en geolocalización:", err);
      setError("Error al conectar con el servicio de geolocalización.");
    }
  };

  // Render del componente
  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}> Geolocalización de IP</h2>

      {/* Campo para ingresar una IP manual */}
      <input
        type="text"
        placeholder="Introduce una IP (ej. 8.8.8.8)"
        value={ip}
        onChange={(e) => setIp(e.target.value)}
        className={styles.input}
      />

      {/* Botón para consultar otra IP distinta */}
      <button onClick={handleLookup} className={styles.button}>
        Consultar otra IP
      </button>

      {/* Mostrar mensaje de error si ocurre */}
      {error && <p className={styles.error}>{error}</p>}

      {/* Mostrar resultados si se obtuvo información válida */}
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

export default IpGeoLocator; // Exporta el componente para usarlo en la app
