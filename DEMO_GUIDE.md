# Guía de demostración — Locative

## Enfoque del proyecto

Locative es un prototipo funcional desarrollado para Ingeniería de Software. El sistema se presenta como una solución interna para una inmobiliaria concreta, no como una plataforma SaaS global.

El objetivo es centralizar la gestión diaria de una inmobiliaria: propiedades, contratos, pagos, solicitudes de arreglo, profesionales externos y publicaciones visibles para visitantes. El portal público funciona como vidriera de propiedades disponibles, mientras que los paneles internos permiten operar según el rol autenticado.

## Tecnologías

- ReactJS
- Supabase Auth
- Supabase PostgreSQL
- Row Level Security
- Vercel
- Imágenes mediante URL externa en esta etapa. Supabase Storage queda previsto para carga de imágenes más adelante.

## Usuarios de prueba

No incluir credenciales reales en este archivo. Completar estos datos con usuarios demo creados en Supabase Auth antes de la defensa.

| Rol | Email | Contraseña demo | Qué permite mostrar |
| --- | --- | --- | --- |
| agente_inmobiliario | agente.demo@locative.test | Demo123456 | Panel interno, propiedades, contratos, pagos, arreglos y postulaciones. |
| propietario | propietario.demo@locative.test | Demo123456 | Consulta de propiedades administradas, contratos, pagos y arreglos asociados. |
| inquilino | inquilino.demo@locative.test | Demo123456 | Contrato activo, pagos y creación de solicitudes de arreglo. |
| profesional | profesional.demo@locative.test | Demo123456 | Perfil profesional, arreglos disponibles y postulación a trabajos. |

## Flujo recomendado de demo

### Paso 1 — Portal público

1. Entrar al portal público.
2. Buscar una propiedad por ciudad, barrio o dirección.
3. Filtrar por `Todos`, `Alquiler` o `Venta`.
4. Abrir el detalle de una propiedad desde la card.
5. Mostrar que el visitante navega sin iniciar sesión.

### Paso 2 — Agente inmobiliario

1. Iniciar sesión como `agente_inmobiliario`.
2. Ver el dashboard principal de la inmobiliaria.
3. Crear una propiedad.
4. Editar una propiedad existente.
5. Asignar propietario o inquilino si aplica.
6. Revisar contratos asociados.
7. Revisar pagos.
8. Revisar solicitudes de arreglo.

### Paso 3 — Inquilino

1. Iniciar sesión como `inquilino`.
2. Ver el contrato activo.
3. Ver pagos asociados.
4. Crear una solicitud de arreglo.

### Paso 4 — Inmobiliaria administra arreglo

1. Iniciar sesión nuevamente como `agente_inmobiliario`.
2. Ver la solicitud creada por el inquilino.
3. Revisar detalle, prioridad y propiedad asociada.
4. Publicar la solicitud para profesionales.

### Paso 5 — Profesional

1. Iniciar sesión como `profesional`.
2. Completar o revisar el perfil profesional.
3. Ver arreglos disponibles.
4. Abrir un arreglo publicado.
5. Postularse al trabajo con mensaje y presupuesto.

### Paso 6 — Inmobiliaria acepta postulación

1. Iniciar sesión como `agente_inmobiliario`.
2. Ver postulaciones recibidas para el arreglo.
3. Aceptar una postulación.
4. Verificar que el arreglo pasa a estado `en_proceso`.

### Paso 7 — Propietario

1. Iniciar sesión como `propietario`.
2. Ver propiedades administradas por la inmobiliaria.
3. Ver contratos asociados.
4. Ver pagos asociados.
5. Ver arreglos vinculados a sus propiedades.

## Funcionalidades implementadas

- Portal público de propiedades.
- Login con Supabase Auth.
- Roles y rutas protegidas.
- Dashboard de inmobiliaria.
- Gestión de propiedades.
- Contratos.
- Pagos.
- Solicitudes de arreglo.
- Perfil de profesionales.
- Postulaciones de profesionales.
- Dashboard propietario representativo.
- Dashboards de inquilino y profesional conectados al flujo principal.

## Funcionalidades pendientes o futuras

- Integración real con Mercado Pago.
- Integración real con Google Maps.
- Carga múltiple de imágenes mediante Supabase Storage.
- Generación de PDF de contratos.
- Notificaciones reales por email o WhatsApp.
- Reputación avanzada de profesionales.
- Módulos completos de reportes y auditoría.

## Limitaciones conocidas

- Es un prototipo académico orientado a validar flujos principales.
- Los pagos son simulados o representativos.
- Algunas integraciones externas están representadas visualmente, no conectadas a servicios reales.
- Los datos utilizados durante la demo deben ser preparados previamente.
- Algunas acciones están acotadas para mantener el alcance del prototipo.

## Cómo ejecutar localmente

```bash
pnpm install
pnpm run dev
pnpm run lint
pnpm run build
```

## Variables de entorno

Crear un archivo `.env.local` con:

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_o_publishable_key
```

No usar `service_role` key ni claves privadas en el frontend.

## Base de datos

La guía de ejecución SQL está documentada en:

```text
supabase/README_SQL.md
```

Para una base nueva de demo, seguir el camino recomendado con `00_full_demo_schema.sql` y luego las políticas RLS y funciones RPC indicadas allí.

## Cierre

El objetivo de la demo es validar los flujos principales de gestión inmobiliaria: publicación de propiedades, administración interna, contratos, pagos, arreglos y participación de profesionales externos. Locative debe mostrarse como un sistema interno para una inmobiliaria específica, con portal público y operación por roles.
