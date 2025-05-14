// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // Importamos getAuth para la autenticación
import { getFirestore } from 'firebase/firestore'; // Si necesitas Firestore en el futuro

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDB7ECywPu4cwzSQ8DLkqvoRPDS-xL6U_w",
  authDomain: "security-ops-cb5a8.firebaseapp.com",
  projectId: "security-ops-cb5a8",
  storageBucket: "security-ops-cb5a8.firebasestorage.app",
  messagingSenderId: "386277858541",
  appId: "1:386277858541:web:c09dcc4ca940cd9db3c0e4",
  measurementId: "G-1T9KRYVJCB"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta las instancias que utilizarás en otras partes de la aplicación
export const auth = getAuth(app); // Autenticación
export const db = getFirestore(app); // Base de datos Firestore (si la usas en el futuro)
// 