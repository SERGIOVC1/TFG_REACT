// Importación de React y hooks
import React, { useState } from 'react';

// Contexto de autenticación para obtener el UID del usuario
import { useAuth } from './AuthContext';

// Estilos específicos para el formulario de escaneo
import styles from '../css/NetworkScanForm.module.css';

// Imagen de banner decorativa
import bannerImg from '../assets/banner.avif';

// Componente principal que permite realizar escaneos de red (Nmap)
const NetworkScanForm = () => {
  const { user } = useAuth();  // Usuario autenticado

  // Estados del formulario
  const [ipAddress, setIpAddress] = useState('');         // Dirección IP o dominio ingresado
  const [scanType, setScanType] = useState('basic');      // Tipo de escaneo (fijo aquí como 'basic')
  const [scanResults, setScanResults] = useState([]);     // Resultados procesados
  const [loading, setLoading] = useState(false);          // Indicador de carga
  const [progress, setProgress] = useState(0);            // Porcentaje de progreso del escaneo

  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ipAddress) {
      alert('⚠️ Por favor ingresa una dirección IP o URL válida.');
      return;
    }

    // Si se detecta que es una URL, extrae solo el dominio
    let target = ipAddress;
    if (isValidUrl(ipAddress)) {
      target = extractDomain(ipAddress);
    }

    setLoading(true);
    setProgress(0);

    // Simula una barra de progreso mientras se escanea
    const interval = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 10 : prev));
    }, 500);

    try {
      // Petición al backend para iniciar el escaneo
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
          // Procesa el resultado plano del escaneo
          const parsedResults = parseScanResult(data.result);
          setScanResults(parsedResults);

          // Obtiene la IP pública del cliente
          let publicIp = 'Desconocida';
          try {
            const ipRes = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipRes.json();
            publicIp = ipData.ip || 'Desconocida';
          } catch (err) {
            console.warn('No se pudo obtener IP pública');
          }

          // Obtiene la ubicación del cliente
          let location = 'Desconocida';
          try {
            const locRes = await fetch('https://ipapi.co/json/');
            const locData = await locRes.json();
            location = `${locData.city}, ${locData.country_name}`;
          } catch (err) {
            console.warn('No se pudo obtener la localización');
          }

          // Envío de log al backend con metadatos del escaneo
          await fetch('http://localhost:8080/api/network/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user?.uid || "desconocido",
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

    clearInterval(interval);  // Detiene la barra de progreso simulada
    setProgress(100);         // Progreso completo
    setTimeout(() => setLoading(false), 500);  // Oculta carga tras breve espera
  };

  // Verifica si el texto ingresado es una URL válida
  const isValidUrl = (str) => {
    const pattern = new RegExp(
      '^(https?:\\/\\/)?([a-z0-9-]+\\.)+[a-z0-9]{2,4}(:[0-9]{1,5})?(\\/.*)?$',
      'i'
    );
    return pattern.test(str);
  };

  // Extrae el dominio principal de una URL
  const extractDomain = (url) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  // Parsea el resultado del escaneo (tipo Nmap) para obtener puertos, estados y servicios
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

  // Render del componente
  return (
    <>
      {/* Banner superior */}
      <div className={styles.toolBanner}>
        <img src={bannerImg} alt="Banner de escaneo de red" />
      </div>

      {/* Formulario e interfaz de escaneo */}
      <div className={styles.wrapper}>
        <h1 className={styles.title}>Escaneo de Red</h1>

        {/* Formulario para ingresar IP o dominio */}
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

        {/* Barra de carga y animación durante el escaneo */}
        {loading && (
          <div className={styles.loader}>
            <img src="/Animation - 1738981226902.gif" alt="Cargando..." className={styles.gif} />
            <p>⏳ Buscando puertos abiertos...</p>
            <div className={styles.progressBarContainer}>
              <div className={styles.progress} style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Resultados del escaneo (tabla) */}
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

        {/* Mensaje si no hubo resultados */}
        {!loading && scanResults.length === 0 && (
          <p className={styles.noResults}>No hay resultados para mostrar.</p>
        )}
      </div>
    </>
  );
};

export default NetworkScanForm;  // Exporta el componente
