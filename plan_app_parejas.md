# JoinMe — Plan de desarrollo

## 1. Visión del producto

**JoinMe** es una aplicación móvil privada para dos personas que permite:

- Registrar en un mapa real los lugares donde tuvieron citas.
- Conservar el título, la descripción, la fecha y las fotografías de cada cita.
- Puntuar individualmente una experiencia sin revelar los resultados hasta que ambos hayan respondido.
- Guardar ideas de citas futuras.
- Convertir una idea en un plan y posteriormente en un recuerdo del mapa.
- Consultar la **Huella** de la relación mediante estadísticas y visualizaciones.
- Personalizar los perfiles individuales y el perfil compartido de la pareja.

La experiencia principal de JoinMe será:

> **Idea → Plan → Cita realizada → Recuerdo en el mapa → Huella**

La primera versión de JoinMe estará configurada exclusivamente para **Yesica y Fabián**. No mostrará registro, inicio de sesión, creación de parejas ni invitaciones. Aun así, la base de datos y las reglas de acceso conservarán una arquitectura compatible con múltiples usuarios y parejas para facilitar una futura publicación comercial.

### Estrategia personal primero, producción después

- La interfaz inicial solo mostrará los perfiles de Yesica y Fabián.
- Cada teléfono se asignará una vez a uno de los dos perfiles.
- Supabase creará una identidad técnica anónima y persistente en segundo plano.
- No se solicitarán correo electrónico ni contraseña.
- La pareja y sus dos integrantes se crearán mediante datos iniciales controlados.
- Todas las tablas seguirán asociadas a `couple_id` y `profile_id`.
- Las políticas de seguridad se implementarán como si JoinMe ya fuera multiusuario.
- El módulo futuro de registro podrá activarse sin cambiar el modelo principal de datos.
- Una identidad anónima podrá enlazarse posteriormente con correo, Apple o Google sin perder los recuerdos existentes.

## 2. Alcance del MVP

### Incluido

- Selección inicial entre Yesica y Fabián.
- Asignación segura del teléfono al perfil seleccionado.
- Identidad técnica anónima y persistente, sin pantalla de cuenta.
- Perfiles preconfigurados y personalizables de Yesica y Fabián.
- Pareja preconfigurada mediante datos iniciales.
- Perfil compartido de la pareja.
- Mapa interactivo con marcadores.
- Creación y edición de lugares.
- Creación de ideas de citas.
- Conversión de una idea en un plan.
- Conversión de un plan en una cita realizada.
- Registro directo de una cita realizada.
- Fechas planificadas y fechas reales editables.
- Carga y visualización de fotografías.
- Puntuaciones individuales ocultas.
- Revelación simultánea de puntuaciones.
- Vista cronológica de las citas.
- Sección Huella con estadísticas esenciales.
- Notificaciones esenciales.
- Recuperación controlada del acceso a un perfil en caso de reinstalación o cambio de teléfono.
- Gestión, exportación y eliminación de datos.

### Fuera del MVP

- Cápsula del momento.
- Chat entre la pareja.
- Notas de voz y canciones.
- Recomendaciones mediante inteligencia artificial.
- Sugerencias automáticas de lugares.
- Gamificación, niveles o monedas.
- Suscripciones y pagos.
- Aplicación web completa.
- Integración con redes sociales.
- Registro público con correo, Apple o Google.
- Creación dinámica de nuevas parejas.
- Invitaciones y vinculación pública de cuentas.

## 3. Stack tecnológico

| Área | Tecnología |
|---|---|
| Aplicación móvil | React Native con Expo |
| Lenguaje | TypeScript |
| Navegación | Expo Router |
| Mapas | `react-native-maps` |
| Backend | Supabase |
| Base de datos | PostgreSQL de Supabase |
| Identidad técnica | Supabase Auth anónimo y silencioso |
| Seguridad | Row Level Security de PostgreSQL |
| Fotografías | Expo Image Picker y Supabase Storage |
| Datos remotos y caché | TanStack Query |
| Estado local | Zustand |
| Formularios | React Hook Form |
| Validación | Zod |
| Notificaciones | Expo Notifications |
| Monitoreo de errores | Sentry |
| Compilación | EAS Build |
| Pruebas de componentes | React Native Testing Library |
| Pruebas de flujos | Maestro |

