# Cloud Functions - Configuración sin Emulador

## 📋 Resumen

La aplicación está configurada para usar **Cloud Functions en producción** tanto en desarrollo local como en producción. No se usa el emulador de Functions.

## 🏗️ Arquitectura

```
┌─────────────────────┐
│  Angular Client     │
│  localhost:4200     │
│  (Development)      │
└──────────┬──────────┘
           │
           │ HTTPS Callable
           ↓
┌─────────────────────────────────────────────────────┐
│  Firebase Cloud Function (Producción)               │
│  us-central1-syncWorkspace                          │
│  https://us-central1-hostinger-workspace-           │
│  manager.cloudfunctions.net/syncWorkspace           │
└──────────┬──────────────────────────────────────────┘
           │
           ├──→ Hostinger API (dominios/suscripciones)
           │
           └──→ Firestore (producción)
```

## ⚙️ Configuración Actual

### 1. Cloud Function (`functions/src/syncWorkspace.ts`)

```typescript
const callableOptions: CallableOptions = {
  invoker: 'public',           // Permite llamadas sin autenticación de Cloud IAM
  region: 'us-central1',       // Región óptima
  cors: [
    'http://localhost:4200',   // Desarrollo local ✅
    'https://hostinger-workspace-manager.web.app',
    'https://hostinger-workspace-manager.firebaseapp.com',
  ],
};
```

**Puntos clave**:
- `invoker: 'public'`: Permite llamadas desde el cliente sin IAM permissions
- `cors`: Lista explícita de orígenes permitidos (incluye localhost para desarrollo)
- La función **valida autenticación de Firebase** internamente con `request.auth`

### 2. Cliente Angular (`firebase.adapter.ts`)

```typescript
static getFunctions(): Functions {
  if (!this.functionsInstance) {
    this.functionsInstance = getFunctions(this.getApp(), 'us-central1');
    console.log('✅ Firebase Functions initialized for region: us-central1');
  }
  return this.functionsInstance;
}
```

**Cambios aplicados**:
- ❌ **Removido**: `connectFunctionsEmulator()` 
- ✅ **Usa siempre**: Endpoint de producción en `us-central1`

## 🚀 Flujo de Desarrollo

### **Modificar Cloud Function**

1. Editar código en `functions/src/syncWorkspace.ts`
2. Compilar TypeScript:
   ```bash
   cd functions
   npm run build
   ```
3. Desplegar a producción:
   ```bash
   firebase deploy --only functions
   ```
4. Esperar ~1-2 minutos para que el deploy complete
5. La aplicación Angular automáticamente usará la nueva versión

### **NO se requiere**:
- ❌ Iniciar emulador de Functions
- ❌ Reiniciar servidor Angular
- ❌ Configuraciones adicionales de CORS

## 🔒 Seguridad

### Autenticación en Cloud Function

```typescript
export const syncWorkspace = onCall(callableOptions, async (request) => {
  // Validar que el usuario esté autenticado
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  // request.auth contiene: uid, email, token
  const userId = request.auth.uid;
  // ...resto del código
});
```

**Capas de seguridad**:
1. **Firebase Auth Token**: El cliente debe estar autenticado
2. **Validación en función**: `request.auth` debe existir
3. **CORS**: Solo orígenes permitidos pueden llamar la función
4. **Firestore Rules**: Reglas adicionales en base de datos

### CORS Configurado

La función acepta requests de:
- `http://localhost:4200` (desarrollo local)
- `https://hostinger-workspace-manager.web.app` (hosting Firebase)
- `https://hostinger-workspace-manager.firebaseapp.com` (hosting alternativo)

Para agregar más dominios, editar el array `cors` en `callableOptions`.

## 📊 Costos (Plan Gratuito Firebase)

### Cuota Gratuita (Spark Plan)
- **Invocaciones**: 2M/mes
- **GB-segundos**: 400K/mes
- **CPU-segundos**: 200K/mes
- **Salida de red**: 5GB/mes

