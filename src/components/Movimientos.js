// Importación de React y hooks
import React, { useEffect, useState } from "react";

// Estilos CSS específicos del componente
import styles from "../css/Movimientos.module.css";

// Componente que muestra el historial de acciones (auditoría) de un usuario
const Movimientos = ({ userId }) => {
  const [logs, setLogs] = useState([]);         // Lista de movimientos del usuario
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(null);     // Estado de error (si ocurre)

  // useEffect que se ejecuta cada vez que cambia el userId
  useEffect(() => {
    if (!userId) return; // Si no hay userId, no hace nada

    setLoading(true);    // Activa indicador de carga

    // Solicita los movimientos del usuario al backend
    fetch(`http://localhost:8080/api/audit/user/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener movimientos");
        return res.json(); // Parsear la respuesta como JSON
      })
      .then((data) => {
        setLogs(data);     // Guardar los datos recibidos
        setLoading(false); // Finalizar carga
      })
      .catch((e) => {
        setError(e.message); // Captura errores y guarda el mensaje
        setLoading(false);
      });
  }, [userId]);

  // Distintos estados de la interfaz según la situación

  // Si no hay usuario autenticado
  if (!userId)
    return <p className={styles.message}>Usuario no autenticado.</p>;

  // Mientras se están cargando los movimientos
  if (loading)
    return <p className={styles.message}>Cargando movimientos...</p>;

  // Si ocurrió un error en la consulta
  if (error) return <p className={styles.error}>Error: {error}</p>;

  // Si no se encontraron movimientos registrados
  if (logs.length === 0)
    return <p className={styles.message}>No hay movimientos para este usuario.</p>;

  // Si hay movimientos disponibles, renderiza la tabla con los datos
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Movimientos del usuario</h2>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Acción</th>
              <th>Tabla</th>
              <th>ID Registro</th>
              <th>Fecha</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, idx) => (
              <tr key={idx}>
                <td>{log.action}</td>                                {/* Tipo de acción (INSERT, DELETE, etc.) */}
                <td>{log.tableName}</td>                             {/* Nombre de la tabla afectada */}
                <td>{log.recordId}</td>                              {/* ID del registro modificado */}
                <td>{new Date(log.timestamp).toLocaleString()}</td> {/* Fecha y hora del evento */}
                <td>{log.details}</td>                               {/* Descripción o información adicional */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Movimientos; // Exporta el componente