## 4. Arquitectura de navegación

### Activación inicial

- Pantalla de bienvenida privada.
- Selección: “Soy Yesica” o “Soy Fabián”.
- Confirmación mediante una clave privada de instalación o un código generado desde el otro dispositivo.
- Creación silenciosa de la identidad técnica.
- Asociación del dispositivo con el perfil elegido.
- Apertura de la navegación principal.

La selección de perfil solo se realizará durante la activación de un dispositivo. Después se conservará mediante una sesión segura y almacenamiento local protegido.

### Navegación principal

JoinMe tendrá cuatro pestañas:

1. **Mapa**
2. **Ideas**
3. **Huella**
4. **Perfil**

### Pantallas secundarias

- Detalle de lugar.
- Detalle de experiencia.
- Crear o editar experiencia.
- Seleccionar ubicación.
- Galería de fotografías.
- Enviar puntuación.
- Resultado de puntuaciones.
- Vista cronológica.
- Configuración de la pareja.
- Privacidad y administración de datos.

## 5. Módulos funcionales

### 5.1 Identidad y activación privada

- Crear una identidad anónima en segundo plano.
- Mostrar únicamente los perfiles de Yesica y Fabián.
- Impedir que dos dispositivos activos ocupen accidentalmente el mismo perfil sin confirmación.
- Asociar la identidad técnica con el miembro seleccionado.
- Guardar la sesión de manera segura en el dispositivo.
- Proteger las rutas privadas.
- Permitir revocar un dispositivo desde el otro teléfono.
- Permitir recuperar el acceso con una clave privada de recuperación.
- Mantener preparada la vinculación futura con correo, Apple o Google.

### 5.2 Perfiles personales

Cada integrante podrá configurar:

- Nombre o apodo, inicialmente Yesica o Fabián.
- Fotografía o avatar.
- Color personal.
- Pronombres opcionales.
- Preferencias de citas.
- Categorías favoritas.
- Tema visual.
- Preferencias de notificaciones.

### 5.3 Perfil compartido

- Nombre de la pareja.
- Fotografía conjunta.
- Fecha de inicio de la relación.
- Paleta visual compartida.
- Ciudad base opcional.
- Estado de los dos dispositivos asociados.
- Opciones de recuperación y revocación de dispositivos.

### 5.4 Mapa

- Mostrar los lugares registrados.
- Diferenciar citas realizadas y planes futuros mediante el marcador.
- Centrar el mapa en la ubicación del usuario con permiso explícito.
- Crear un lugar manteniendo pulsado sobre el mapa.
- Buscar o ajustar manualmente una ubicación.
- Abrir el detalle al pulsar un marcador.
- Filtrar por estado, categoría, año y puntuación.
- Agrupar marcadores cercanos.
- Permitir citas sin ubicación física.

### 5.5 Lugares y visitas

Un lugar podrá contener varias citas o visitas. Esto evitará marcadores duplicados y permitirá construir una historia del lugar.

Ejemplo:

```text
Café Central
├── Primera visita
├── Segunda visita
└── Tercera visita
```

Cada lugar podrá almacenar:

- Nombre.
- Dirección.
- Latitud y longitud.
- Ciudad y país.
- Tipo: ubicación exacta, aproximada, en casa, a distancia o sin ubicación.
- Citas relacionadas.

### 5.6 Experiencias

Una misma entidad representará una idea, un plan o una cita realizada. Su estado cambiará sin duplicar información.

Estados:

- `idea`
- `planned`
- `completed`
- `discarded`

Datos principales:

- Título.
- Descripción.
- Estado.
- Categoría.
- Autor.
- Lugar opcional.
- Fecha planificada opcional.
- Fecha real opcional.
- Presupuesto estimado opcional.
- Fotografías.
- Puntuaciones.

