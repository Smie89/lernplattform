import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import styles from './index.module.css';

const bereiche = [
  {icon: '🧪', titel: 'Softwaretest', text: 'Teststufen, Testarten, Testentwurfsverfahren', pfad: '/lernen/softwaretest'},
  {icon: '🤖', titel: 'Testautomation', text: 'C#, Java, Python, Browser, Mobile, Desktop, Performance, API', pfad: '/lernen/testautomation'},
  {icon: '💻', titel: 'Softwareentwicklung', text: 'OOP, Clean Code, Design Patterns, Git', pfad: '/lernen/softwareentwicklung'},
  {icon: '🐧', titel: 'Linux', text: 'Shell, Rechte, Prozesse, Bash-Skripte', pfad: '/lernen/linux'},
  {icon: '🐳', titel: 'Docker', text: 'Images, Container, Compose, Testcontainers', pfad: '/lernen/docker'},
  {icon: '🧠', titel: 'Künstliche Intelligenz', text: 'ML-Grundlagen, LLMs, KI im Testen', pfad: '/lernen/ki'},
  {icon: '🔐', titel: 'Cybersecurity', text: 'OWASP Top 10, Sicherheitstests, Härtung, Angriffserkennung', pfad: '/lernen/cybersecurity'},
  {icon: '🗄️', titel: 'Datenbanken und SQL', text: 'SELECT bis JOIN, Transaktionen, Datenbanken im Test', pfad: '/lernen/datenbanken'},
  {icon: '🌐', titel: 'Netzwerke', text: 'IP und Subnetze, TCP/UDP, DNS, HTTP und TLS, Wireshark', pfad: '/lernen/netzwerke'},
  {icon: '☁️', titel: 'Cloud', text: 'Geteilte Verantwortung, IAM, Infrastructure as Code', pfad: '/lernen/cloud'},
  {icon: '☸️', titel: 'Kubernetes', text: 'Pods, Deployments, Probes und Tests gegen einen Cluster', pfad: '/lernen/kubernetes'},
  {icon: '📈', titel: 'Observability', text: 'Logs, Metriken und Traces – und wie man sie testet', pfad: '/lernen/observability'},
  {icon: '🎓', titel: 'ISTQB-Zertifizierung', text: 'Test Automation Engineering (CTAL-TAE) mit Prüfungssimulation', pfad: '/lernen/istqb'},
  {icon: '📇', titel: 'Stichwortverzeichnis', text: 'Alle Themen von A bis Z – schnell nachschlagen', pfad: '/stichwortverzeichnis'},
  {icon: '💾', titel: 'Fortschritt übertragen', text: 'Lernstand zwischen Handy und PC austauschen', pfad: '/fortschritt'},
  {icon: '🔁', titel: 'Wiederholen', text: 'Fällige Fragen aus allen Lektionen – mit Wiederholungsplan', pfad: '/wiederholen'},
];

export default function Home() {
  return (
    <Layout title="Start" description="Persönliche Lernplattform">
      <header className={styles.hero}>
        <div className="container">
          <h1 className={styles.heroTitel}>Lernplattform</h1>
          <p className={styles.heroText}>
            Artikel mit Praxisbeispielen und interaktiven Quizfragen – jede Frage führt zum passenden Abschnitt.
          </p>
        </div>
      </header>
      <main className="container margin-vert--lg">
        <div className={styles.raster}>
          {bereiche.map((b) => (
            <Link key={b.pfad} to={b.pfad} className={styles.karte}>
              <span className={styles.icon}>{b.icon}</span>
              <h2 className={styles.kartenTitel}>{b.titel}</h2>
              <p className={styles.kartenText}>{b.text}</p>
            </Link>
          ))}
        </div>
      </main>
    </Layout>
  );
}
