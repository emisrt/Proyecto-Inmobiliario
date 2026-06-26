# Enfoque del proyecto Locative

## Objetivo actual

Locative es un sistema web interno de gestión inmobiliaria para una inmobiliaria específica. Su objetivo es centralizar la administración de propiedades, contratos, pagos, solicitudes de arreglo, profesionales externos y publicación pública de inmuebles disponibles.

## Cambio respecto al enfoque SaaS anterior

En etapas iniciales el sistema podía interpretarse como una plataforma SaaS para múltiples inmobiliarias. Para el enfoque académico actual se descarta esa lectura: Locative representa el sistema de una única inmobiliaria, con usuarios vinculados a su operación interna y a sus propiedades administradas.

No se implementan planes, suscripciones, alta libre de inmobiliarias ni separación multi-agencia.

## Actores del sistema

- `agente_inmobiliario`: usuario interno de la inmobiliaria. Gestiona propiedades, contratos, pagos, arreglos y postulaciones.
- `propietario`: dueño de una o más propiedades administradas por la inmobiliaria.
- `inquilino`: persona asociada a un contrato de alquiler gestionado por la inmobiliaria.
- `profesional`: proveedor externo habilitado para postularse y trabajar en arreglos publicados.
- `visitante`: usuario no autenticado que puede visualizar propiedades publicadas en el portal.

## Funcionalidades mantenidas

- Portal público de propiedades de la inmobiliaria.
- Autenticación con Supabase Auth.
- Panel interno de inmobiliaria.
- Gestión de propiedades.
- Asignación de inquilinos y contratos.
- Visualización de pagos y contratos según rol.
- Solicitudes de arreglo desde inquilino o inmobiliaria.
- Publicación de arreglos para profesionales.
- Postulaciones de profesionales.
- Aceptación o rechazo de postulaciones.
- Control de acceso por roles y RLS.

## Funcionalidades eliminadas o pasadas a futuro

- Multi-agencia o múltiples inmobiliarias.
- Planes comerciales o suscripciones.
- Registro abierto de nuevas inmobiliarias.
- Gestión de cuentas empresariales independientes.
- Separación por `agency_id`, salvo que se agregue en una etapa futura por requerimiento explícito.

## Justificación académica

El nuevo enfoque reduce el alcance conceptual y permite presentar el sistema como una solución concreta para una organización específica. Esto facilita explicar casos de uso, permisos, entidades y reglas de negocio sin introducir complejidad adicional de multi-tenancy.

La decisión mantiene las funcionalidades centrales del dominio inmobiliario, pero las contextualiza dentro de una única inmobiliaria, lo cual resulta más adecuado para un prototipo funcional académico.