Transiciones permitidas:

```text
Idea → Planificada → Realizada
Idea → Descartada
Planificada → Idea
```

### 5.7 Ideas de citas

- Crear una idea con título y descripción.
- Añadir categoría y presupuesto estimado.
- Añadir un lugar opcional.
- Identificar quién propuso la idea.
- Editar o descartar una idea.
- Convertirla en un plan.
- Filtrar y ordenar las ideas.

### 5.8 Planificación

Al convertir una idea en plan:

- Se conserva el título.
- Se conserva la descripción.
- Se conserva la categoría.
- Se selecciona o confirma el lugar.
- Se añade una fecha prevista.
- El estado cambia a `planned`.

Después de realizarla:

- Se confirma la fecha real.
- Se puede corregir la ubicación.
- Se añaden fotografías.
- Se habilitan las puntuaciones.
- El estado cambia a `completed`.
- La cita pasa a formar parte de la Huella.

### 5.9 Fotografías

- Seleccionar imágenes desde el dispositivo.
- Comprimirlas antes de subirlas.
- Mostrar el progreso de carga.
- Asociarlas a la experiencia y al usuario que las añadió.
- Permitir reordenarlas.
- Definir una fotografía de portada.
- Eliminar fotografías con confirmación.

### 5.10 Puntuaciones ocultas

Reglas:

- Cada integrante puede enviar una puntuación por cita.
- La puntuación de la otra persona permanece inaccesible hasta que existan ambas.
- La primera persona verá únicamente que su respuesta fue registrada.
- Cuando ambos hayan puntuado, se revelan las dos respuestas.
- El promedio se calcula únicamente después de la revelación.
- Una puntuación puede editarse mientras la otra persona no haya respondido.
- Las modificaciones posteriores a la revelación deben quedar indicadas.

La protección se implementará en la base de datos mediante una función segura. El cliente de JoinMe no recibirá anticipadamente la puntuación oculta.

### 5.11 Huella

La primera versión incluirá:

- Total de citas realizadas.
- Cantidad de lugares diferentes.
- Ciudades visitadas.
- Categoría más frecuente.
- Lugar más visitado.
- Promedio conjunto de puntuaciones.
- Citas por mes y por año.
- Distribución por categoría.
- Zonas exploradas en el mapa.
- Filtros por periodo.

Las estadísticas se calcularán únicamente con citas en estado `completed`.

### 5.12 Notificaciones

- Nuevo plan creado.
- Plan modificado.
- Cita marcada como realizada.
- Solicitud de puntuación.
- Puntuaciones listas para revelarse.

Las notificaciones deberán poder desactivarse individualmente.

## 6. Modelo de datos

### `profiles`

```text
id
display_name
avatar_url
personal_color
pronouns
preferences
notification_settings
fixed_profile_key
created_at
updated_at
```

Datos iniciales:

```text
yesica
fabian
```

`fixed_profile_key` solo se utilizará en el modo personal y deberá ser único. En una futura versión pública será opcional.

### `couples`

```text
id
name
photo_url
relationship_started_on
base_city
theme
invite_code
invite_status
created_by_profile_id
created_at
updated_at
```

En el modo personal, `invite_code` e `invite_status` permanecerán vacíos. Se conservan para la futura activación del flujo público.

### `couple_members`

```text
couple_id
profile_id
role
joined_at
```

Restricciones:

- Máximo de dos miembros activos por pareja.
- Yesica y Fabián serán los únicos miembros creados en el modo personal.
- Una identidad técnica solo podrá controlar uno de los perfiles fijos.
- La combinación `couple_id + profile_id` debe ser única.

### `device_bindings`

```text
id
profile_id
auth_user_id
device_id
platform
status
last_seen_at
created_at
revoked_at
```

Esta tabla permitirá asignar cada teléfono a Yesica o Fabián, revocar dispositivos y conservar una ruta segura hacia una futura autenticación pública.

### `categories`

```text
id
couple_id
name
icon
color
is_system
```

### `places`

