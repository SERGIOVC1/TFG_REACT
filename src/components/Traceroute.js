import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "../css/Traceroute.module.css";
import bannerImg from "../assets/banner.avif";
import { useAuth } from "../components/AuthContext";

// Backend desplegado en Render
const API_BASE = "https://tfg-backend-wfvn.onrender.com";

// Configuración de iconos por defecto de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const Traceroute = () => {
  const { user } = useAuth();
  const [target, setTarget] = useState("");
  const [geoHops, setGeoHops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const normalizeTarget = (input) =>
    input.replace(/^https?:\/\//, "").split("/")[0];

  const getProviderName = (org) => {
    const lower = (org || "").toLowerCase();
    if (lower.includes("telefonica")) return "Telefónica";
    if (lower.includes("orange")) return "Orange";
    if (lower.includes("vodafone")) return "Vodafone";
    if (lower.includes("google")) return "Google";
    if (lower.includes("cloudflare")) return "Cloudflare";
    if (lower.includes("akamai")) return "Akamai";
    if (lower.includes("amazon")) return "Amazon (AWS)";
    if (lower.includes("ovh")) return "OVH";
    if (lower.includes("microsoft")) return "Microsoft (Azure)";
    return org || "Desconocido";
  };

  const handleTraceroute = async () => {
    if (!target.trim()) {
      setError("Por favor introduce un dominio o IP.");
      return;
    }

    setLoading(true);
    setError("");
    setGeoHops([]);

    try {
      const cleanTarget = normalizeTarget(target);
      const userId = user?.uid || "desconocido";
      const params = new URLSearchParams({ target: cleanTarget, userId });

      const response = await fetch(`${API_BASE}/api/traceroute?${params}`);
      const data = await response.json(); // ejemplo: ["1 192.168.1.1", "2 8.8.8.8", ...]

      const ipList = data
        .map((line) => line.match(/(\d{1,3}\.){3}\d{1,3}/)?.[0])
        .filter(Boolean);

      const geos = await Promise.all(
        ipList.map(async (ip) => {
          try {
            const res = await fetch(`http://ip-api.com/json/${ip}`);
            const info = await res.json();
            return {
              ip,
              lat: info.lat,
              lon: info.lon,
              org: getProviderName(info.org),
              city: info.city || "Desconocido",
              country: info.country || "Desconocido",
            };
          } catch {
            return {
              ip,
              lat: null,
              lon: null,
              org: "Desconocido",
              city: "?",
              country: "?",
            };
          }
        })
      );

      setGeoHops(geos.filter((g) => g.lat && g.lon));
    } catch (err) {
      console.error(err);
      setError("❌ Error al ejecutar traceroute.");
    } finally {
      setLoading(false);
    }
  };

  const center = geoHops.length ? [geoHops[0].lat, geoHops[0].lon] : [40, 0];
  const polyline = geoHops.map((hop) => [hop.lat, hop.lon]);

  return (
    <>
      <div className={styles.toolBanner}>
        <img src={bannerImg} alt="Traceroute banner" />
      </div>

      <div className={styles.container}>
        <h2 className={styles.title}>Traceroute Interactivo</h2>

        <input
          type="text"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="ej. google.com"
          className={styles.input}
        />
        <button
          onClick={handleTraceroute}
          className={styles.button}
          disabled={loading}
        >
          Ejecutar Traceroute
        </button>

        {loading && <p className={styles.loading}>⏳ Ejecutando...</p>}
        {error && <p className={styles.error}>{error}</p>}

        {geoHops.length > 0 && (
          <>
            <div className={styles.tableContainer}>
              <h3 className={styles.subtitle}>📍 Saltos:</h3>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>IP</th>
                    <th>Ubicación</th>
                    <th>Proveedor</th>
                  </tr>
                </thead>
                <tbody>
                  {geoHops.map((hop, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{hop.ip}</td>
                      <td>
                        {hop.city}, {hop.country}
                      </td>
                      <td>{hop.org}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.mapWrapper}>
              <MapContainer
                center={center}
                zoom={2}
                scrollWheelZoom
                className={styles.map}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {geoHops.map((hop, idx) => (
                  <Marker key={idx} position={[hop.lat, hop.lon]}>
                    <Popup>
                      <strong>Salto {idx + 1}</strong>
                      <br />
                      IP: {hop.ip}
                      <br />
                      {hop.city}, {hop.country}
                      <br />
                      Proveedor: {hop.org}
                    </Popup>
                  </Marker>
                ))}
                <Polyline positions={polyline} color="deepskyblue" />
              </MapContainer>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Traceroute;
