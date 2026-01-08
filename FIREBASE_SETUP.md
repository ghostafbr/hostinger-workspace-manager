# Configuración de Firebase - Guía Paso a Paso

Esta guía te ayudará a configurar Firebase para el proyecto Hostinger Workspace Manager.

## 📋 Requisitos Previos

- Cuenta de Google/Gmail
- Node.js 20+ instalado
- Firebase CLI instalado globalmente: `npm install -g firebase-tools`

## 🔥 Paso 1: Crear Proyecto en Firebase Console

### 1.1 Acceder a Firebase Console
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Add project" o "Agregar proyecto"

### 1.2 Configurar el Proyecto
1. **Nombre del proyecto**: `hostinger-workspace-manager` (o el que prefieras)
2. **Google Analytics**: Puedes habilitarlo (opcional pero recomendado)
3. Espera a que se cree el proyecto

## 🔐 Paso 2: Configurar Firebase Authentication

### 2.1 Habilitar Authentication
1. En el menú lateral, ve a **Build > Authentication**
2. Haz clic en "Get started"

### 2.2 Configurar Email/Password
1. Ve a la pestaña **Sign-in method**
2. Haz clic en **Email/Password**
3. **Habilita** la opción "Email/Password"
4. **NO habilites** "Email link (passwordless sign-in)"
5. Guarda los cambios

### 2.3 Crear tu Usuario (IMPORTANTE)
1. Ve a la pestaña **Users**
2. Haz clic en "Add user"
3. Ingresa tu email y contraseña
4. **COPIA EL UID** que se genera - lo necesitarás para las Security Rules
5. Este será el ÚNICO usuario permitido en la aplicación

## 🗄️ Paso 3: Configurar Firestore Database

### 3.1 Crear Base de Datos
1. En el menú lateral, ve a **Build > Firestore Database**
2. Haz clic en "Create database"
3. Selecciona modo **Production** (las rules las configuraremos después)
4. Elige la ubicación más cercana a ti (ej: `us-central1` o `southamerica-east1`)
5. Espera a que se cree la base de datos

### 3.2 Crear Colecciones Iniciales
Por ahora no es necesario crear colecciones manualmente, se crearán automáticamente al insertar el primer documento.

Las colecciones que usarás son:
- `workspaces`
- `domains`
- `subscriptions`
- `sync_runs`
- `alert_rules`
- `alert_logs`
- `audit_logs`

## ⚙️ Paso 4: Configurar Cloud Functions

### 4.1 Actualizar Plan (si es necesario)
Cloud Functions requiere el plan **Blaze (Pay as you go)**:
1. Ve a **Project Settings** (ícono de engranaje)
2. En la pestaña **Usage and billing**
3. Haz clic en "Modify plan"
4. Selecciona **Blaze plan**
5. Configura un límite de gasto si lo deseas (para evitar sorpresas)

### 4.2 Habilitar Cloud Functions
1. En el menú lateral, ve a **Build > Functions**
2. Haz clic en "Get started" (si aparece)
3. Las funciones se desplegarán cuando ejecutes `firebase deploy --only functions`

## 🌐 Paso 5: Configurar Firebase Hosting (Opcional)

1. En el menú lateral, ve a **Build > Hosting**
2. Haz clic en "Get started"
3. Sigue los pasos (el proyecto ya está configurado en `firebase.json`)

## 🔧 Paso 6: Obtener Configuración de Firebase

### 6.1 Obtener Firebase Config
1. Ve a **Project Settings** (ícono de engranaje junto a Project Overview)
2. Baja hasta **Your apps**
3. Haz clic en el ícono **</>** (Web)
4. Registra tu app:
   - App nickname: `hostinger-workspace-manager-web`
   - **NO marques** Firebase Hosting por ahora
5. Copia el objeto `firebaseConfig`

### 6.2 Configurar Variables de Entorno
1. Abre `src/environments/environment.development.ts`
2. Reemplaza los valores del objeto `firebase` con los de tu configuración:

```typescript
firebase: {
  apiKey: "TU_API_KEY",
  authDomain: "tu-project-id.firebaseapp.com",
  projectId: "tu-project-id",
  storageBucket: "tu-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456",
  measurementId: "G-XXXXXXXXXX" // Opcional
}
```

