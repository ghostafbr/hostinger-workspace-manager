# Presentation Layer

Esta capa contiene todos los componentes visuales y lógica de UI.

## Estructura

### `/components`
Componentes organizados siguiendo Atomic Design:

- **`/atoms`**: Componentes básicos e indivisibles (botones, inputs, badges)
- **`/molecules`**: Combinación de atoms (form-field, search-bar)
- **`/organisms`**: Componentes complejos (tablas, formularios, cards)

### `/pages`
Páginas completas de la aplicación (containers)

### `/layouts`
Layouts reutilizables (main-layout, auth-layout)

## Principios

1. **Solo PrimeNG**: Usar exclusivamente componentes de PrimeNG
2. **Standalone**: Todos los componentes deben ser standalone
3. **Signals**: Usar signals para state management local
4. **Smart/Dumb**: Pages = Smart, Components = Dumb
5. **OnPush**: Change detection strategy OnPush por defecto
