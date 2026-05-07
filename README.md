# Aspen Spas — Invoice Tracker

> Internal tool for managing post-service invoices, follow-ups, payment tracking, and collections at **Aspen Spas (St. Louis, MO)**.

Single-file HTML/JavaScript app deployed via **GitHub Pages**, with **Firebase Realtime Database** as backend and **cross-project Firestore reads** to integrate with the existing TECH-TICKETS app.

**Live URL:** https://aspenservices.github.io/invoice-tracker/
**Source:** `index.html` (≈300 KB, ~6,500 lines)
**Repo:** `aspenservices/invoice-tracker`

---

## 📋 Tabla de contenidos

1. [Características principales](#-características-principales)
2. [Stack y arquitectura](#-stack-y-arquitectura)
3. [Setup inicial](#-setup-inicial-solo-primera-vez)
4. [Workflow diario](#-workflow-diario)
5. [Anonymous Auth y seguridad](#-anonymous-auth-y-seguridad)
6. [Sistema de emails](#-sistema-de-emails)
7. [Calculadora de garantías](#-calculadora-de-garantías)
8. [Notificaciones](#-notificaciones)
9. [Despliegue](#-despliegue)
10. [Troubleshooting](#-troubleshooting)
11. [Equipo](#-equipo)

---

## 🎯 Características principales

### Vistas y filtros
- **8 tabs:** Today · All · Pending · To collect · Sent · Paid · Snoozed · Problems · Customers
- **5 KPI cards:** Pending to send, To collect, Pending CC/Collection, Sent this month, Collected this month
- **A/R aging report:** 0-7, 8-14, 15-30, +30 días — clickeable para filtrar
- **Auto-detección de "problemas":** clientes con 2+ historiales de CC declined / no response / disputas

### CRUD de facturas
- Form completo con: número, monto, cliente, email, fecha de servicio, técnico, descripción, modelo, serie, notas, PDF
- **Importación desde TICKETS database** — auto-completa teléfono, dirección, modelo
- **Parser de notas QB** — pega el bloque NOTES de QuickBooks y extrae modelo, dirección, serial, board, heater, topside

### Gestión de pagos
- 6 métodos de pago: Sin pagar · Cheque · Efectivo · Tarjeta · ACH · Otro
- 5 razones de pendiente: Falta CC · CC declinada · No responde · Pago parcial · En disputa
- **Snooze:** 3/7/14 días o fecha custom
- **Follow-ups automáticos** con fecha siguiente

### Búsqueda y exportación
- **Search global** (cliente, factura, email, serial, modelo)
- **Export CSV** para QuickBooks (formato Receive Payment)
- **Sparklines de cliente** (mini-gráficas de comportamiento de pago)

### Bilingüe ES/EN
- Toggle en el header (botón "ES" / "EN")
- ~140 traducciones cubriendo casi toda la UI

---

## 🛠 Stack y arquitectura

```
┌─────────────────────────────────────────────────────┐
│  index.html (single-file)                           │
│  ┌──────────────────────────────────────────────┐  │
│  │  Vanilla JS + inline CSS                      │  │
│  │  Firebase JS SDK 10.13.0 (modular)            │  │
│  │  - firebase-app                                │  │
│  │  - firebase-database (RTDB)                    │  │
│  │  - firebase-auth (Anonymous)                   │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
            ↓                              ↓
   ┌────────────────┐         ┌──────────────────────┐
   │  invoice-daily │         │  tech-tickets-a9485  │
   │  -f170e        │         │  (read-only cross-   │
   │  (RTDB primary)│         │   project Firestore) │
   │                │         │                      │
   │  /invoices     │         │  /tickets ← derive   │
   │  /customers    │         │   customers from     │
   │                │         │   here               │
   └────────────────┘         └──────────────────────┘
            ↓                              ↑
   ┌────────────────┐         ┌──────────────────────┐
   │  Anonymous Auth│         │  Anonymous Auth      │
   │  (silent)      │         │  (silent, separate   │
   │                │         │   Firebase app)      │
   └────────────────┘         └──────────────────────┘
```

### Datos persistentes

- **Firebase Realtime Database** (`invoice-daily-f170e`)
  - `/invoiceTracker/invoices/{id}` — facturas
  - `/invoiceTracker/customers/{id}` — clientes
- **Cache local en localStorage** (fallback si Firebase falla):
  - `aspenInvoices`, `aspenCustomers`, `aspenLang`, `aspenSettings`, `aspenNotifEnabled`

### Service Worker
- Archivo: `sw.js` (en raíz del repo)
- Registrado al activar notificaciones
- Permite que las notifs lleguen aunque la pestaña esté en background

---

## 🚀 Setup inicial (solo primera vez)

> **NOTA:** Todo el config técnico ya está hardcodeado en el código. Como usuaria final solo necesitas el **Setup B**.

### Setup A — Si forkeas el código para otro negocio

1. Clona el repo
2. Crea un proyecto Firebase nuevo
3. Habilita **Realtime Database** (modo locked) y **Authentication → Anonymous**
4. Reemplaza el bloque `FIREBASE_CONFIG` en `index.html`
5. Despliega en GitHub Pages

### Setup B — Aspen Spas (uso normal)

1. Abre https://aspenservices.github.io/invoice-tracker/
2. Click ⚙ Settings → llena solo:
   - 📞 Teléfono de Aspen Spas
   - 🌐 Sitio web (`aspenspas.com`)
   - 👤 Nombre del remitente (`Aspen Spas Service`)
   - 📞 **Email de Celia** (para alertas internas de cobros)
3. Click **Guardar y recargar**

> Los campos de Firebase y TICKETS están escondidos en "⚙ Configuración avanzada" porque ya están hardcodeados.

---

## 📝 Workflow diario

### A. Nueva factura

1. Click `+ New Invoice` (o `+ Nueva Factura`)
2. Llena el formulario; si el cliente ya existe, busca su nombre y la app autocompleta
3. **Opcional:** pega el bloque de notas de QuickBooks → click "⚡ Parsear y autollenar"
4. Adjunta el PDF (drag & drop o click el área)
5. Click **Guardar**
6. La factura aparece en la lista con badge `NOT SENT`

### B. Mandar email al cliente

1. En la lista de facturas, click el botón negro **Send**
2. Modal de preview → revisa subject y body
3. Click **Generar y descargar .eml**
4. Doble click al `.eml` descargado → abre Outlook/Mail.app
5. ⚠ **CLICK SEND EN OUTLOOK** ← este paso es el que efectivamente manda
6. La factura cambia de `NOT SENT` a `SENT`

### C. Marcar pago / razón de pendiente

1. Click en la factura → modal de detalle
2. Sección **"Estado de pago"**:
   - Si pagó: selecciona método (Check/Cash/CC/ACH/Other) → guarda
   - Si NO pagó: selecciona razón (Falta CC, CC declinada, No responde, etc.) → guarda
3. Si seleccionas `❌ CC declinada` o `📞 Falta CC en archivo`:
   - El sistema te ofrece **mandar alerta interna a Celia**
   - Confirma → descarga `.eml` con PDF adjunto → abre y manda

### D. Programar follow-up

1. En el detalle de factura → click **Snooze** (📅)
2. Selecciona 3/7/14 días o fecha custom
3. La factura se mueve a la pestaña **Snoozed**
4. Cuando llegue la fecha, te aparece en **Today** y te llega notif

### E. Importar cliente desde TICKETS

1. `+ Agregar cliente` (o edita uno existente)
2. En el campo "Importar desde TICKETS database" → escribe nombre o apellido
3. Aparece dropdown con resultados (nombre, teléfono, # de visitas)
4. Click **Import** → autocompleta teléfono, dirección, modelo
5. Click **Guardar**

---

## 🔐 Anonymous Auth y seguridad

### El modelo

Tanto el Invoice Tracker como TECH-TICKETS usan **Firebase Anonymous Auth** para autenticarse silenciosamente al cargar la app. El usuario no nota nada — abre el browser y todo funciona.

### Por qué importa

**Antes** (sin auth):
```
Reglas: allow read: if true;  ← Cualquiera con la API key podía leer
                                 nombres, teléfonos, direcciones
```

**Después** (con Anonymous Auth):
```
Reglas: allow read, write: if request.auth != null;
                                ← Solo apps que se autentiquen pueden leer
```

### Cómo lo implementé

```javascript
// Para invoice-daily-f170e (DB principal)
const app = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);
await signInAnonymously(auth);  // ← una sola línea

// Para tech-tickets-a9485 (cross-project Firestore reads)
const ticketsApp = initializeApp(ticketsConfig, 'tickets-auth');
const ticketsAuth = getAuth(ticketsApp);
await signInAnonymously(ticketsAuth);
const token = await ticketsAuth.currentUser.getIdToken();
fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
```

### Habilitar Anonymous Auth (una sola vez por proyecto)

1. **invoice-daily-f170e:** https://console.firebase.google.com/project/invoice-daily-f170e/authentication/providers
2. **tech-tickets-a9485:** https://console.firebase.google.com/project/tech-tickets-a9485/authentication/providers
3. En cada uno: Sign-in method → Anonymous → Enable → Save

### Reglas cerradas (después de verificar que Auth funciona)

**Firestore (`tech-tickets-a9485`):**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Realtime DB (`invoice-daily-f170e`):**
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

### Despliegue de reglas

```bash
# Firestore (TICKETS)
firebase deploy --only firestore:rules --project tech-tickets-a9485

# Realtime DB (Invoice Tracker)
firebase deploy --only database --project invoice-daily-f170e
```

---

## 📨 Sistema de emails

### Dos flujos distintos

| Flujo | Destinatario | Formato | PDF | Cómo se manda |
|-------|--------------|---------|-----|---------------|
| **Customer email** | Cliente externo | HTML bonito (3 stages) | ✅ Adjunto | `.eml` → Outlook → Send |
| **Internal alert** | Celia / Cobros | HTML bonito + tabla | ✅ Adjunto | `.eml` → Outlook → Send |

### ⚠ IMPORTANTE — Por qué los `.eml` a veces NO se mandan

El `.eml` es solo un **archivo con el contenido del email**. Para que se envíe necesitas:
1. Doble click al archivo
2. Que **Outlook** (no Apple Mail) sea el default
3. Outlook abre el email como **borrador editable**
4. Click **Send**

Si tu Mac abre `.eml` con Apple Mail, **solo se previsualiza** — no se manda.

### Configurar Outlook como default para `.eml`

1. En Finder, busca cualquier `.eml`
2. Click derecho → **Get Info**
3. "Open with:" → escoge **Microsoft Outlook**
4. Click **"Change All..."**
5. Confirma

### Verificar que SÍ se mandó un email

```
1. Apple Mail / Outlook → carpeta SENT (Enviados)
2. Busca por nombre del cliente o # de factura
3. Si está ahí → se mandó ✅
4. Si no → solo se abrió el .eml, no llegó ❌
```

### El "From" del email

El `.eml` tiene `From: service1@aspenspas.com` pero **el remitente real depende de la cuenta configurada en Mail/Outlook**. Para mandar desde `service1@aspenspas.com`:

1. Mail.app → Settings → Accounts → "+" → Other Mail Account
2. Configura la cuenta `service1@aspenspas.com` con servidor SMTP
3. Settings → Composing → "Send new messages from" → selecciona la cuenta

---

## 🛡 Calculadora de garantías

### Reglas implementadas

**VS Series:**
- Año 1: Mano de obra GRATIS
- Años 1-3: Partes GRATIS
- Año 4-5: Trip charge ($95) + 50% MSRP

**GS Series:**
- Año 1: Mano de obra GRATIS
- Años 2-5: Trip charge ($95)
- Años 1-3: Partes GRATIS
- Años 4-5: Partes 50% MSRP

**ES Series:**
- Años 1-5: 100% GRATIS

**Items con garantía limitada (1 año):** estéreo, lifts, cubiertas, ozono, salt cell, lights, waterfall, pump seals
**Items con garantía limitada (3 meses):** pillows
**Cutoff duro:** 2019 — spas anteriores no tienen garantía

### Cómo usar

1. En el form de factura → click **🛡 Garantía**
2. Llena: modelo, año, item afectado
3. La calculadora te dice:
   - 🟢 COVERED (todo gratis)
   - 🟡 PARTIAL (parcial — explicación)
   - 🔴 OUT_OF_WARRANTY (cobrar todo)
4. Click **Aplicar nota a factura** → la nota se pega en el campo notes

---

## 🔔 Notificaciones

### Click en el botón 🔔 → abre el panel de salud

| Sección | Qué muestra |
|---------|-------------|
| Estado maestro | ON/OFF con un toggle |
| Health checks | ✅/❌ browser support, permisos, Service Worker |
| Próximos pendientes | 7 días siguientes con prioridades |
| Botones | Test ahora · Resumen del día · Re-registrar SW |
| Disclaimer | Honesto sobre cuándo NO funcionan |

### Cuándo funcionan / cuándo no

✅ **SÍ funcionan cuando:**
- La pestaña está abierta (cualquier pestaña, aunque sea background)
- El Service Worker está registrado
- El navegador no está completamente cerrado

❌ **NO funcionan cuando:**
- Cerraste TODAS las pestañas del browser
- Apagaste la Mac
- El usuario rechazó permisos

**Recomendación:** deja una pestaña pinneada con el tracker abierta todo el día.

---

## 🚀 Despliegue

### Workflow normal

```bash
cd ~/Documents/invoice-tracker
cp ~/Downloads/index.html .   # si te llegó un nuevo index
git add index.html
git commit -m "Descripción del cambio"
git push origin main
# Espera 30 segundos → GitHub Pages publica
# Recarga la app: Cmd+Shift+R
```

### Si hay merge conflicts

```bash
git pull origin main --no-rebase --strategy-option=ours
git push
```

### Deployar reglas de Firebase

```bash
# Solo cuando hay cambios en database.rules.json o firestore.rules
firebase deploy --only database --project invoice-daily-f170e
firebase deploy --only firestore:rules --project tech-tickets-a9485
```

---

## 🐛 Troubleshooting

### "Synced · Local" en lugar de "Synced · Firebase"

→ Firebase no se conectó. Posibles razones:
- Anonymous Auth no habilitado → ve a Firebase Console → Authentication → habilita Anonymous
- Reglas demasiado restrictivas → temporalmente afloja a `if true` para test
- API key incorrecta en `index.html`

### "TICKETS DB bloquea lectura (HTTP 403)"

→ Las reglas de Firestore en `tech-tickets-a9485` están bloqueando.
**Fix temporal:** ve a Firestore Console → Rules → cambia a `allow read: if true` → Publish.
**Fix permanente:** asegúrate de que Anonymous Auth esté habilitado en `tech-tickets-a9485` Y que las reglas usen `request.auth != null`.

### "Customers HTTP 403" en consola al editar cliente

→ Mismo problema arriba. La app no pudo autenticarse al cross-project Firestore.

### `.eml` se abre pero no se manda

→ Tu Mac abre `.eml` con Apple Mail (que solo previsualiza, no manda).
**Fix:** click derecho a un `.eml` → Get Info → Open with → **Microsoft Outlook** → Change All.

### Email muestra `From: service1.aspenspas@icloud.com` en lugar de `@aspenspas.com`

→ Mail.app está mandando desde tu cuenta default (iCloud). Configura `service1@aspenspas.com` como cuenta en Mail y ponla como default.

### Service Worker no se registra

→ Tu navegador no soporta o blockea SWs. Solución:
1. Click el botón 🔔 → ve el "Health check"
2. Si SW dice ❌ → click **Re-registrar SW**
3. Si sigue fallando, las notifs solo te llegarán con la pestaña activa (sin background)

### "Notificaciones activas pero no llegan"

→ El sistema operativo está bloqueando las notifs del navegador.
- macOS: System Settings → Notifications → busca Chrome/Safari → Allow

### Push rechazado al hacer git push

→ Alguien más empujó cambios. Trae los cambios primero:
```bash
git pull origin main --no-rebase --strategy-option=ours
git push
```

### "MERGE_HEAD exists" o vim abrió un editor raro

→ Hay un merge sin terminar. Aborta:
```bash
git merge --abort
rm -f .git/.MERGE_MSG.swp
```
Y vuelve a intentar.

---

## 👥 Equipo

| Persona | Rol | Email | Acceso |
|---------|-----|-------|--------|
| **Tom y Sam** | Co-owners | (privado) | Admins de Firebase |
| **Alberto** | Service Manager | service1@aspenspas.com | Admin de TECH-TICKETS, edita el código |
| **Nela** | Service Administrator / Project Manager | nela.berling@gmail.com | Edita el código, gestiona payroll dashboard |
| **Celia** | Customer Service / Delivery / Cobros | (configurar en Settings) | Recibe alertas internas de CC declinada |
| **Jeremy** | Service Technician | — | Trabajo en campo |
| **Robert** | Service Technician | — | Trabajo en campo |
| **Pedro** | Service Technician | — | Trabajo en campo |
| **Jarred** | Service Technician | — | Trabajo en campo |
| **Fernando** | Service Technician | — | Trabajo en campo |
| **Fabian** | Service Technician | — | Trabajo en campo |
| **Gabriel** | Chemicals | — | Ruta química |
| **Dan** | Warehouse | — | Almacén |
| **SV** | Warehouse | — | Almacén |

---

## 📁 Archivos del repo

```
invoice-tracker/
├── index.html              ← La app completa (single-file)
├── sw.js                   ← Service Worker para notificaciones
├── firebase.json           ← Config para deploy de reglas
├── .firebaserc             ← Apunta a invoice-daily-f170e
├── database.rules.json     ← Reglas de Realtime DB
├── firestore.rules         ← Reglas de Firestore (para tech-tickets)
├── README.md               ← Este archivo
└── (assets/icons opcionales)
```

---

## 🆘 Si algo se rompe completamente

**Plan de recuperación:**
1. Los datos están en Firebase Realtime DB → no se pierden por bugs en frontend
2. Hay backup automático en localStorage (últimos datos vistos)
3. Si la app no carga, abre la URL con `?nocache=1` para forzar refresh
4. Si Firebase está caído (raro), la app cae a modo localStorage automáticamente
5. Si cambiaste algo y se rompió, `git revert HEAD && git push` para regresar

**Contacto de emergencia:** Si nada de lo anterior funciona, escribe a Anthropic (Claude) con la descripción del error y screenshots — te ayudamos a debuggear.

---

## 📜 Historial de cambios mayores

- **2026-05-07** — Anonymous Auth, PDF en alertas internas, paginación de TICKETS, Settings limpiado
- **2026-05-06** — Service Worker, panel de salud de notifs, calculadora de garantías, email de cobros, bilingüe completo
- **2026-05-05** — Cross-database con TECH-TICKETS, Customer detail modal, parser de QB notes
- **2026-05-04** — Aging report, problemas auto-detect, snooze, email stages
- **2026-05-03** — Setup inicial, Firebase RTDB, GitHub Pages

---

**Hecho con ☕ por el equipo de Aspen Spas + Claude (Anthropic)**
*"Para no olvidar ninguna factura, ningún follow-up, ningún cliente."*
