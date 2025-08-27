# Content & Microcopy Guidelines

## Tonalität

### Allgemeiner Ton
- **Professionell aber freundlich**: Formell genug für Business, aber nicht steif
- **Deutsch als Primärsprache**: Alle UI-Texte auf Deutsch
- **Klar und direkt**: Keine Umschreibungen oder Marketing-Sprache
- **Benutzer-zentriert**: Fokus auf das, was der Benutzer erreichen möchte

### Sprachliche Regeln
- **Du-Form**: Konsistente Verwendung der informellen Anrede
- **Aktive Verben**: "Speichern" statt "Wird gespeichert"
- **Positive Formulierung**: "Erfolgreich gespeichert" statt "Kein Fehler aufgetreten"

## Knopflabels

### Standard-Button-Texte
```typescript
// Primäre Aktionen
<Button>Speichern</Button>
<Button>Löschen</Button>
<Button>Bearbeiten</Button>

// Sekundäre Aktionen
<Button variant="outline">Abbrechen</Button>
<Button variant="outline">Zurück</Button>

// Bestätigungen
<Button variant="destructive">Endgültig löschen</Button>
<Button>Ja, bestätigen</Button>
```

### Konsistente Begriffe
- **Speichern** statt "Übernehmen", "Bestätigen", "OK"
- **Abbrechen** statt "Schließen", "Zurück", "Nein"
- **Bearbeiten** statt "Ändern", "Modifizieren", "Anpassen"

## Leere Zustände

### Keine Daten
```typescript
// Beispiel für leere Listen
<div className="text-center py-12">
  <Inbox className="mx-auto h-12 w-12 text-gray-400" />
  <h3 className="mt-2 text-sm font-medium text-gray-900">
    Keine Daten vorhanden
  </h3>
  <p className="mt-1 text-sm text-gray-500">
    ***[Platzhalter: Erklären Sie, wie Daten hinzugefügt werden können]***
  </p>
  <div className="mt-6">
    <Button>Erste Daten hinzufügen</Button>
  </div>
</div>
```

### Keine Ergebnisse
```typescript
// Beispiel für leere Suchergebnisse
<div className="text-center py-8">
  <Search className="mx-auto h-8 w-8 text-gray-400" />
  <h3 className="mt-2 text-sm font-medium text-gray-900">
    Keine Ergebnisse gefunden
  </h3>
  <p className="mt-1 text-sm text-gray-500">
    Versuchen Sie andere Suchbegriffe oder erweitern Sie Ihre Suche.
  </p>
</div>
```

## Fehlertexte

### Validierungsfehler
```typescript
// Formular-Validierung
<FormError>
  ***[Platzhalter: Spezifische Fehlermeldung]***
</FormError>

// Beispiele
"Bitte geben Sie eine gültige E-Mail-Adresse ein"
"Das Passwort muss mindestens 8 Zeichen lang sein"
"Dieses Feld ist erforderlich"
```

### Systemfehler
```typescript
// API-Fehler
<div className="rounded-md bg-red-50 p-4">
  <div className="flex">
    <ExclamationTriangle className="h-5 w-5 text-red-400" />
    <div className="ml-3">
      <h3 className="text-sm font-medium text-red-800">
        Fehler beim Laden der Daten
      </h3>
      <div className="mt-2 text-sm text-red-700">
        <p>***[Platzhalter: Detaillierte Fehlermeldung]***</p>
      </div>
    </div>
  </div>
</div>
```

## Loading-Texte

### Standard-Loading-States
```typescript
// Einfache Loading-States
<div className="flex items-center space-x-2">
  <Loader2 className="h-4 w-4 animate-spin" />
  <span>Lade...</span>
</div>

// Spezifische Loading-States
<span>Lade Benutzerdaten...</span>
<span>Speichere Änderungen...</span>
<span>Verarbeite Anfrage...</span>
```

### Skeleton-Loading
```typescript
// Für komplexe Inhalte
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
</div>
```

## Erfolgsmeldungen

