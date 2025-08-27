# Formulare & States

## Validierung

### Client-seitige Validierung
```typescript
// Real-time Validierung
const [errors, setErrors] = useState<Record<string, string>>({});

const validateField = (name: string, value: string) => {
  const newErrors = { ...errors };
  
  switch (name) {
    case 'email':
      if (!value) {
        newErrors.email = 'E-Mail-Adresse ist erforderlich';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
      } else {
        delete newErrors.email;
      }
      break;
      
    case 'password':
      if (!value) {
        newErrors.password = 'Passwort ist erforderlich';
      } else if (value.length < 8) {
        newErrors.password = 'Passwort muss mindestens 8 Zeichen lang sein';
      } else {
        delete newErrors.password;
      }
      break;
  }
  
  setErrors(newErrors);
};
```

### Server-seitige Validierung
```typescript
// Backend-Validierung mit Pydantic
from pydantic import BaseModel, EmailStr, validator

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    display_name: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Passwort muss mindestens 8 Zeichen lang sein')
        return v
```

## Inline-Errors

### Error-Display
```typescript
// Fehler unter dem Input-Feld anzeigen
<div className="space-y-2">
  <Input
    id="email"
    type="email"
    className={errors.email ? "border-red-500" : ""}
    aria-invalid={!!errors.email}
    aria-describedby={errors.email ? "email-error" : undefined}
  />
  {errors.email && (
    <div id="email-error" className="text-sm text-red-600">
      {errors.email}
    </div>
  )}
</div>
```

### Error-Styling
```typescript
// Input mit Fehler-State
<Input
  className={cn(
    "transition-colors duration-200",
    errors.email && "border-red-500 focus:border-red-500 focus:ring-red-500"
  )}
/>
```

## Help-Text

### Statischer Help-Text
```typescript
// Hilfetext unter dem Input
<div className="space-y-2">
  <Input id="password" type="password" />
  <p className="text-sm text-gray-500">
    Das Passwort muss mindestens 8 Zeichen lang sein und Groß- und Kleinbuchstaben enthalten.
  </p>
</div>
```

### Dynamischer Help-Text
```typescript
// Help-Text der sich ändert
const [helpText, setHelpText] = useState("");

useEffect(() => {
  if (password.length === 0) {
    setHelpText("Geben Sie Ihr Passwort ein");
  } else if (password.length < 8) {
    setHelpText("Mindestens 8 Zeichen erforderlich");
  } else if (!/[A-Z]/.test(password)) {
    setHelpText("Mindestens ein Großbuchstabe erforderlich");
  } else if (!/[a-z]/.test(password)) {
    setHelpText("Mindestens ein Kleinbuchstabe erforderlich");
  } else {
    setHelpText("Passwort erfüllt alle Anforderungen ✓");
  }
}, [password]);
```

## Input-Masken

### Telefon-Maske
```typescript
// Deutsche Telefonnummer-Formatierung
const formatPhoneNumber = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 6) {
    return `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
  } else if (numbers.length <= 9) {
    return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6)}`;
  } else {
    return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6, 9)} ${numbers.slice(9, 11)}`;
  }
};
```

### IBAN-Maske
```typescript
// IBAN-Formatierung
const formatIBAN = (value: string) => {
  const clean = value.replace(/\s/g, '').toUpperCase();
  const groups = clean.match(/.{1,4}/g) || [];
  return groups.join(' ');
};
```

## Defaults

### Standard-Werte
```typescript
// Standard-Werte für Formulare
const defaultValues = {
  language: 'de',
  timezone: 'Europe/Berlin',
  notifications_enabled: true,
  two_factor_enabled: false,
  session_timeout: 30,
  password_expiry: 90
};

