// src/components/NetworkScanForm.js
import React, { useState } from 'react';
import { useAuth } from './AuthContext'; // Importar el contexto para obtener userId
import styles from '../css/NetworkScanForm.module.css';
import bannerImg from '../assets/banner.avif';

const NetworkScanForm = () => {
  const { user } = useAuth();  // Obtener usuario logueado
  const [ipAddress, setIpAddress] = useState('');
  const [scanType, setScanType] = useState('basic');
  const [scanResults, setScanResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ipAddress) {
      alert('⚠️ Por favor ingresa una dirección IP o URL válida.');
      return;
    }

    let target = ipAddress;
    if (isValidUrl(ipAddress)) {
      target = extractDomain(ipAddress);
    }

    setLoading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 10 : prev));
    }, 500);

    try {
      const response = await fetch('http://localhost:8080/api/network/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: target, scanType: scanType }),
      });

      const data = await response.json();

      if (data.error) {
        alert(data.error);
        setScanResults([]);
      } else {
        if (data && data.result) {
          const parsedResults = parseScanResult(data.result);
          setScanResults(parsedResults);

          // Obtener IP pública
          let publicIp = 'Desconocida';
          try {
            const ipRes = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipRes.json();
            publicIp = ipData.ip || 'Desconocida';
          } catch (err) {
            console.warn('No se pudo obtener IP pública');
          }

          // Obtener ubicación
          let location = 'Desconocida';
          try {
            const locRes = await fetch('https://ipapi.co/json/');
            const locData = await locRes.json();
            location = `${locData.city}, ${locData.country_name}`;
          } catch (err) {
            console.warn('No se pudo obtener la localización');
          }

          // Enviar log al backend incluyendo userId
          await fetch('http://localhost:8080/api/network/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user?.uid || "desconocido",  // Aquí el UID Firebase
              ipAddress: publicIp,
              action: 'Network Scan',
              details: target,
              result: data.result,
              toolUsed: 'network_scan',
              timestamp: Date.now(),
              userAgent: navigator.userAgent,
              isBot: false,
              location: location,
            }),
          });
        } else {
          setScanResults([]);
        }
      }
    } catch (error) {
      console.error('❌ Error al realizar el escaneo:', error);
      alert('Error al realizar el escaneo. Intenta nuevamente.');
    }

    clearInterval(interval);
    setProgress(100);
    setTimeout(() => setLoading(false), 500);
  };

  const isValidUrl = (str) => {
    const pattern = new RegExp(
      '^(https?:\\/\\/)?([a-z0-9-]+\\.)+[a-z0-9]{2,4}(:[0-9]{1,5})?(\\/.*)?$',
      'i'
    );
    return pattern.test(str);
  };

  const extractDomain = (url) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const parseScanResult = (scanResult) => {
    const lines = scanResult.split('\n');
    const parsedData = [];

    lines.forEach((line) => {
      const match = line.match(/(\d+\/tcp)\s+(\w+)\s+(\S+)/);
      if (match) {
        const [_, port, state, service] = match;
        parsedData.push({ port, state, service });
      }
    });

    return parsedData;
  };

  return (
    <>
      <div className={styles.toolBanner}>
        <img src={bannerImg} alt="Banner de escaneo de red" />
      </div>

      <div className={styles.wrapper}>
        <h1 className={styles.title}>📡 Escaneo de Red</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            placeholder="Introduce la IP o dominio"
            className={styles.input}
            disabled={loading}
          />

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? '🔍 Escaneando...' : '🚀 Iniciar Escaneo'}
          </button>
        </form>

        {loading && (
          <div className={styles.loader}>
            <img src="/Animation - 1738981226902.gif" alt="Cargando..." className={styles.gif} />
            <p>⏳ Buscando puertos abiertos...</p>
            <div className={styles.progressBarContainer}>
              <div className={styles.progress} style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {!loading && scanResults.length > 0 && (
          <div className={styles.resultContainer}>
            <h2 className={styles.resultTitle}>📊 Resultados del Escaneo</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Puerto</th>
                  <th>Estado</th>
                  <th>Servicio</th>
                </tr>
              </thead>
              <tbody>
                {scanResults.map((result, index) => (
                  <tr key={index}>
                    <td>{result.port}</td>
                    <td>{result.state}</td>
                    <td>{result.service}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && scanResults.length === 0 && (
          <p className={styles.noResults}>No hay resultados para mostrar.</p>
        )}
      </div>
    </>
  );
};

export default NetworkScanForm;
