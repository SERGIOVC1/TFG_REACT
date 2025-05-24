// src/App.js
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import NetworkScanForm from "./components/NetworkScanForm";
import ResultsTable from "./components/ResultsTable";
import GetIpForm from "./components/GetIpForm";
import WhoisLookup from "./components/WhoisLookup";
import IpGeoLocator from "./components/IpGeoLocator";
import HoleheScan from "./components/HoleheScan";
import DirectoryScanner from "./components/DirectoryScanner";
import HeaderAnalysis from "./components/HeaderAnalysis";
import TechnologyScanner from "./components/TechnologyScanner";
import Traceroute from "./components/Traceroute";
import LinkGenerator from "./components/LinkGenerator";
import Landing from "./components/Landing";

import LoginRegister from "./pages/LoginRegister";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

import Movimientos from "./components/Movimientos"; // Importa el componente Movimientos

import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [networkResults, setNetworkResults] = useState([]);
  const [resolvedIp, setResolvedIp] = useState("");
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);
  const hideSidebar = () => setSidebarVisible(false);

  if (loadingUser) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>🔐 Verificando sesión...</h2>
      </div>
    );
  }

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<LoginRegister />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div style={{ display: "flex" }}>
        <Sidebar
          visible={sidebarVisible}
          onLogout={() => signOut(auth)}
          onLinkClick={hideSidebar}
        />
        <div style={{ marginLeft: sidebarVisible ? "230px" : "0", flexGrow: 1 }}>
          <Header onMenuClick={toggleSidebar} />
          <Routes>
            <Route
              path="/ip"
              element={
                <div>
                  <GetIpForm setResolvedIp={setResolvedIp} />
                  {resolvedIp && <h3>📡 La IP del dominio es: {resolvedIp}</h3>}
                </div>
              }
            />
            <Route path="/geo" element={<IpGeoLocator />} />
            <Route path="/whois" element={<WhoisLookup />} />
            <Route path="/holehe" element={<HoleheScan />} />
            <Route
              path="/network"
              element={
                <div>
                  <NetworkScanForm setNetworkResults={setNetworkResults} />
                  <ResultsTable results={networkResults} />
                </div>
              }
            />
            <Route path="/dir" element={<DirectoryScanner />} />
            <Route path="/headers" element={<HeaderAnalysis />} />
            <Route path="/tech" element={<TechnologyScanner />} />
            <Route path="/traceroute" element={<Traceroute />} />
            <Route path="/logger" element={<LinkGenerator />} />

            {/* Ruta Movimientos con userId pasado como prop */}
            <Route path="/movimientos" element={<Movimientos userId={user.uid} />} />

            <Route path="*" element={<Landing />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
