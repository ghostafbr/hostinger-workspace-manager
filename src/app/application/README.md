# Application Layer

Esta capa contiene la lógica de negocio y orquestación.

## Estructura

### `/services`
Servicios de aplicación que orquestan casos de uso

### `/guards`
Route guards para protección de rutas

### `/interceptors`
HTTP interceptors (autenticación, errores, logging)

### `/validators`
Validators personalizados para formularios

## Principios

1. **Single Responsibility**: Un servicio = un propósito
2. **Dependency Injection**: Usar DI de Angular
3. **Observables**: RxJS para operaciones asíncronas
4. **Error Handling**: Manejo robusto de errores
5. **Injectable**: Todos los servicios deben ser injectable
