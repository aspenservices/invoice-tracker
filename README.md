# 📋 Aspen Spas — Invoice Tracker

> **Repo:** `aspenservices/invoice-tracker`
> **Live:** [aspenservices.github.io/invoice-tracker](https://aspenservices.github.io/invoice-tracker/)
> **Stack:** HTML + Vanilla JS + Firebase Realtime Database (single-file)
> **Idiomas / Languages:** 🇪🇸 Español + 🇺🇸 English (toggle en el header)

---

## 📑 Índice / Table of contents

- [📋 Aspen Spas — Invoice Tracker](#-aspen-spas--invoice-tracker)
  - [📑 Índice / Table of contents](#-índice--table-of-contents)
  - [🚀 Quick Start](#-quick-start)
  - [🔥 Firebase Configurations](#-firebase-configurations)
    - [Invoice Tracker (este proyecto / this project)](#invoice-tracker-este-proyecto--this-project)
    - [TECH-TICKETS database (read-only cross-fetch)](#tech-tickets-database-read-only-cross-fetch)
    - [Firestore Security Rules — TECH-TICKETS](#firestore-security-rules--tech-tickets)
    - [Firebase Realtime Database Rules — Invoice Tracker](#firebase-realtime-database-rules--invoice-tracker)
  - [🗄 Estructura de datos / Data Structure](#-estructura-de-datos--data-structure)
    - [Invoice schema](#invoice-schema)
    - [Customer schema](#customer-schema)
  - [✨ Features](#-features)
  - [📖 Cómo usar / How to use](#-cómo-usar--how-to-use)
    - [1. Crear factura nueva / Create new invoice](#1-crear-factura-nueva--create-new-invoice)
    - [2. Mandar email / Send email](#2-mandar-email--send-email)
    - [3. Marcar pagada / Mark as paid](#3-marcar-pagada--mark-as-paid)
    - [4. Vista Hoy / Today view](#4-vista-hoy--today-view)
    - [5. Aging Report](#5-aging-report)
    - [6. Cuentas problemáticas / Problem accounts](#6-cuentas-problemáticas--problem-accounts)
    - [7. Snooze](#7-snooze)
    - [8. Exportar a QuickBooks / Export to QuickBooks](#8-exportar-a-quickbooks--export-to-quickbooks)
    - [9. Notificaciones push / Push notifications](#9-notificaciones-push--push-notifications)
    - [10. Cambiar idioma / Change language](#10-cambiar-idioma--change-language)
  - [👥 Equipo / Team](#-equipo--team)
  - [🛠 Deployment](#-deployment)
  - [🐛 Troubleshooting](#-troubleshooting)
  - [🗺 Roadmap](#-roadmap)
  - [📞 Contactos / Contacts](#-contactos--contacts)

---

## 🚀 Quick Start

**ES** — Descarga el `index.html`, súbelo al repo `aspenservices/invoice-tracker`, GitHub Pages lo sirve automáticamente. Las credenciales de Firebase ya están hardcodeadas, no necesitas configurar nada en Settings.

**EN** — Download `index.html`, push it to the `aspenservices/invoice-tracker` repo, GitHub Pages serves it automatically. Firebase credentials are already hardcoded — no Settings configuration needed.

```bash
# Clone & deploy
git clone https://github.com/aspenservices/invoice-tracker.git
cd invoice-tracker
# Reemplaza el index.html con la nueva versión
cp ~/Downloads/index.html .
git add index.html
git commit -m "Update invoice tracker"
git push
# Live in ~30 seconds at https://aspenservices.github.io/invoice-tracker/
```

---

## 🔥 Firebase Configurations

### Invoice Tracker (este proyecto / this project)

```js
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAG6k-VLWPfYF2xq989j8PUUCySL8MIyLU",
  authDomain: "invoice-daily-f170e.firebaseapp.com",
  databaseURL: "https://invoice-daily-f170e-default-rtdb.firebaseio.com",
  projectId: "invoice-daily-f170e",
  storageBucket: "invoice-daily-f170e.firebasestorage.app",
  messagingSenderId: "660377797408",
  appId: "1:660377797408:web:f90ffe0c821ce09ff20d45",
  measurementId: "G-WVPTSMFS72"
};
```

- **Firebase Console:** https://console.firebase.google.com/project/invoice-daily-f170e
- **Tipo:** Realtime Database
- **Plan:** Spark (free tier)
- **Paths:**
  - `/invoiceTracker/invoices/{id}` — todas las facturas
  - `/invoiceTracker/customers/{id}` — base de clientes locales

### TECH-TICKETS database (read-only cross-fetch)

```js
const DEFAULT_TICKETS_DB = {
  apiKey: "AIzaSyDsmFIRqRrvTqRgzWKLFjA9Sdnro7nz8zc",
  projectId: "tech-tickets-a9485",
  ticketsCollection: "tickets",
  customersCollection: "customers"
};
```

- **Firebase Console:** https://console.firebase.google.com/project/tech-tickets-a9485
- **Tipo:** Firestore
- **Apps que usan este DB:**
  - Mobile PWA (técnicos en campo)
  - TECH-TICKETS web admin (`aspenservices.github.io/TECH-TICKETS/`)
- **Cómo se usa desde Invoice Tracker:**
  - Cross-Firebase fetch via REST API (sin autenticación)
  - Importa cliente con un click → autoextrae nombre, dirección, teléfono, modelo del spa, serial number, board #, heater #, topside #
  - Cache de 60 segundos por sesión

### Firestore Security Rules — TECH-TICKETS

**ES** — Necesarias para que Invoice Tracker pueda leer (sin autenticación):
**EN** — Required so Invoice Tracker can read (without authentication):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;       // Lectura pública (Invoice Tracker)
      allow write: if request.auth != null;  // Escritura solo autenticados
    }
  }
}
```

### Firebase Realtime Database Rules — Invoice Tracker

> 🚨 **CRÍTICO PARA SINCRONIZACIÓN ENTRE EQUIPOS** — Si las reglas no permiten escritura, cada Mac guarda en su propio localStorage y Alberto/Nela no se ven los datos entre sí.

**Pasos para configurar / Setup steps:**

1. Ve a [Firebase Console → Realtime Database](https://console.firebase.google.com/project/invoice-daily-f170e/database/invoice-daily-f170e-default-rtdb/rules)
2. Click la pestaña **"Reglas" / "Rules"**
3. Reemplaza el contenido con esto y click **"Publicar" / "Publish"**:

```json
{
  "rules": {
    "invoiceTracker": {
      ".read": true,
      ".write": true
    }
  }
}
```

> ⚠ **Nota de seguridad:** estas reglas son permisivas (cualquiera con la URL puede leer/escribir). Si quieres más seguridad, considera Firebase Auth con Google sign-in restringido a `@aspenspas.com`.

**Cómo verificar que funciona / How to verify:**

- En la app, el header muestra el indicador de conexión (puntito):
  - 🟢 **Verde + "Sincronizado · Firebase"** = todo OK, datos van a la nube
  - 🟡 **Amarillo + "Modo local"** = NO sincroniza, configura las reglas
  - 🔴 **Rojo + "Error"** = hay problema de red o config
- Si está en amarillo, sale un banner naranja prominente en la parte superior del dashboard pidiendo configurar las reglas.

**Test de sincronización entre Macs:**

1. Mac A: crea una factura nueva
2. Mac B: recarga la página (`Cmd+R`)
3. La factura debería aparecer en Mac B en menos de 5 segundos

Si NO aparece → las reglas no están configuradas. Repite los pasos arriba.

---

## 🗄 Estructura de datos / Data Structure

### Invoice schema

```typescript
{
  id: string,                    // Firebase auto-generated
  invoiceNumber: string,         // "271231" (de QuickBooks)
  amount: number,                // 849.76
  customerName: string,          // "Bellinger, Vince & Cindy"
  greetingName: string,          // "Vince" (para "Hi Vince,")
  customerEmail: string,         // "cbellinger@charter.net"
  serviceDate: string,           // "2026-05-03"
  technician: string,            // "Jeremy" | "Robert" | "Pedro" | "Jarred" | "Fernando"
  serviceDescription: string,    // "Service - Flush Platinum"
  spaModel: string,              // "2014 El Dorado ES"
  serialNumber: string,          // "13542"
  notes: string,                 // Notas internas (no se mandan al cliente)

  // Status & timestamps
  status: "pending" | "sent" | "followup" | "paid",
  createdAt: number,             // Date.now()
  sentAt: number | null,
  paidAt: number | null,

  // Payment tracking
  paymentReason: "cc_needed" | "cc_declined" | "no_response" | "partial" | "disputed" | null,
  paymentMethod: "check" | "cash" | "credit_card" | "ach" | "zelle" | "venmo" | "square" | "other" | null,
  paymentRef: string,            // Check #, last-4 of CC, transaction ID
  paymentNote: string,           // Free text
  ccRequested: boolean,          // Si ya se le pidió la tarjeta
  ccRequestedAt: number | null,
  nextFollowUp: string,          // "2026-05-13" (YYYY-MM-DD)

  // Snooze
  snoozedUntil: string | null,   // "2026-05-09" (YYYY-MM-DD)

  // Email tracking
  lastEmailStage: 1 | 2 | 3,     // 1=primer envío, 2=recordatorio, 3=aviso final

  // Audit trail
  history: [
    { ts: number, action: "created" | "sent" | "paid" | "snoozed" | "unsnoozed", stage?: number, until?: string }
  ],

  // Optional PDF attachment (base64-encoded)
  pdfBase64: string | null,
  pdfFilename: string | null,
  pdfSize: number | null
}
```

### Customer schema

```typescript
{
  id: string,
  name: string,                  // "Braver, Todd"
  greetingName: string,          // "Todd"
  email: string,                 // "tbraver@wustl.edu"
  phone: string,                 // "314-497-7910"
  address: string,               // "4213 Maryland Ave, st. louis 63105"
  spaModel: string,              // "2010 Pinnacle VS"
  serialNumber: string,          // "7009"
  cabinet: string,               // "Chaulkstone"
  boardNumber: string,
  heaterNumber: string,
  topsideNumber: string,
  qbNotesRaw: string,            // Texto crudo pegado de QuickBooks
  notes: string                  // Notas internas
}
```

---

## ✨ Features

| 🇪🇸 Feature | 🇺🇸 Description |
|------------|----------------|
| 5 stat cards en vivo | Pending invoices, to collect, CC pending, sent this month, paid this month |
| 9 pestañas con filtros | Today, All, Pending, To collect, Sent, Paid, Snoozed, Problems, Customers |
| Banner de alertas inteligente | Notifica: viejas sin enviar, follow-ups que tocan hoy, +7d sin pago, CC sin pedir, +30d críticas, cuentas problemáticas |
| Aging Report | 4 bandas (0-7 / 8-14 / 15-30 / +30 días) con $ totales clickeables |
| Vista "Hoy" | Dashboard del día con 4 secciones agrupadas |
| Cuentas problemáticas | Auto-detecta clientes con 2+ issues de pago históricos |
| Email por etapas | 3 plantillas (cordial / recordatorio / past due), cambia color del header |
| Snooze 3/7/14 días | Oculta facturas temporalmente; búsqueda las encuentra siempre |
| Notificaciones push | Browser notification cuando hay follow-ups vencidos (1× por día) |
| Import desde TECH-TICKETS | Click → extrae nombre, address, phone, model, serial, board, heater, topside |
| Parser QB Notes | Pega bloque NOTES de QB y autoextrae todos los campos |
| PDF upload | Adjunta PDF de la factura, se incluye en el .eml al mandar |
| .eml file generation | Genera email con PDF adjunto en formato Outlook |
| QuickBooks CSV export | Exporta pagos en formato Receive Payment de QB |
| Bilingual UI | Botón EN/ES en header, todo el UI cambia al instante |
| Cross-Firebase tickets | Lee TECH-TICKETS DB sin auth (REST API) |
| Smart customer matcher | Match por exact, starts-with, tokens, last name, comma-flipped |
| PWA-ready | Funciona offline en localStorage, sincroniza cuando hay red |

---

## 📖 Cómo usar / How to use

### 1. Crear factura nueva / Create new invoice

**ES:**
1. Click `+ Nueva Factura` (esquina superior derecha)
2. Llena los **4 campos requeridos** (al inicio del modal):
   - Número de factura (ej. `271176`)
   - Monto (ej. `849.76`)
   - Cliente (autocompleta desde TICKETS o lista local)
   - Email del cliente
3. Opcional: técnico, descripción, modelo, serial, notas internas
4. Opcional: arrastra el PDF de QuickBooks al área superior — autoextrae los datos
5. Click `Guardar`

**EN:**
1. Click `+ New Invoice` (top right)
2. Fill in the **4 required fields** (at the top of the modal):
   - Invoice number (e.g. `271176`)
   - Amount (e.g. `849.76`)
   - Customer (auto-completes from TICKETS or local list)
   - Customer email
3. Optional: technician, description, model, serial, internal notes
4. Optional: drag the QuickBooks PDF to the upload zone — auto-extracts data
5. Click `Save`

### 2. Mandar email / Send email

**ES:**
1. En la card de factura `Pendiente` → click `Mandar`
2. Aparece el modal de envío con:
   - Selector de tono (1️⃣ Primer envío / 2️⃣ Recordatorio / 3️⃣ Aviso final) — **se sugiere automáticamente**
   - Preview del email
3. Click `📎 Generar email con PDF adjunto` → descarga `.eml`
4. Doble click al `.eml` → abre Outlook con el email completo (PDF ya adjunto)
5. Revisa y le das `Send` en Outlook
6. Vuelve al tracker → click `Marcar como enviada`

**EN:** same flow but in English.

> 💡 **Tip:** la primera vez que abres un `.eml`, si se abre en Apple Mail en lugar de Outlook: Finder → click derecho al `.eml` → `Get Info` → `Open with` → Microsoft Outlook → `Change All`.

### 3. Marcar pagada / Mark as paid

Botón verde `✓ Pagada` en la card de cualquier factura enviada. Confirma. Luego entra al modal `💳` (estado de cobro) y registra el método (cheque, tarjeta, efectivo, etc.) — esto es lo que se exporta a QuickBooks después.

### 4. Vista Hoy / Today view

Pestaña `🌅 Hoy` con 4 secciones agrupadas:
- 📤 Por enviar (To send)
- 📅 Follow-ups que tocan hoy (Follow-ups due today)
- ⏰ Sin cobrar +14 días (Unpaid +14 days)
- 📞 CC sin pedir (CC not requested)

> Si todo está al día, sale "¡Todo al día! 🎉" / "All caught up! 🎉"

### 5. Aging Report

Card visual debajo del banner de alertas. Muestra cuánto dinero tienes atorado en cada banda de tiempo:
- **0-7 días** (verde)
- **8-14 días** (amarillo)
- **15-30 días** (naranja)
- **+30 días** (rojo)

Click en cualquier banda → filtra la lista a esas facturas. **Crítico para reportar a Tom y Sam semanalmente.**

### 6. Cuentas problemáticas / Problem accounts

Pestaña `🚨 Problemas`. Auto-detecta clientes con:
- 2+ facturas con CC declined
- 2+ facturas sin respuesta
- Disputa
- +30 días sin pagar

Útil para saber a quién pedirle CC al frente la próxima vez.

### 7. Snooze

Botón `💤` en cualquier factura no-pagada → menú con:
- 💤 3 días
- 💤 7 días
- 💤 14 días
- 📅 Hasta fecha…

**Mientras está snoozeada:**
- ❌ No aparece en pestañas Todas/Pendientes/Por cobrar/Hoy
- ✅ Sí aparece en pestaña `💤 Snoozeadas`
- ✅ Sí aparece cuando buscas por nombre o número (siempre se puede encontrar)

Vence automáticamente en la fecha. Botón `⏰` quita el snooze antes de tiempo.

### 8. Exportar a QuickBooks / Export to QuickBooks

Click `📤 Exportar a QB` (al lado del Export CSV). Genera CSV con formato compatible con QuickBooks Receive Payment:

```
Customer | Invoice # | Amount | Date | Payment Method | Reference No | Memo
```

**En QuickBooks Desktop:**
1. File → Utilities → Import → Excel Files
2. Advanced Import → Receive Payments
3. Map columns (la primera vez)
4. Import

**Solo exporta facturas que tengan `paymentMethod` registrado.** Si solo marcaste como Pagada sin método, no las incluye — eso es bueno porque te obliga a llenar el dato antes de exportar.

### 9. Notificaciones push / Push notifications

Click `🔕` en el header → pide permiso al navegador → activa.

Te alerta (1× por día calendario) cuando hay:
- Follow-ups pendientes hoy
- Facturas creadas +24h sin enviar
- CC sin pedir

> ⚠ Solo funciona si el navegador está abierto. No es un servicio remoto.

### 10. Cambiar idioma / Change language

Click el botón **`EN`** o **`ES`** en el header (al lado del 🔕). Cambia todo el UI al instante. La preferencia se guarda en localStorage.

---

## 👥 Equipo / Team

| Persona | Rol | Email |
|---------|-----|-------|
| Alberto | Service Manager | service1@aspenspas.com (557-233-7119) |
| Tom & Sam | Co-owners | — |
| Nela | Service Administrator | — |
| Celia | Customer Service / Delivery | — |
| Jeremy, Robert, Pedro, Jarred, Fernando | Service Technicians | — |
| Gabriel | Chemical Maintenance | — |
| Dan | Warehouse | — |

---

## 🛠 Deployment

```bash
# Pasos típicos / typical workflow
cd ~/Documents/invoice-tracker  # o donde tengas clonado el repo
cp ~/Downloads/index.html .     # reemplaza con nueva versión
git add index.html
git commit -m "Updated tracker — feature X"
git push origin main

# GitHub Pages despliega automáticamente
# Live en ~30 segundos en https://aspenservices.github.io/invoice-tracker/
```

> 💡 Si haces cambios desde la app de GitHub web (subiendo el archivo via drag-and-drop), también funciona — pero por terminal es más limpio.

---

## 🐛 Troubleshooting

### 🚨 "No puedo guardar la factura" / "Can't save invoice"

**Causa raíz:** Antes el `await` que escribe a Firebase no tenía try/catch — si Firebase rechazaba el write (por reglas, sin permisos, sin red), el error se tragaba silenciosamente y el botón "Guardar" parecía no hacer nada.

**Fix aplicado:**
- ✅ Try/catch alrededor del save
- ✅ Mensaje de error visible **dentro del modal** (no se puede pasar por alto)
- ✅ Auto-fallback a localStorage si Firebase falla — los datos NO se pierden
- ✅ Detección específica de `PERMISSION_DENIED` con instrucciones para fixear

**Si todavía no guarda, revisa:**
1. ¿Llenaste los 4 campos con `*` rojo? (Número de factura, Monto, Cliente, Email — al inicio del modal)
2. ¿El email tiene formato válido (con `@` y dominio)?
3. ¿Aparece un mensaje rojo dentro del modal junto al botón Cancelar? Léelo — te dice qué falló.
4. Abre la consola del navegador (F12 → Console) — los errores reales aparecen ahí.

### 🚨 "Datos no sincronizan entre Mac de Alberto y Mac de Nela" / "Data not syncing between Macs"

**Causa raíz:** Las reglas de Firebase Realtime Database por default **no permiten escritura** sin autenticación. Cuando una Mac no puede escribir, automáticamente guardaba en localStorage propio sin avisar.

**Fix aplicado:**
- ✅ Banner naranja prominente en el dashboard cuando estás en "Modo local"
- ✅ El indicador de conexión (puntito en el header) ahora es muy visible: verde = nube, amarillo = local, rojo = error
- ✅ Botón "Open Settings" / "Recargar" en el banner para acción rápida

**Para que sincronice correctamente:**
1. Configura las reglas de Firebase Realtime Database (ver [sección anterior](#firebase-realtime-database-rules--invoice-tracker))
2. Recarga la app — el indicador debe ponerse 🟢 verde
3. Haz un test: crea factura en Mac A → recarga Mac B → debe aparecer

### 🚨 "Notificaciones no llegan" / "Notifications don't arrive"

**Causa raíz:** Antes solo se disparaban via `new Notification()` directo, que requiere pestaña en foco y no tiene Service Worker.

**Fix aplicado:**
- ✅ Service Worker registrado automáticamente (inline, sin archivo separado)
- ✅ Notificaciones llegan incluso con la pestaña backgrounded
- ✅ Al activar las notificaciones, dispara una notif de TEST inmediato — sabes al instante si funcionan
- ✅ Al cargar la app, verifica TODOS los pendientes (follow-ups + sin enviar +24h + CC sin pedir + facturas críticas +30d) en una sola notif resumen
- ✅ Re-checa cada 15 min (antes era 30)
- ✅ Click en la notif te lleva al dashboard

**Para activar notificaciones:**
1. Click el botón 🔕 en el header
2. Permite cuando Chrome pida permiso
3. Llega una notificación de prueba al instante — si la ves, funciona ✅
4. Si no llega:
   - Revisa Chrome → ⚙️ Settings → Privacy → Site Settings → Notifications
   - Confirma que `aspenservices.github.io` esté en "Allow"
   - macOS: System Settings → Notifications → Chrome → "Allow notifications"

**Limitación honesta:** las notificaciones SOLO disparan cuando abras la app. No son notificaciones push reales (que requerirían Firebase Cloud Messaging y backend dedicado). Pero al abrir el dashboard cada mañana, te llega un resumen de todo lo pendiente del día.

### Otros problemas

| 🇪🇸 Síntoma | 🇺🇸 Symptom | Solución / Solution |
|-----------|-----------|---------------------|
| Banner amarillo "Modo local" | "Local mode" yellow banner | Configura las reglas de Firebase RTDB (ver arriba) y recarga |
| Import desde TICKETS solo trae el nombre | Import only fetches name | Reglas de Firestore bloquean lectura — ver [Firestore Security Rules](#firestore-security-rules--tech-tickets) |
| Email se abre en Apple Mail en lugar de Outlook | Email opens in Apple Mail | Finder → click derecho al `.eml` → Get Info → Open with → Microsoft Outlook → Change All |
| Botón EN/ES no cambia el modal de Settings | Lang button doesn't translate Settings | Settings modal todavía no traducido — pendiente en roadmap |
| El PDF no se autoextrae | PDF extraction fails | Algunos PDFs tienen formatos custom — escribe los datos a mano y reporta el PDF para mejorar el parser |

---

## 🗺 Roadmap

### ✅ Done
- [x] Invoice CRUD con Firebase
- [x] PDF upload + OCR para autoextraer datos
- [x] Email .eml con PDF adjunto
- [x] Cross-Firebase fetch a TECH-TICKETS
- [x] QB Notes parser
- [x] Customer database con autocomplete
- [x] Payment status tracking (CC declined, no response, etc.)
- [x] Aging report
- [x] Today view
- [x] Problem accounts detection
- [x] Email stage templates (1/2/3)
- [x] Snooze (3/7/14 días + custom)
- [x] Browser push notifications
- [x] QuickBooks CSV export
- [x] Bilingual UI (ES/EN)
- [x] Hardcoded Firebase config

### 🚧 To do (próximas mejoras)
- [ ] Stripe / Square payment links en email
- [ ] Modo oscuro (Nela lo pidió)
- [ ] Sync con Google Calendar (follow-ups como eventos)
- [ ] Métricas por técnico (cuánto facturó / cobró cada uno)
- [ ] Foto del cheque al marcar pagada (audit trail)
- [ ] WhatsApp link además del email
- [ ] Customer modal totalmente bilingüe
- [ ] Settings modal totalmente bilingüe
- [ ] PWA service worker (true offline)
- [ ] Firebase Auth con Google sign-in (restringir a @aspenspas.com)

---

## 📞 Contactos / Contacts

- **Service Manager:** Alberto — service1@aspenspas.com — 557-233-7119
- **Owners:** Tom & Sam (Aspen Spas, St. Louis MO)
- **Repo issues:** https://github.com/aspenservices/invoice-tracker/issues

---

> 🌿 Aspen Spas — St. Louis, Missouri
> _Built with Claude · Single-file HTML · Firebase Realtime DB_
