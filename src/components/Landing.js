import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../css/Landing.module.css";
import mapImage from "../assets/CIBER.webp";

const Landing = () => {
  const navigate = useNavigate();

  // Añadido scroll suave al hacer click en características
  const scrollToFeatures = () => {
    const el = document.getElementById("featuresSection");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={styles.landing}>
      {/* HERO SECTION */}
      <section className={styles.bannerSection}>
        <div className={styles.heroText}>
          <h1>
            Search Engine for the <br />{" "}
            <span className={styles.highlight}>Internet of Everything</span>
          </h1>
          <p>
            SecureOps is the first search engine for Internet-connected devices.
            Discover how Internet intelligence can help you make better
            decisions.
          </p>
          <div className={styles.buttons}>
            <button onClick={() => navigate("/ip")}>🚀 Start Now</button>
            <button className={styles.learnMore} onClick={scrollToFeatures}>
              Learn More ↓
            </button>
          </div>
        </div>
        <div className={styles.heroImage}>
          <img src={mapImage} alt="Map" />
        </div>
      </section>

      {/* FEATURE CARDS */}
      <section id="featuresSection" className={styles.features}>
        <h2>// EXPLORE THE PLATFORM</h2>
        <div className={styles.cardGrid}>
          <div className={styles.card}>
            <h3>🌐 IP Resolver</h3>
            <p>Discover the public IP of any domain instantly.</p>
          </div>
          <div className={styles.card}>
            <h3>📡 Network Exposure</h3>
            <p>Scan ports and exposed services from the Internet.</p>
          </div>
          <div className={styles.card}>
            <h3>🧠 OSINT Intelligence</h3>
            <p>Check WHOIS, geolocation, leaks, technologies and more.</p>
          </div>
          <div className={styles.card}>
            <h3>🔍 Technology Scanner</h3>
            <p>Analyze websites to identify frameworks, libraries, and CMS.</p>
          </div>
          <div className={styles.card}>
            <h3>🛡️ Security Audits</h3>
            <p>Perform vulnerability scans and monitor security posture.</p>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className={styles.statsBar}>
        <div>💼 89% of Fortune 100</div>
        <div>☁️ Top Cloud Providers</div>
        <div>🎓 1,000+ Universities</div>
        <div>🌍 150+ Countries Covered</div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerLinks}>
          <div>
            <h4>// PRODUCTS</h4>
            <ul>
              <li>Monitor</li>
              <li>Images</li>
              <li>Maps</li>
              <li>Reports</li>
              <li>Alerts</li>
            </ul>
          </div>
          <div>
            <h4>// CONTACT</h4>
            <ul>
              <li>
                <a href="mailto:support@secureops.com">sergio.velasco@a.vedrunasevillasj.es</a>
              </li>
              <li>
                <a
                  href="https://github.com/SERGIOVC1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>{" "}
                ·{" "}
                <a
                  href="https://www.linkedin.com/feed/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Twitter
                </a>{" "}
                ·{" "}
                <a
                  href="https://www.linkedin.com/feed/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>
        <p className={styles.copy}>
          © {new Date().getFullYear()} SecureOps — All rights reserved
        </p>
      </footer>
    </div>
  );
};

export default Landing;