```text
id
couple_id
name
address
latitude
longitude
city
country
location_type
created_by_profile_id
created_at
updated_at
```

### `experiences`

```text
id
couple_id
place_id
created_by_profile_id
title
description
status
category_id
planned_at
completed_at
budget_level
cover_photo_id
created_at
updated_at
deleted_at
```

### `experience_photos`

```text
id
experience_id
uploaded_by_profile_id
storage_path
display_order
created_at
deleted_at
```

### `ratings`

```text
id
experience_id
profile_id
score
revealed_at
created_at
updated_at
```

Restricción única:

```text
experience_id + profile_id
```

### `push_tokens`

```text
id
device_binding_id
push_token
platform
enabled
updated_at
```

### `activity_log`

```text
id
couple_id
actor_profile_id
entity_type
entity_id
action
metadata
created_at
```

## 7. Seguridad y privacidad

### Control de acceso

- Todas las tablas deberán usar Row Level Security.
- Una identidad técnica solo podrá consultar datos pertenecientes a la pareja de Yesica y Fabián.
- La selección visual de un perfil no será suficiente para obtener acceso; deberá existir una asociación válida en `device_bindings`.
- Las claves administrativas nunca se incluirán dentro de JoinMe.
- Las rutas protegidas de JoinMe no sustituirán las políticas de la base de datos.
- Los buckets de fotografías tendrán políticas equivalentes.
- Las operaciones sensibles se realizarán mediante funciones de base de datos.

### Preparación para producción

- Las políticas se escribirán usando `couple_id` y membresías, no identificadores fijos.
- Los nombres Yesica y Fabián vivirán en datos iniciales, no en la lógica de negocio.
- El modo personal se controlará mediante configuración, no mediante bifurcaciones repartidas por el código.
- Los proveedores de autenticación pública podrán añadirse sobre la capa de identidad existente.
- Se conservarán migraciones reproducibles para crear entornos de desarrollo, pruebas y producción.
- Las funciones privilegiadas verificarán la identidad y la membresía desde el servidor.
- El almacenamiento de imágenes utilizará rutas separadas por pareja.

### Ubicación

- No se realizará seguimiento continuo.
- La ubicación solo se solicitará cuando el usuario quiera centrar el mapa o registrar un lugar.
- Se podrá guardar una ubicación aproximada.
- Las citas podrán registrarse sin coordenadas.

### Eliminación, dispositivos y recuperación

- Las eliminaciones utilizarán inicialmente una papelera recuperable.
- Revocar un dispositivo no eliminará recuerdos ni perfiles.
- La recuperación de acceso requerirá una clave privada o la autorización del otro dispositivo activo.
- Yesica y Fabián podrán exportar una copia de los datos compartidos.
- Las fotografías deberán eliminarse del almacenamiento cuando se complete una eliminación definitiva.

## 8. Estructura del proyecto

```text
src/
  app/
    (activation)/
    (tabs)/
      map/
      ideas/
      footprint/
      profile/
    experience/
    place/
  components/
    ui/
    map/
    forms/
  features/
    identity/
    activation/
    devices/
    couples/
    profiles/
    places/
    experiences/
    photos/
    ratings/
    footprint/
    notifications/
  services/
    supabase/
    location/
    notifications/
    monitoring/
  hooks/
  stores/
  schemas/
  theme/
  types/
supabase/
  migrations/
  functions/
  seed.sql
```

## 9. Plan de implementación

### Fase 1 — Definición del producto

- Nombre definido: **JoinMe**.
- Definir identidad visual y tono.
- Crear el mapa de navegación.
- Diseñar los flujos principales.
- Preparar el prototipo de las pantallas esenciales.
- Validar estados, permisos y reglas de edición.
- Cerrar el esquema inicial de base de datos.

### Fase 2 — Base técnica