### Estimación de Uso
- **1 sincronización**: ~3-5 segundos de ejecución
- **Llamadas API Hostinger**: 2 requests/sync (dominios + suscripciones)
- **Escrituras Firestore**: Variable (1 sync_run + N dominios + M suscripciones)

**Ejemplo**: 
- 100 workspaces
- 1 sync/día cada uno
- ~3K invocaciones/mes
- Dentro del plan gratuito ✅

## 🔧 Troubleshooting

### Error: "CORS policy blocked"

**Causa**: El origen no está en la lista `cors` de `callableOptions`

**Solución**:
1. Agregar origen en `functions/src/syncWorkspace.ts`:
   ```typescript
   cors: [
     'http://localhost:4200',
     'http://localhost:8080',  // Nuevo origen
     // ...
   ],
   ```
2. Redesplegar: `firebase deploy --only functions`

### Error: "Unauthenticated"

**Causa**: Usuario no está loggeado o token expiró

**Solución**:
- Verificar que `FirebaseAuth.currentUser` no sea null
- Re-autenticar si es necesario

### Error: "Function took too long to respond"

**Causa**: Timeout (60s por defecto en Cloud Functions v2)

**Solución**:
1. Agregar `timeoutSeconds` en `callableOptions`:
   ```typescript
   const callableOptions: CallableOptions = {
     invoker: 'public',
     region: 'us-central1',
     timeoutSeconds: 120,  // 2 minutos
     cors: [...],
   };
   ```
2. Redesplegar función

## 📝 Comandos Útiles

```bash
# Compilar funciones
cd functions && npm run build

# Desplegar solo funciones
firebase deploy --only functions

# Desplegar función específica
firebase deploy --only functions:syncWorkspace

# Ver logs en tiempo real
firebase functions:log

# Ver logs de función específica
firebase functions:log --only syncWorkspace

# Ver estado de deploys
firebase deploy:status
```

## 🌐 URLs de Producción

**Cloud Function Endpoint**:
```
https://us-central1-hostinger-workspace-manager.cloudfunctions.net/syncWorkspace
```

**Firebase Console Functions**:
```
https://console.firebase.google.com/project/hostinger-workspace-manager/functions
```

**Logs en Cloud Console**:
```
https://console.cloud.google.com/logs/query?project=hostinger-workspace-manager
```

## 🔄 Migración desde Emulador

Si anteriormente usabas emulador, los cambios aplicados fueron:

### ✅ Removido
- Import de `connectFunctionsEmulator` en `firebase.adapter.ts`
- Bloque condicional `if (!environment.production)` con `connectFunctionsEmulator()`

### ✅ Agregado
- Configuración `cors` en `callableOptions` de la Cloud Function
- Documentación en este archivo

### ✅ Sin cambios
- Lógica de negocio en `syncWorkspace.ts`
- Servicios Angular (`WorkspaceService`)
- Interfaces y tipos

## 📌 Notas Importantes

1. **Cold Starts**: Primera invocación tras inactividad puede tardar ~3-5s (normal en Cloud Functions v2)
2. **Cache**: Firebase SDK cachea la instancia de Functions, no se reconecta en cada llamada
3. **HTTPS Callable**: Usa POST automáticamente, no necesitas configurar método HTTP
4. **Serialización**: Firebase maneja JSON automáticamente, no uses FormData o Blob
5. **Errores**: Usa `HttpsError` en función, se propagan correctamente al cliente

## 🆘 Soporte

Para problemas con Cloud Functions:
- **Documentación oficial**: https://firebase.google.com/docs/functions
- **API Reference**: https://firebase.google.com/docs/reference/functions
- **Stack Overflow**: Tag `google-cloud-functions` + `firebase`

---

**Última actualización**: 2026-01-08  
**Versión**: Cloud Functions v2  
**Región**: us-central1
