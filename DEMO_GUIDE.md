# Guia de demo funcional - Locative

## Objetivo

Mostrar un prototipo funcional de Locative conectado a Supabase, con portal publico de propiedades, autenticacion por roles, gestion de propiedades, solicitudes de arreglo, postulaciones de profesionales y dashboards con datos reales.

## Usuarios de prueba

Crear usuarios en Supabase Auth o desde `/register` y verificar que exista su fila en `public.profiles`:

- Agente inmobiliario: `role = agente_inmobiliario`
- Inquilino: `role = inquilino`
- Profesional: `role = profesional`
- Propietario: `role = propietario`
- Visitante: puede navegar sin iniciar sesion por `/portal`

## Datos necesarios en Supabase

- Ejecutar `supabase/01_schema.sql`.
- Ejecutar `supabase/02_rls.sql`.
- Ejecutar `supabase/04_demo_compatibility.sql` si la base ya existia antes de esta etapa.
- Ejecutar `supabase/05_assign_tenant.sql` para habilitar asignacion de inquilinos y contratos pendientes.
- Ejecutar `supabase/06_agent_repair_requests.sql` para permitir solicitudes de arreglo creadas por inmobiliaria sin inquilino obligatorio.
- Cargar al menos una propiedad en estado `disponible`, `disponible_alquiler` o `disponible_venta`.
- Cargar un contrato `activo` para el usuario inquilino, asociado a una propiedad.
- Cargar pagos del contrato si se quiere probar el dashboard del inquilino.
- Crear perfil profesional desde `/profesional/perfil` o insertar una fila en `professional_profiles`.

## Recorrido sugerido

1. Entrar como visitante a `/portal`.
2. Ver propiedades disponibles y abrir `/portal/propiedades/:id`.
3. Iniciar sesion como agente inmobiliario.
4. Entrar a `/inmobiliaria` y revisar metricas reales.
5. Entrar a `/inmobiliaria/propiedades`.
6. Crear una propiedad desde `/inmobiliaria/propiedades/nueva`.
7. Editar o cambiar estado desde el detalle de la propiedad.
8. En una propiedad de alquiler disponible, usar `Asignar inquilino`.
9. Buscar un usuario por ID o email, completar fechas, monto y confirmar contrato.
10. Verificar que la propiedad queda `alquilada` y el usuario queda con rol `inquilino`.
11. Entrar a `/inmobiliaria/arreglos`.
12. Crear una solicitud desde `/inmobiliaria/arreglos/nuevo`.
13. Publicar una solicitud cambiando su estado a `publicado`.
14. Cerrar sesion e iniciar como profesional.
15. Completar perfil en `/profesional/perfil`.
16. Entrar a `/profesional/arreglos-disponibles`.
17. Abrir un arreglo y postularse.
18. Revisar `/profesional/postulaciones`.
19. Cerrar sesion e iniciar nuevamente como agente inmobiliario.
20. Entrar a `/inmobiliaria/arreglos/:id/postulaciones`.
21. Aceptar una postulacion.
22. Verificar que el arreglo queda `en_proceso` y con profesional asignado.
23. Iniciar como inquilino.
24. Entrar a `/inquilino`, `/inquilino/arreglos` y crear una solicitud en `/inquilino/arreglos/nuevo`.

## Funcionalidades implementadas

- Portal publico conectado a Supabase.
- Detalle publico de propiedades.
- Listado, alta, edicion, detalle y cambio de estado de propiedades para inmobiliaria.
- Asignacion de inquilino a propiedad en alquiler con contrato.
- Dashboards conectados a Supabase para inmobiliaria, inquilino y profesional.
- Solicitudes de arreglo del inquilino conectadas al contrato activo.
- Gestion de arreglos desde inmobiliaria con estado, prioridad y observaciones.
- Creacion de solicitudes de arreglo desde inmobiliaria sobre cualquier propiedad gestionada.
- Perfil profesional editable.
- Arreglos disponibles para profesionales.
- Postulaciones con control de duplicados.
- Gestion de postulaciones desde inmobiliaria con aceptacion y rechazo.
- Rutas protegidas por rol con `RoleProtectedRoute`.

## Limitaciones conocidas

- No hay subida de imagenes a Supabase Storage todavia; `image_url` se maneja como texto.
- La aceptacion de postulaciones se realiza con actualizaciones secuenciales desde frontend. Para produccion conviene moverlo a una RPC transaccional en Supabase.
- Contratos, pagos y propietarios se visualizan cuando existen datos, pero no tienen modulo CRUD completo en esta etapa.
- Las politicas RLS deben estar ejecutadas en Supabase para que cada rol vea lo correspondiente.

## Ejecucion local

```bash
pnpm install
pnpm dev
```

Variables necesarias en `.env.local`:

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_publishable_o_anon_key
```

No usar `service_role` ni claves privadas en el frontend.
