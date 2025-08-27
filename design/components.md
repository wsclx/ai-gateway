# UI-Komponenten-Kanon

## Pflicht-Bibliotheken

### Core Libraries
- **shadcn/ui** - Primäre Komponenten-Bibliothek
- **Radix UI** - Headless UI-Primitive (über shadcn/ui)
- **Lucide React** - Icon-Bibliothek
- **Tailwind CSS** - Utility-First CSS-Framework

### Erlaubte Varianten

#### Buttons
- `default` - Primärer Button
- `secondary` - Sekundärer Button
- `outline` - Outline-Button
- `ghost` - Ghost-Button
- `destructive` - Destruktiver Button
- `link` - Link-Button

#### Cards
- `default` - Standard-Card
- `outline` - Outline-Card
- `ghost` - Ghost-Card

#### Inputs
- `default` - Standard-Input
- `error` - Fehler-Input
- `disabled` - Deaktivierter Input

## Props-Policy

### Erlaubte Props
- Alle Standard HTML-Attribute
- shadcn/ui Standard-Props
- Custom Props nur mit TypeScript-Interface

### Verbotene Props
- Inline-Styles
- Hardcodierte Farben
- Direkte CSS-Klassen

## Barrierefreiheit-Notizen

### Pflicht-Attribute
- `aria-label` für alle interaktiven Elemente
- `role` für komplexe UI-Patterns
- `tabindex` für Fokus-Management

### Keyboard-Navigation
- Alle interaktiven Elemente müssen per Tab erreichbar sein
- Enter/Space für Buttons
- Arrow-Keys für Dropdowns/Selects

### Screen Reader
- Semantische HTML-Struktur
- ARIA-Live-Regions für dynamische Inhalte
- Alt-Text für alle Bilder

## Komponenten-Hierarchie

### Layout-Komponenten
```
Layout
├── Header
├── Sidebar
├── Main
└── Footer
```

### Content-Komponenten
```
Content
├── PageHeader
├── ContentArea
└── PageFooter
```

### Form-Komponenten
```
Form
├── FormField
├── FormLabel
├── FormInput
├── FormError
└── FormHelp
```

## Import-Pfade

### UI-Komponenten
```typescript
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
```

### Layout-Komponenten
```typescript
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
```

### Icons
```typescript
import { Settings, User, Home } from "lucide-react"
```

## Custom-Komponenten

### Erlaubte Custom-Komponenten
- Wrapper um shadcn/ui-Komponenten
- Layout-spezifische Komponenten
- Business-Logic-Komponenten

### Verbotene Custom-Komponenten
- Duplikate von shadcn/ui-Komponenten
- Komponenten ohne TypeScript-Interface
- Komponenten ohne Accessibility-Attribute