- Crear el proyecto Expo con TypeScript.
- Configurar Expo Router.
- Configurar Supabase.
- Añadir variables de entorno.
- Configurar TanStack Query y Zustand.
- Crear los componentes base de interfaz.
- Configurar tema, colores y tipografía.
- Crear migraciones SQL iniciales.
- Generar los tipos de la base de datos.
- Añadir configuración de modo personal y modo público futuro.
- Crear datos iniciales reproducibles para Yesica, Fabián y su pareja.

### Fase 3 — Identidad silenciosa y perfiles

- Implementar autenticación anónima en segundo plano.
- Crear la pantalla de selección entre Yesica y Fabián.
- Implementar la confirmación privada de activación.
- Asociar cada dispositivo con el perfil seleccionado.
- Guardar la sesión de manera segura.
- Proteger las rutas privadas.
- Crear y editar el perfil personal.
- Subir avatar.
- Aplicar color y preferencias personales.
- Implementar revocación y recuperación de dispositivos.

### Fase 4 — Pareja preconfigurada y base multiusuario

- Crear el perfil compartido mediante datos iniciales.
- Asociar los perfiles de Yesica y Fabián con la pareja.
- Limitar el modo personal a esos dos miembros.
- Implementar políticas de acceso por pareja.
- Verificar que ninguna identidad ajena pueda acceder a los datos.
- Mantener preparado, pero desactivado, el modelo de invitaciones públicas.

### Fase 5 — Mapa y lugares

- Integrar el mapa nativo.
- Implementar permisos de ubicación.
- Mostrar la posición actual bajo demanda.
- Crear lugares desde el mapa.
- Editar coordenadas y datos del lugar.
- Mostrar marcadores.
- Abrir el detalle del lugar.
- Agrupar varias visitas en un mismo lugar.
- Añadir filtros esenciales.

### Fase 6 — Ideas y planificación

- Crear, editar y descartar ideas.
- Añadir categorías.
- Añadir presupuesto estimado.
- Añadir ubicación opcional.
- Convertir una idea en plan.
- Seleccionar fecha planificada.
- Reprogramar o devolver un plan al estado de idea.
- Mostrar planes futuros en mapa y lista.

### Fase 7 — Citas realizadas

- Marcar un plan como realizado.
- Registrar la fecha real.
- Confirmar o modificar la ubicación.
- Crear una cita realizada directamente.
- Mostrarla en el mapa.
- Crear la vista de detalle.
- Crear la vista cronológica.

### Fase 8 — Fotografías

- Seleccionar fotografías del dispositivo.
- Comprimirlas.
- Subirlas al almacenamiento.
- Asociarlas a la cita.
- Mostrar galería y portada.
- Reordenar fotografías.
- Eliminar fotografías.
- Aplicar políticas privadas de almacenamiento.

### Fase 9 — Puntuaciones

- Crear la interfaz de puntuación.
- Implementar una respuesta por usuario y cita.
- Crear la función segura de envío.
- Impedir la lectura anticipada de la puntuación de la pareja.
- Revelar los resultados cuando existan ambas respuestas.
- Calcular el promedio conjunto.
- Notificar que los resultados están disponibles.

### Fase 10 — Huella

- Crear consultas agregadas.
- Mostrar total de citas y lugares.
- Mostrar ciudades visitadas.
- Calcular categorías y lugares frecuentes.
- Mostrar promedio conjunto.
- Crear gráficos por mes, año y categoría.
- Añadir filtros por periodo.
- Diseñar estados vacíos cuando todavía no existan citas o lugares.

### Fase 11 — Notificaciones

- Registrar dispositivos.
- Guardar tokens de notificación.
- Enviar avisos de planes.
- Enviar solicitudes de puntuación.
- Enviar aviso de revelación.
- Crear preferencias individuales.

### Fase 12 — Calidad, seguridad y publicación

- Revisar todas las políticas de acceso.
- Verificar aislamiento entre identidades y perfiles.
- Probar las políticas con una segunda pareja ficticia aunque la interfaz pública aún no exista.
- Verificar que la lógica no dependa de nombres o identificadores codificados directamente.
- Probar pérdidas de conexión.
- Probar cargas incompletas de fotografías.
- Añadir manejo de errores y reintentos.
- Añadir monitoreo de fallos.
- Escribir pruebas de componentes.
- Crear pruebas de los flujos principales.
- Revisar accesibilidad.
- Preparar política de privacidad.
- Preparar recursos y configuración de las tiendas.
- Distribuir una beta cerrada.
- Recoger comentarios y corregir los problemas detectados.

