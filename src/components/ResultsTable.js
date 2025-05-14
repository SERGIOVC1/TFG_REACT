// src/components/ResultsTable.js
import React from "react";
import styles from "../css/ResultsTable.module.css";

const ResultsTable = ({ results }) => {
  return (
    <div className={styles.wrapper}>
      {results.length > 0 ? (
        <ul>
          {results.map((result) => (
            <li key={result.id} className={styles.resultItem}>
              <p><strong>ID:</strong> {result.id}</p>
              <p><strong>Objetivo:</strong> {result.target}</p>
              <p><strong>Herramienta:</strong> {result.scanType}</p>
              <p><strong>Resultado:</strong> {result.result}</p>
              <p className={styles.timestamp}><strong>Fecha:</strong> {new Date(result.timestamp).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ textAlign: "center", color: "#777" }}>No hay resultados disponibles.</p>
      )}
    </div>
  );
};

export default ResultsTable;
