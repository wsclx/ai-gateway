# OIDC Setup Guide für DUH AI Gateway

## Google OAuth2/OIDC Konfiguration

### 1. Google Cloud Console Setup

1. Gehe zu [Google Cloud Console](https://console.cloud.google.com/)
2. Erstelle ein neues Projekt oder wähle ein bestehendes aus
3. Aktiviere die Google+ API und Google OAuth2 API

### 2. OAuth2 Credentials erstellen

1. Gehe zu "APIs & Services" > "Credentials"
2. Klicke auf "Create Credentials" > "OAuth 2.0 Client IDs"
3. Wähle "Web application" als Application type
4. Füge folgende Redirect URIs hinzu:
   - `http://localhost:5556/auth/callback` (für lokale Entwicklung)
   - `https://your-domain.com/auth/callback` (für Produktion)

### 3. Client ID und Secret kopieren

Nach der Erstellung erhältst du:
- **Client ID**: Eine lange Zeichenkette
- **Client Secret**: Eine geheime Zeichenkette

### 4. Umgebungsvariablen setzen

Erstelle eine `.env` Datei im `backend/` Verzeichnis:

```bash
# OIDC Configuration
OIDC_ISSUER=https://accounts.google.com
OIDC_CLIENT_ID=deine-client-id-hier
OIDC_CLIENT_SECRET=dein-client-secret-hier
```

### 5. Google Workspace Domain einschränken (optional)

Für zusätzliche Sicherheit kannst du den Zugriff auf deine Google Workspace Domain beschränken:

1. Gehe zu "APIs & Services" > "OAuth consent screen"
2. Wähle "Internal" als User Type
3. Füge deine Domain zur Liste der autorisierten Domains hinzu

### 6. Testen

1. Starte den Backend-Server neu
2. Gehe zu `http://localhost:5556`
3. Klicke auf "Mit Google Workspace anmelden"
4. Du solltest zu Google weitergeleitet werden

### Fehlerbehebung

**Problem**: "client_id is empty"
**Lösung**: Stelle sicher, dass `OIDC_CLIENT_ID` in der `.env` Datei gesetzt ist

**Problem**: "redirect_uri_mismatch"
**Lösung**: Überprüfe, ob die Redirect URI in der Google Cloud Console korrekt eingetragen ist

**Problem**: "access_denied"
**Lösung**: Überprüfe die OAuth Consent Screen Einstellungen

### Sicherheitshinweise

- Bewahre das Client Secret sicher auf
- Verwende HTTPS in der Produktion
- Implementiere CSRF-Schutz (bereits implementiert)
- Überwache OAuth2-Logs in der Google Cloud Console