## 10. Orden obligatorio del flujo principal

El producto deberá validarse siguiendo este recorrido:

1. Abrir JoinMe en un dispositivo nuevo.
2. Seleccionar Yesica o Fabián.
3. Confirmar la activación privada del dispositivo.
4. Personalizar el perfil.
5. Crear una idea.
6. Convertir la idea en plan.
7. Seleccionar fecha y ubicación.
8. Marcar la cita como realizada.
9. Añadir fotografías.
10. Puntuar individualmente.
11. Esperar la segunda puntuación.
12. Revelar los resultados.
13. Mostrar el recuerdo en el mapa.
14. Incorporarlo a la Huella.

## 11. Criterios de aceptación del MVP

El MVP estará completo cuando:

- Yesica y Fabián aparezcan preconfigurados sin registro ni inicio de sesión visible.
- Cada teléfono pueda asignarse de forma segura a uno de los dos perfiles.
- Una identidad ajena no pueda ver ni modificar los datos compartidos.
- Revocar un dispositivo no elimine los recuerdos.
- Una idea pueda recorrer todo su ciclo sin duplicar información.
- Una cita realizada aparezca correctamente en el mapa y la cronología.
- Varias citas puedan asociarse al mismo lugar.
- Las fotografías sean privadas y recuperables desde la cita.
- Ningún integrante pueda conocer anticipadamente la puntuación del otro.
- Las dos puntuaciones se revelen de manera simultánea.
- La Huella se actualice únicamente con citas realizadas.
- Cada usuario pueda personalizar su perfil.
- La pareja pueda editar su perfil compartido.
- Los estados de error, carga y contenido vacío estén correctamente diseñados.
- Los flujos principales funcionen en Android e iOS.
- Las tablas y políticas admitan una segunda pareja ficticia sin modificar su estructura.
- Los nombres Yesica y Fabián provengan de datos iniciales y no estén codificados en la lógica de negocio.

## 12. Prioridades posteriores al MVP

1. Mejoras de Huella y visualizaciones.
2. Búsqueda y filtros avanzados.
3. Repetir una cita anterior.
4. Selección aleatoria de ideas.
5. Categorías personalizadas.
6. Exportación visual de recuerdos.
7. Activar registro mediante correo, Apple o Google.
8. Activar creación e invitación de nuevas parejas.
9. Convertir identidades anónimas existentes en cuentas permanentes.
10. Aplicación web complementaria.
11. Sistema de suscripción.
12. Recomendaciones de citas.
13. Integraciones externas.

## 13. Ruta de transición de JoinMe a producto público

La publicación futura deberá consistir principalmente en activar módulos ya previstos, no en rediseñar el núcleo.

### Identidad

- Añadir registro con correo, Apple y Google.
- Permitir que Yesica y Fabián conviertan sus identidades anónimas en cuentas permanentes.
- Añadir recuperación de cuenta y gestión de sesiones.

### Parejas

- Activar creación de parejas.
- Activar invitaciones mediante enlace o código.
- Gestionar aceptación, rechazo, expiración y revocación.
- Definir reglas públicas para desvinculación y propiedad de recuerdos.

### Operación

- Separar entornos de desarrollo, pruebas y producción.
- Añadir límites de uso, monitoreo y alertas.
- Añadir panel administrativo mínimo.
- Implementar términos de servicio y política de privacidad pública.
- Añadir eliminación de cuenta y portabilidad de datos.
- Revisar costos de mapas, almacenamiento y notificaciones.

### Negocio

- Definir funciones gratuitas y premium.
- Implementar compras dentro de JoinMe.
- Añadir métricas de producto respetando la privacidad.
- Preparar soporte, reportes y moderación de contenido.