### Bestätigungen
```typescript
// Erfolgreiche Aktionen
<div className="rounded-md bg-green-50 p-4">
  <div className="flex">
    <CheckCircle className="h-5 w-5 text-green-400" />
    <div className="ml-3">
      <p className="text-sm font-medium text-green-800">
        ***[Platzhalter: Erfolgsmeldung]***
      </p>
    </div>
  </div>
</div>
```

### Beispiele für Erfolgsmeldungen
- "Einstellungen erfolgreich gespeichert"
- "Benutzer erfolgreich erstellt"
- "Daten erfolgreich exportiert"
- "Änderungen erfolgreich übernommen"

## Hilfe-Texte

### Formular-Hilfe
```typescript
// Hilfetext unter Input-Feldern
<div className="mt-1 text-sm text-gray-500">
  ***[Platzhalter: Hilfetext für das Eingabefeld]***
</div>

// Beispiele
"Verwenden Sie eine gültige E-Mail-Adresse"
"Mindestens 8 Zeichen, Groß- und Kleinbuchstaben"
"Wählen Sie eine Option aus der Liste"
```

### Tooltip-Inhalte
```typescript
// Für komplexe Funktionen
<Tooltip>
  <TooltipTrigger>Hilfe</TooltipTrigger>
  <TooltipContent>
    ***[Platzhalter: Detaillierte Erklärung der Funktion]***
  </TooltipContent>
</Tooltip>
```

## Platzhalter-Texte

### Input-Platzhalter
```typescript
// Beispiel-Platzhalter
<Input placeholder="***[Platzhalter: Beispiel-Eingabe]***" />

// Beispiele
placeholder="max.mustermann@firma.de"
placeholder="Passwort eingeben"
placeholder="Nach Namen oder E-Mail suchen"
```

### Standard-Platzhalter
- **E-Mail**: `beispiel@firma.de`
- **Name**: `Max Mustermann`
- **Telefon**: `+49 123 456789`
- **URL**: `https://www.firma.de`

## Navigation & Breadcrumbs

### Breadcrumb-Texte
```typescript
// Hierarchische Navigation
<Breadcrumb>
  <BreadcrumbItem>Dashboard</BreadcrumbItem>
  <BreadcrumbItem>Benutzer</BreadcrumbItem>
  <BreadcrumbItem>Max Mustermann</BreadcrumbItem>
</Breadcrumb>
```

### Menü-Texte
```typescript
// Hauptnavigation
<nav>
  <a href="/dashboard">Dashboard</a>
  <a href="/users">Benutzer</a>
  <a href="/settings">Einstellungen</a>
  <a href="/admin">Administration</a>
</nav>
```

## Status-Texte

### Badge-Texte
```typescript
// Status-Badges
<Badge variant="success">Aktiv</Badge>
<Badge variant="warning">Wartend</Badge>
<Badge variant="destructive">Fehler</Badge>
<Badge variant="secondary">Inaktiv</Badge>
```

### Status-Beschreibungen
- **Aktiv**: Benutzer ist aktiv und kann sich anmelden
- **Inaktiv**: Benutzer ist deaktiviert
- **Wartend**: Bestätigung ausstehend
- **Gesperrt**: Temporär gesperrt

## Best Practices

### Allgemeine Richtlinien
1. **Konsistenz**: Verwende die gleichen Begriffe überall
2. **Klarheit**: Jede Nachricht sollte eindeutig verständlich sein
3. **Aktion**: Benutzer sollten wissen, was als nächstes zu tun ist
4. **Länge**: Kurze, prägnante Texte bevorzugen
5. **Kontext**: Berücksichtige den aktuellen Kontext der Benutzer

### Übersetzungsrichtlinien
- Alle Texte auf Deutsch
- Technische Begriffe konsistent übersetzen
- Lokalisierung für andere Sprachen vorbereiten
- Platzhalter für dynamische Inhalte verwenden

### Content-Review
- Regelmäßige Überprüfung aller UI-Texte
- Konsistenz-Checks durchführen
- Benutzer-Feedback einholen
- A/B-Tests für wichtige Texte