3. Haz lo mismo en `src/environments/environment.ts` (producción)

## 🔒 Paso 7: Configurar Security Rules

### 7.1 Actualizar UID en Security Rules
1. Abre el archivo `firestore.rules`
2. Busca la línea:
   ```javascript
   return request.auth != null && request.auth.uid == 'YOUR_UID_HERE';
   ```
3. Reemplaza `'YOUR_UID_HERE'` con el UID de tu usuario (copiado en el Paso 2.3)

### 7.2 Desplegar Security Rules
```bash
firebase deploy --only firestore:rules
```

## 🚀 Paso 8: Inicializar Firebase CLI

### 8.1 Login
```bash
firebase login
```

### 8.2 Inicializar Proyecto
```bash
firebase init
```

Cuando pregunte:
- **Which Firebase features?**: 
  - ✅ Firestore
  - ✅ Functions
  - ✅ Hosting
  - ✅ Emulators
- **Use an existing project**: Selecciona tu proyecto
- **Firestore Rules**: `firestore.rules` (ya existe)
- **Firestore indexes**: `firestore.indexes.json` (ya existe)
- **Functions**: 
  - Language: **TypeScript**
  - ESLint: **Yes**
  - Install dependencies: **Yes**
- **Hosting**:
  - Public directory: `dist/hostinger-workspace-manager`
  - Single-page app: **Yes**
  - GitHub deploys: **No**
- **Emulators**: Selecciona todos (Auth, Functions, Firestore, Hosting)

## 🧪 Paso 9: Probar con Emulators (Opcional)

### 9.1 Instalar Dependencias de Functions
```bash
cd functions
npm install
cd ..
```

### 9.2 Iniciar Emulators
```bash
firebase emulators:start
```

Accede a:
- **Emulator UI**: http://localhost:4000
- **App**: http://localhost:5000
- **Firestore**: http://localhost:8080
- **Auth**: http://localhost:9099

## ✅ Paso 10: Verificar Configuración

### 10.1 Compilar el Proyecto
```bash
npm run build
```

Debe compilar sin errores.

### 10.2 Ejecutar la App
```bash
npm start
```

Abre http://localhost:4200 y verifica en la consola del navegador:
```
✅ Firebase initialized successfully
```

## 📝 Paso 11: Desplegar (Cuando estés listo)

### 11.1 Build de Producción
```bash
npm run build
```

### 11.2 Deploy Functions
```bash
firebase deploy --only functions
```

### 11.3 Deploy Hosting
```bash
firebase deploy --only hosting
```

### 11.4 Deploy Todo
```bash
firebase deploy
```

## 🔑 Notas de Seguridad Importantes

⚠️ **NUNCA subas a GitHub**:
- Archivos de configuración con credenciales reales
- El archivo `.firebaserc` (ya está en `.gitignore`)
- Los archivos `environment.ts` y `environment.development.ts` con datos reales

✅ **SÍ puedes subir**:
- `firebase.json`
- `firestore.rules`
- `firestore.indexes.json`
- Archivos de ejemplo con placeholders

## 📚 Recursos Adicionales

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Cloud Functions](https://firebase.google.com/docs/functions)

## ❓ Troubleshooting

### Error: "Firebase not initialized"
- Asegúrate de haber copiado correctamente la configuración en los archivos de environment
- Verifica que `FirebaseAdapter.initialize()` se ejecuta en `app.config.ts`

### Error: "Permission denied" en Firestore
- Verifica que hayas actualizado el UID en `firestore.rules`
- Verifica que hayas desplegado las rules: `firebase deploy --only firestore:rules`
- Verifica que estés autenticado con el usuario correcto

### Cloud Functions no funcionan
- Verifica que estés en el plan Blaze
- Verifica que hayas instalado las dependencias en `/functions`
- Ejecuta `firebase deploy --only functions` para desplegarlas

## ✨ Próximos Pasos

Una vez completada esta configuración, puedes continuar con:
- **Issue #9**: Implementar autenticación (Login)
- **Issue #10**: CRUD de Workspaces
- **Issue #6**: Gestión de tokens cifrados
