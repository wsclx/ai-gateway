## Technische Spezifikation und Dokumentation – DUH AI Gateway

---

### 1\. Einleitung & Scope

Die Deutsche Umwelthilfe (DUH) möchte eine **lokale Intranet-Anwendung** bereitstellen, die den Fachbereichen ermöglicht, abteilungsspezifische AI-Assistenten zu nutzen. Diese basieren auf den OpenAI CustomGPTs und werden kontinuierlich trainiert und optimiert. Das System soll die folgenden Ziele erfüllen:

* **Trainerbare Assistenten**: Abteilungen wie Recht, Kommunikation, Social Media, Wissenschaft können eigene Assistenten nutzen und optimieren.

* **DSGVO-konforme Speicherung**: Sämtliche Prompts, Antworten und Metadaten werden verschlüsselt in einer lokalen Datenbank gespeichert.

* **Prompt Library**: Die gespeicherten Daten dienen als Best Practice Sammlung.

* **Überwachung und Compliance**: IT und Datenschutzbeauftragte erhalten Einblick in Nutzung, Kosten und Policy-Events.

* **Integration ins Intranet**: Bereitstellung innerhalb der bestehenden DUH-Infrastruktur (Mantra).

Erweiterte Ziele:

1. **Kostenkontrolle & Routing**: GPT-5 mini wird als Default verwendet, GPT-5 groß nur bei Bedarf.

2. **Portabilität & Erweiterbarkeit**: Leicht auf dem DUH-Intranet lauffähig, Migration zu Kubernetes möglich.

3. **Sicherheit & Datenhoheit**: Alle Inhalte verbleiben in DUH-Systemen.

---

### 2\. Systemarchitektur (Detail)

### **Übersicht**

Das System besteht aus 5 Schichten:

1. **Frontend Layer** (Next.js, React, Tailwind)

2. **API Layer** (FastAPI, modulare Services)

3. **Provider Layer** (OpenAI, Anthropic)

4. **Storage Layer** (PostgreSQL, Redis, MinIO)

5. **Observability & Security Layer** (Prometheus, Grafana, NGINX, Vault)

### **Textuelles Architekturdiagramm**

\[User Browser\] \-- OIDC Login \--\> \[Frontend (Next.js)\] \--API Calls--\> \[Backend (FastAPI)\]  
    |                                                         |  
    |-- Streaming SSE \--------------------------------------\> |  
                                                              |  
                                                        \[Provider Adapter\]  
                                                    /         |           \\  
                                            \[OpenAI API\]  \[Claude API\]   \[Cache\]  
                                                              |  
                                                            \[DB Layer\]  
---

### 3\. Komponentenbeschreibung

### **Frontend**

* **Framework**: Next.js 14, React, TypeScript

* **Styling**: TailwindCSS, shadcn/ui

* **Features**:

  * OIDC Login (Google Workspace)

  * Chat-Interface (Streaming via SSE)

  * Assistenten-Auswahl je Department

  * Feedback-Funktion (Daumen hoch/runter, Kommentare)

  * Admin-Panel (Assistenten, Policies, Budgets)

  * Analytics Dashboard (Tokens, Kosten, Nutzung)

### **Backend**

* **Framework**: FastAPI (async-first)

* **Module**:

  * auth/: OIDC, RBAC

  * assistants/: CRUD für GPTs, Department-Zuordnung

  * chat/: Kommunikation mit LLMs, Streaming

  * providers/: Adapter für OpenAI/Anthropic

  * dlp/: PII-Erkennung, Redaction, Audit Logging

  * analytics/: Kosten, Nutzung, Performance

  * tickets/: Jira/Linear Connector

  * governance/: DSGVO-Mechanismen (Retention, Export, Delete)

### **Storage**

* **PostgreSQL 16** (mit pgvector \+ TimescaleDB)

* **Redis 7** (Caching, Rate Limits)

* **MinIO** (S3-kompatibel für Dateianhänge)

### **Security**

* NGINX (TLS, Reverse Proxy, HSTS)

* HashiCorp Vault (Secrets Management)

* AES-GCM Verschlüsselung für Messages

* DSGVO Policies (Retention, Redaction, Export)

### **Observability**

* Prometheus (Metriken)

* Grafana (Dashboards)

* Loki (Logs)

* OpenTelemetry (Tracing)

* Metabase (Business-Analytics)

---

### 4\. Datenmodell

### **Kern-Tabellen**

* **app\_users**: Nutzer\*innen (OIDC Subject, Department, Rolle)

* **assistants**: GPT-Instanzen \+ Department-Zuordnung

* **threads**: Chat-Sessions pro Nutzer\*in

* **messages**: Prompts & Antworten (verschlüsselt)

* **policy\_events**: Dokumentation DLP & Compliance Events

* **feedback**: Bewertungen (1–5 Sterne, Labels)

* **datasets**: Trainingsdaten (Quarantäne, Freigabe durch Stewards)

* **retention\_rules**: Lösch- und Anonymisierungsregeln

### **DSGVO-Mechanismen**

* Nutzer\*innen werden mit Hash-IDs gespeichert.

* PII wird durch ***\[Platzhalter: …\]*** ersetzt.

* Retention-Jobs löschen Daten nach 180 Tagen (operativ) bzw. 3 Jahren (Audit).

* Export- und Delete-Endpunkte für Betroffenenrechte.

---

### 5\. Installations- & Setup-Anleitung

