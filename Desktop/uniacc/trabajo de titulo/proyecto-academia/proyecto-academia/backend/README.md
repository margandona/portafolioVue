
# Sprint 3: Documentación

## **Objetivo Principal**

Implementar validaciones de roles en la aplicación y realizar mejoras relacionadas con los permisos y restricciones de acceso tanto en el backend como en el frontend.

---

## **Tareas realizadas**

### 1. **Validación por roles**

#### Backend

* **Middleware actualizado:**
  * Se agregaron los middlewares `isAuthenticated`, `isTeacher`, e `isAdmin` para verificar los roles y accesos.
  * Los roles se validan como `student`, `teacher` y `admin`.
* **Restricciones adicionales:**
  * Solo los profesores (`teacher`) o administradores (`admin`) pueden crear, editar y eliminar cursos.
  * Los estudiantes (`student`) tienen acceso limitado a visualizar los cursos.
* **Endpoints protegidos:**
  * `routes/courses.js`:
    * Verificación de autenticación en todas las rutas.
    * Validación de roles para los métodos `POST`, `PUT` y `DELETE`.
  * `controllers/courseController.js`:
    * Validaciones adicionales para permitir solo al creador del curso o a un administrador realizar actualizaciones o eliminaciones.
  * **Modelos revisados:**
    * `models/course.js`: Asegura la relación entre cursos y usuarios (profesores).
    * `models/user.js`: Implementación de métodos personalizados como `isTeacher` e `isAdmin` para facilitar la validación de roles.

#### Frontend

* **Restricciones por roles:**
  * Las acciones de crear, editar y eliminar cursos solo son accesibles para profesores o administradores.
  * Los estudiantes pueden visualizar los cursos, pero no pueden modificarlos.

---

### 2. **Implementación de un modal para detalles del curso**

* **Frontend:**
  * **Componente `CourseModalComponent.vue`:**
    * Modal que muestra detalles completos del curso.
    * Diseño siguiendo la guía de estilos.
    * Propiedad `isVisible` para gestionar la visibilidad del modal.
  * **Integración con `CoursesComponent.vue`:**
    * Se agregó el modal al listado de cursos.
    * El modal se activa al seleccionar una tarjeta de curso.
  * **Estilos:**
    * Se aseguraron de respetar la paleta de colores y la consistencia en la interfaz.

---

### 3. **Modelado de datos**

* **Revisiones de modelos:**
  * **`models/course.js`:**
    * Relación con el modelo `User` para identificar al profesor.
    * Validación estricta de campos como `modality`, `start_date`, y `duration_days`.
  * **`models/user.js`:**
    * Implementación de validación para los roles permitidos.
    * Métodos personalizados (`isTeacher`, `isAdmin`, `isStudent`) para facilitar la verificación de permisos.
  * **Hooks:**
    * Configurados para establecer valores predeterminados y actualizar `timestamps`.

---

### 4. **Mejoras generales**

#### Backend

* **Controladores:**
  * `courseController.js`:
    * Validaciones adicionales para los roles en los endpoints de cursos.
    * Mensajes de error claros para usuarios sin permisos.
* **Middlewares:**
  * Modularización para facilitar el mantenimiento y la reutilización del código.

#### Frontend

* **Componente `CoursesComponent.vue`:**
  * Adición de eventos para abrir el modal de detalles.
  * Gestión de permisos para las acciones de edición y eliminación.
* **Rutas:**
  * Validación de autenticación para rutas protegidas (`/courses`, `/courses/edit/:id`, etc.).
  * Manejo de redirecciones para usuarios no autenticados.
* **Integración visual:**
  * Ajustes en componentes (`NavbarComponent`, `CoursesComponent`, `CourseCardComponent`, etc.) para respetar la guía de estilos.

---

## **Resultados**

* **Seguridad mejorada:**
  * El sistema ahora valida los roles en cada acción.
  * Las restricciones aseguran que solo usuarios autorizados pueden realizar acciones críticas.
* **Experiencia de usuario optimizada:**
  * La funcionalidad de modal mejora la navegación y la visualización de los detalles del curso.
  * Se unificó el diseño y los estilos en todo el frontend.
* **Código modular y mantenible:**
  * Los modelos y middlewares están organizados para facilitar futuras extensiones o cambios.

---

## **Archivos modificados**

### Backend

* `routes/courses.js`
* `controllers/courseController.js`
* `middlewares/authMiddleware.js`
* `models/course.js`
* `models/user.js`

### Frontend

* `components/CourseCardComponent.vue`
* `components/CourseModalComponent.vue`
* `components/CoursesComponent.vue`
* `views/CoursesView.vue`
* `router/index.js`
* `App.vue`

---

## **Próximos pasos**

1. Implementar un sistema de logs para auditorías relacionadas con permisos y accesos.
2. Optimizar el manejo de errores en frontend y backend.
3. Desarrollar pruebas unitarias y de integración para garantizar el correcto funcionamiento de las validaciones.

---

Si necesitas ampliar algún punto o agregar más detalles, no dudes en decírmelo. 😊
