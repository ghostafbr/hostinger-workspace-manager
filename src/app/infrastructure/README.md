# Infrastructure Layer

Esta capa contiene implementaciones técnicas y adaptadores externos.

## Estructura

### `/adapters`
Adaptadores para servicios externos (Firebase, API HTTP)

### `/repositories`
Implementaciones de repositorios (Firestore, LocalStorage)

### `/utils`
Utilidades y helpers técnicos

### `/constants`
Constantes de configuración

## Principios

1. **Abstraction**: Implementar interfaces del domain
2. **Configuration**: Manejo de configuración y environment
3. **External Services**: Integración con servicios externos
4. **Technical Details**: Detalles técnicos de implementación
5. **Testability**: Código fácil de testear con mocks
