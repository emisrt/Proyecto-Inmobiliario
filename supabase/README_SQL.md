# Locative - Guia SQL de Supabase

Este directorio contiene el esquema, politicas RLS, funciones RPC y migraciones usadas por el prototipo academico Locative.

## Camino recomendado: base nueva para demo

Ejecutar en Supabase SQL Editor, en este orden:

1. `00_full_demo_schema.sql`
   - Crea el esquema final consolidado del prototipo.
   - Incluye `profiles`, `properties`, `contracts`, `payments`, `repair_requests`, `professional_profiles`, `job_applications` y `property_images`.
   - Incluye los campos finales de propiedades, profesionales y arreglos.

2. `02_rls.sql`
   - Activa Row Level Security.
   - Crea funciones auxiliares `current_user_role()` e `is_agent()`.
   - Crea las politicas finales por rol.
   - Tambien agrega defensivamente campos de `repair_requests` si faltaran.

3. `05_assign_tenant.sql`
   - Agrega compatibilidad para asignar un inquilino a una propiedad en alquiler.
   - Crea la funcion RPC `assign_tenant_to_property(...)`.
   - Actualiza el trigger de alta de perfiles para conservar email.

4. `06_agent_repair_requests.sql`
   - Permite solicitudes de arreglo creadas por inquilino o agente inmobiliario.
   - Crea la funcion RPC `create_agent_repair_request(...)`.
   - Refuerza columnas y politicas de `repair_requests`.

5. `03_seed_data.sql` opcional
   - Inserta datos de prueba.
   - Antes de ejecutarlo hay que crear usuarios reales en Supabase Auth y reemplazar los UUID de ejemplo por los UUID reales.

Los archivos `04_demo_compatibility.sql`, `07_property_form_fields.sql` y `08_professional_profile_fields.sql` no son necesarios si se uso `00_full_demo_schema.sql`, porque sus cambios ya estan incluidos en el esquema consolidado.

## Camino historico: base ya creada con migraciones

Si la base ya fue levantada con el esquema inicial, ejecutar o revisar el siguiente orden:

1. `01_schema.sql`
   - Esquema inicial historico.
   - Mantiene `repair_requests.tenant_id` como `NOT NULL`, por eso requiere migraciones posteriores.

2. `02_rls.sql`
   - RLS final.
   - Ahora agrega defensivamente `created_by_id`, `requested_by_role` y vuelve nullable `tenant_id` en `repair_requests`.

3. `04_demo_compatibility.sql`
   - Compatibilidad de estados, imagen principal y politicas publicas.

4. `05_assign_tenant.sql`
   - RPC para asignar inquilino y ajustar contratos.

5. `06_agent_repair_requests.sql`
   - Migracion de arreglos creados por inmobiliaria.
   - Soluciona el conflicto de `tenant_id NOT NULL`.

6. `07_property_form_fields.sql`
   - Campos finales del formulario de propiedades.

7. `08_professional_profile_fields.sql`
   - Campos finales del perfil profesional.

8. `03_seed_data.sql` opcional
   - Solo para datos de prueba con UUID reales de Auth.

## Archivos legacy o especiales

- `profiles.sql`
  - Archivo temprano para crear solo perfiles y trigger de Auth.
  - No usar junto con `00_full_demo_schema.sql` ni con `01_schema.sql` en una base nueva.

- `01_schema.sql`
  - Se conserva como historico incremental.
  - Para una base nueva de demo es preferible usar `00_full_demo_schema.sql`.

## Conflictos detectados y resueltos

- `repair_requests.tenant_id`
  - En `01_schema.sql` nace como `NOT NULL`.
  - El flujo actual permite solicitudes creadas por la inmobiliaria sin inquilino asociado.
  - El esquema consolidado lo define nullable.
  - `02_rls.sql` y `06_agent_repair_requests.sql` lo corrigen en bases existentes.

- `repair_requests.created_by_id`
  - Algunas politicas y consultas lo necesitan.
  - Si una base existente no tenia la columna, `02_rls.sql` la agrega antes de crear policies.

- `repair_requests.requested_by_role`
  - Se usa para diferenciar solicitudes creadas por `inquilino`, `agente_inmobiliario` o `propietario`.
  - Tiene constraint para evitar roles no contemplados.

- Campos finales de `properties`
  - `province`, `neighborhood`, `bedrooms`, `bathrooms`, `total_area`, `covered_area`, `has_garage`, `has_yard`, `has_pool`, `pets_allowed` y `currency` estan consolidados en `00_full_demo_schema.sql`.

- Campos finales de `professional_profiles`
  - `full_name`, `business_name`, `phone`, `whatsapp`, `email`, `city`, `province`, `secondary_specialties`, `working_days`, `working_hours`, `experience_years` y `license_number` estan consolidados en `00_full_demo_schema.sql`.

## Resumen de RLS por rol

### Visitante / anonimo

- Puede leer propiedades publicadas/disponibles.
- Puede leer imagenes de propiedades publicadas/disponibles.
- No puede insertar, actualizar ni eliminar datos internos.

### Agente inmobiliario

- Puede leer perfiles relacionados necesarios para gestion.
- Puede crear, actualizar y eliminar propiedades.
- Puede leer, crear, actualizar y eliminar contratos.
- Puede leer, crear, actualizar y eliminar pagos.
- Puede crear y gestionar solicitudes de arreglo de propiedades administradas por la inmobiliaria.
- Puede ver postulaciones de profesionales sobre arreglos publicados.

### Propietario

- Puede leer sus propias propiedades.
- Puede leer contratos asociados a sus propiedades.
- Puede leer pagos asociados a contratos de sus propiedades.
- Puede leer arreglos asociados a sus propiedades.
- No administra contratos, pagos ni propiedades.

### Inquilino

- Puede leer propiedades asociadas a sus contratos.
- Puede leer sus contratos.
- Puede leer sus pagos.
- Puede crear y leer sus solicitudes de arreglo.

### Profesional

- Puede leer solicitudes de arreglo publicadas.
- Puede crear postulaciones sobre solicitudes publicadas.
- Puede leer y actualizar sus postulaciones segun politica.
- Puede crear y actualizar su perfil profesional.

## Notas importantes

- No usar `service_role` en el frontend.
- Las SQL deben ejecutarse desde Supabase SQL Editor o una conexion administrativa.
- Si se cambia una policy, volver a ejecutar `02_rls.sql` al final para dejar las reglas en estado final conocido.
- No existe actualmente una tabla `messages` en el esquema activo del proyecto; por eso no fue incluida en el consolidado.
