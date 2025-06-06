// Importación de React y hooks necesarios
import React, { createContext, useState, useContext, useEffect } from "react";

// Importación del objeto `auth` desde la configuración de Firebase
import { auth } from "../firebase";

// Función de Firebase para observar cambios en el estado de autenticación
import { onAuthStateChanged } from "firebase/auth";

// Crear el contexto que se compartirá entre los componentes
const AuthContext = createContext();

// Componente proveedor que encapsula la lógica de autenticación y expone el contexto
export const AuthProvider = ({ children }) => {
  // Estado que almacena el usuario autenticado
  const [user, setUser] = useState(null);

  // Estado que indica si la autenticación está cargando (útil para evitar renderizado prematuro)
  const [loading, setLoading] = useState(true);

  // Efecto que se ejecuta una vez al montar el componente
  useEffect(() => {
    // Suscribirse a los cambios de estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);     // Actualiza el usuario autenticado (o null si cerró sesión)
      setLoading(false);        // Marca como cargado el estado
    });

    // Limpiar la suscripción al desmontar el componente
    return () => unsubscribe();
  }, []);

  // Retorna el proveedor de contexto con el valor actual del usuario y el estado de carga
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}  {/* Renderiza los componentes hijos envueltos en el contexto */}
    </AuthContext.Provider>
  );
};

// Hook personalizado para acceder fácilmente al contexto desde otros componentes
export const useAuth = () => useContext(AuthContext);
