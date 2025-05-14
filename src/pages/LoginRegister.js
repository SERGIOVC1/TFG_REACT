import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import loginImg from "../assets/log.svg";
import registerImg from "../assets/register.svg";

function LoginRegister() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  // 🔁 Carga y elimina el CSS solo para esta página
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/login.css"; // Debe estar en la carpeta `public`
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
    setMessage("");
    setEmail("");
    setPassword("");
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage("✅ Registro exitoso. Ahora puedes iniciar sesión.");
        setIsSignUp(false);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage("✅ Sesión iniciada correctamente.");
        navigate("/"); // Redirige al dashboard
      }
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    }
  };

  return (
    <div className={`container ${isSignUp ? "sign-up-mode" : ""}`}>
      <div className="forms-container">
        <div className="signin-signup">
          <form
            onSubmit={handleAuth}
            className={isSignUp ? "sign-up-form" : "sign-in-form"}
          >
            <h2 className="title">
              {isSignUp ? "Crear cuenta" : "Iniciar sesión"}
            </h2>
            <div className="input-field">
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                placeholder="Correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-field">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <input
              type="submit"
              className="btn"
              value={isSignUp ? "Registrarse" : "Entrar"}
            />
            {message && <p style={{ marginTop: "10px" }}>{message}</p>}
          </form>
        </div>
      </div>

      <div className="panels-container">
        <div className="panel left-panel">
          <div className="content">
            <h3>¿Nuevo por aquí?</h3>
            <p>
              Regístrate y explora todas las herramientas de seguridad que
              hemos preparado para ti.
            </p>
            <button className="btn transparent" onClick={toggleForm}>
              Registrarse
            </button>
          </div>
          <img src={registerImg} className="image" alt="register" />
        </div>

        <div className="panel right-panel">
          <div className="content">
            <h3>¿Ya tienes cuenta?</h3>
            <p>
              Inicia sesión con tus credenciales para acceder a la plataforma.
            </p>
            <button className="btn transparent" onClick={toggleForm}>
              Iniciar sesión
            </button>
          </div>
          <img src={loginImg} className="image" alt="login" />
        </div>
      </div>
    </div>
  );
}

export default LoginRegister;