### **Voraussetzungen**

* Ubuntu 22.04 Server

* Docker & Docker Compose

* GitHub Account (für Repos)

* OpenAI & Anthropic API Keys

* Google Workspace OIDC Zugang

### **Schritte**

1. **Repo klonen**:

git clone https://github.com/duh/ai-gateway  
cd ai-gateway

1. 

2. **Umgebungsvariablen konfigurieren** (.env):

OPENAI\_API\_KEY=\*\*\*\[Platzhalter: OPENAI\_API\_KEY\]\*\*\*  
ANTHROPIC\_API\_KEY=\*\*\*\[Platzhalter: ANTHROPIC\_API\_KEY\]\*\*\*  
OIDC\_CLIENT\_ID=\*\*\*\[Platzhalter: OIDC\_CLIENT\_ID\]\*\*\*  
OIDC\_CLIENT\_SECRET=\*\*\*\[Platzhalter: OIDC\_CLIENT\_SECRET\]\*\*\*  
POSTGRES\_PASSWORD=\*\*\*\[Platzhalter: POSTGRES\_PASSWORD\]\*\*\*

2. 

3. **Docker Compose starten**:

docker-compose up \-d

3. 

4. **Datenbank-Migrationen ausführen**:

docker exec \-it backend alembic upgrade head

4. 

5. **Erreichbarkeit prüfen**: https://intranet.duh.de/ai

---

### 6\. Konfiguration & Anpassung

### **config.yml**

assistants:  
  \- name: Recht Assistent  
    model: gpt-5-mini  
    department: Recht  
    system\_prompt: "Du bist juristisch präzise und zitierst Gesetze."  
  \- name: Social Media Coach  
    model: gpt-5-mini  
    department: Kommunikation  
    system\_prompt: "Du schreibst kreative, prägnante Posts."

retention:  
  \- purpose: operational  
    retention\_days: 180  
  \- purpose: audit  
    retention\_days: 1095

### **Admin Panel**

* Neue Assistenten anlegen

* Department-Zuordnung

* Policies setzen (Redaction, Retention)

* Kostenlimits pro Department

---

### 7\. Betriebsprozesse

### **Monitoring**

* Prometheus: Tokenverbrauch, Kosten, Fehlerquote

* Grafana: Dashboards je Department

* Alerts: Budgetüberschreitungen, Policy-Verletzungen

### **DSGVO-Handling**

* **Retention Jobs**: täglich

* **Export**: Nutzer\*in kann alle Daten abrufen (JSON/PDF)

* **Delete**: vollständige Löschung inkl. Audit Trail

### **Logging**

* Loki: strukturierte Logs (JSON)

* OpenTelemetry: Trace IDs für Requests

---

### 8\. Portabilität & Deployment

* **Intranet-Integration**: via Link oder iFrame in Mantra

* **Kubernetes**: Helm Charts vorhanden

* **Secrets**: in Vault oder sops-age

* **Backup**: Postgres (täglich), MinIO (wöchentlich)

---

### 9\. User- und Admin-Flows

### **User Flow (Beispiel)**

1. Nutzer\*in loggt sich via OIDC ein.

2. Department-Zuordnung erfolgt automatisch.

3. Assistenten-Picker zeigt verfügbare Assistenten.

4. Prompt wird gesendet → DLP prüft → Provider Antwort.

5. Antwort erscheint im Chat, Feedback kann gegeben werden.

### Admin Flow (Beispiel)

1. Admin loggt sich ein.

2. Legt neuen Assistenten an (Name, Modell, Prompt, Department).

3. Setzt Kosten- und Tokenlimits.

4. Überwacht Nutzung via Analytics Dashboard.

5. Führt Retention- und DSGVO-Exporte aus.

---

### 10\. Sicherheit & Compliance

* **Redaction Tokens**: Alle PII wird ersetzt.

* **Encryption**: AES-GCM für Inhalte.

* **RBAC**: Rollenbasiertes Zugriffsmodell.

* **Audit Trails**: Jede Policy-Verletzung dokumentiert.

* **Betroffenenrechte**: Export & Delete vollständig implementiert.

---

### 11\. Step-by-Step: Einrichtung eines CustomGPT für ein Department

1. **Neuen Assistant in OpenAI Platform erstellen**

   * Modell wählen (z. B. gpt-5-mini)

   * System Prompt definieren

   * API Key notieren

2. **Assistant im DUH Gateway anlegen (Admin Panel)**

   * Name: „Recht Assistent“

   * Department: Recht

   * OpenAI Assistant ID eintragen

   * Policies zuordnen

3. **Testlauf durchführen**

   * Chat starten

   * Beispielprompt senden

   * DSGVO-Redaction überprüfen

4. **Feedback aktivieren**

   * Nutzer\*innen geben Rückmeldung

   * Daten werden in Feedback-Tabelle gespeichert

5. **Training vorbereiten**

   * Positives Feedback → Quarantäne-Dataset

   * Steward prüft und gibt frei

   * Fine-Tuning oder RAG Update durchführen

---

### 12\. Nächste Schritte / Betriebshandbuch

1. Proof of Concept mit 2 Abteilungen (Recht, Kommunikation)

2. DSGVO-Testlauf (Retention, Export, Delete)

3. Rollout auf weitere Departments

4. Integration in Mantra

5. Schulung der Admins

6. Regelmäßige Red Teaming Tests (Sicherheit)  
