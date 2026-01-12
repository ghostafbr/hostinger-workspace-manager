# 🔐 Configuración de Variables de Entorno para Deployment

## Problema Actual
El sitio desplegado muestra error de autenticación porque falta la configuración de GitHub Secrets.

```
Error: auth/api-key-not-valid.-please-pass-a-valid-api-key.
```

## ✅ Solución: Configurar GitHub Secrets

### 1. Ir a Settings del Repositorio
```
https://github.com/ghostafbr/hostinger-workspace-manager/settings/secrets/actions
```

### 2. Agregar los siguientes Secrets (Click "New repository secret")

**Valores de Firebase (copiar desde `src/environments/environment.ts`):**

| Secret Name | Value |
|------------|-------|
| `FIREBASE_API_KEY` | `AIzaSyBAtCWvxDHyYXA_xh4f3x7D7Rl82OQsxqA` |
| `FIREBASE_AUTH_DOMAIN` | `hostinger-workspace-manager.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | `hostinger-workspace-manager` |
| `FIREBASE_STORAGE_BUCKET` | `hostinger-workspace-manager.firebasestorage.app` |
| `FIREBASE_MESSAGING_SENDER_ID` | `503361832560` |
| `FIREBASE_APP_ID` | `1:503361832560:web:49801ef3604d20649316b5` |
| `FIREBASE_MEASUREMENT_ID` | `G-962EJYLVCD` |
| `ENCRYPTION_KEY` | `hostinger-workspace-encryption-key-2026-secure-32chars` |
| `PRODUCTION` | `true` |
| `APP_VERSION` | `1.0.0` |
| `HOSTINGER_API_URL` | `https://api.hostinger.com/v1` |

### 3. Pasos para Agregar cada Secret

1. Click en **"New repository secret"**
2. Pegar el **Name** (ej: `FIREBASE_API_KEY`)
3. Pegar el **Value** (ej: `AIzaSyBAtCWvxDHyYXA_xh4f3x7D7Rl82OQsxqA`)
4. Click **"Add secret"**
5. Repetir para todos los secrets

### 4. Re-deploy Automático

Una vez agregados los secrets:

```bash
# Hacer un commit vacío para triggear el deploy
git commit --allow-empty -m "chore: trigger redeploy with secrets"
git push origin main
```

O simplemente ir a **Actions** → **Deploy to Hostinger** → **Run workflow** (botón manual).

---

## 🔍 Verificación Post-Deploy

1. Ir al sitio desplegado
2. Intentar hacer login
3. No debe aparecer el error de API key

---

## 📋 Checklist

- [ ] Agregar `FIREBASE_API_KEY`
- [ ] Agregar `FIREBASE_AUTH_DOMAIN`
- [ ] Agregar `FIREBASE_PROJECT_ID`
- [ ] Agregar `FIREBASE_STORAGE_BUCKET`
- [ ] Agregar `FIREBASE_MESSAGING_SENDER_ID`
- [ ] Agregar `FIREBASE_APP_ID`
- [ ] Agregar `FIREBASE_MEASUREMENT_ID`
- [ ] Agregar `ENCRYPTION_KEY`
- [ ] Agregar `PRODUCTION`
- [ ] Agregar `APP_VERSION`
- [ ] Agregar `HOSTINGER_API_URL`
- [ ] Trigger re-deploy (commit vacío o manual)
- [ ] Verificar login funciona

---

## ⚠️ Notas de Seguridad

- ✅ Los secrets están encriptados en GitHub
- ✅ No se exponen en logs de GitHub Actions
- ✅ Solo los colaboradores con permisos pueden verlos
- ❌ **NUNCA** commitear estos valores directamente en el código

---

## 🔗 Links Útiles

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Firebase Console](https://console.firebase.google.com/project/hostinger-workspace-manager/settings/general)
- [GitHub Actions](https://github.com/ghostafbr/hostinger-workspace-manager/actions)
