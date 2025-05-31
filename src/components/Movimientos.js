import React, { useEffect, useState } from "react";

const Movimientos = ({ userId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    fetch(`http://localhost:8080/api/audit/user/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener movimientos");
        return res.json();
      })
      .then((data) => {
        setLogs(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [userId]);

  if (!userId) return <p>Usuario no autenticado.</p>;
  if (loading) return <p>Cargando movimientos...</p>;
  if (error) return <p>Error: {error}</p>;
  if (logs.length === 0) return <p>No hay movimientos para este usuario.</p>;

  return (
    <div>
      <h2>Movimientos del usuario</h2>
      <table>
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
              <td>{log.action}</td>
              <td>{log.tableName}</td>
              <td>{log.recordId}</td>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
              <td>{log.details}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Movimientos;
