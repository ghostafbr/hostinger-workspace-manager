# Domain Layer

Esta capa contiene la lógica de negocio pura sin dependencias externas.

## Estructura

### `/entities`
Entidades del dominio con lógica de negocio

### `/interfaces`
Interfaces y contratos (repository patterns, use cases)

### `/models`
Modelos de datos y DTOs

### `/enums`
Enumeraciones del dominio

## Principios

1. **Framework Independent**: Sin dependencias de Angular/Firebase
2. **Immutability**: Datos inmutables cuando sea posible
3. **Type Safety**: Tipado estricto en TypeScript
4. **Business Logic**: Solo lógica de negocio pura
5. **No Side Effects**: Funciones puras sin efectos secundarios