// In React Hook Form
const form = useForm({
  defaultValues,
  resolver: zodResolver(schema)
});
```

### Benutzer-spezifische Defaults
```typescript
// Defaults basierend auf Benutzer-Einstellungen
useEffect(() => {
  if (userSettings) {
    form.reset({
      ...defaultValues,
      ...userSettings
    });
  }
}, [userSettings, form]);
```

## Autosave-Policy

### Autosave-Implementierung
```typescript
// Automatisches Speichern nach Änderungen
const [hasChanges, setHasChanges] = useState(false);
const [lastSaved, setLastSaved] = useState<Date | null>(null);

useEffect(() => {
  if (hasChanges) {
    const timer = setTimeout(() => {
      saveForm();
    }, 2000); // 2 Sekunden Verzögerung
    
    return () => clearTimeout(timer);
  }
}, [formData, hasChanges]);

const saveForm = async () => {
  try {
    await updateSettings(formData);
    setHasChanges(false);
    setLastSaved(new Date());
  } catch (error) {
    console.error('Autosave fehlgeschlagen:', error);
  }
};
```

### Autosave-Indikatoren
```typescript
// Status-Anzeige für Autosave
<div className="flex items-center space-x-2 text-sm text-gray-500">
  {hasChanges ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Speichere...</span>
    </>
  ) : lastSaved ? (
    <>
      <CheckCircle className="h-4 w-4 text-green-500" />
      <span>Zuletzt gespeichert: {formatTime(lastSaved)}</span>
    </>
  ) : null}
</div>
```

## Form-States

### Loading-States
```typescript
// Verschiedene Loading-Zustände
const [isLoading, setIsLoading] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);

// Button mit Loading-State
<Button disabled={isSubmitting}>
  {isSubmitting ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Speichere...
    </>
  ) : (
    'Speichern'
  )}
</Button>
```

### Success-States
```typescript
// Erfolgs-Feedback
const [showSuccess, setShowSuccess] = useState(false);

const handleSubmit = async (data: FormData) => {
  try {
    await submitForm(data);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  } catch (error) {
    // Fehlerbehandlung
  }
};

// Erfolgs-Nachricht
{showSuccess && (
  <div className="rounded-md bg-green-50 p-4">
    <div className="flex">
      <CheckCircle className="h-5 w-5 text-green-400" />
      <div className="ml-3">
        <p className="text-sm font-medium text-green-800">
          Formular erfolgreich gespeichert!
        </p>
      </div>
    </div>
  </div>
)}
```

## Form-Validierung

### Zod-Schema
```typescript
// Validierungsschema mit Zod
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string()
    .min(8, 'Passwort muss mindestens 8 Zeichen lang sein')
    .regex(/[A-Z]/, 'Mindestens ein Großbuchstabe erforderlich')
    .regex(/[a-z]/, 'Mindestens ein Kleinbuchstabe erforderlich')
    .regex(/[0-9]/, 'Mindestens eine Zahl erforderlich'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwörter stimmen nicht überein",
  path: ["confirmPassword"]
});
```

### React Hook Form Integration
```typescript
// Integration mit React Hook Form
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodResolver(userSchema),
  defaultValues: {
    email: '',
    password: '',
    confirmPassword: ''
  }
});

const onSubmit = (data: z.infer<typeof userSchema>) => {
  console.log(data);
};
```

## Best Practices

### Allgemeine Richtlinien
1. **Real-time Validierung**: Validiere Felder während der Eingabe
2. **Klare Fehlermeldungen**: Spezifische, hilfreiche Fehlermeldungen
3. **Progressive Disclosure**: Zeige nur relevante Felder
4. **Konsistente Styling**: Einheitliches Design für alle Formulare
5. **Accessibility**: ARIA-Labels und Fehler-Deskriptoren

### Performance
- **Debounced Autosave**: Verzögerte Autosave-Funktionalität
- **Lazy Validation**: Validiere nur sichtbare Felder
- **Optimistic Updates**: Sofortige UI-Updates bei Optimismus

### User Experience
- **Inline-Validation**: Sofortiges Feedback bei Fehlern
- **Progressive Enhancement**: Grundfunktionalität ohne JavaScript
- **Clear Success States**: Deutliche Bestätigung bei Erfolg
