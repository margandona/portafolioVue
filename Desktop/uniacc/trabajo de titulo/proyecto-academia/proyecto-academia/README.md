# 🎓 Academia Virtual

Una plataforma educativa en línea desarrollada con **Vue.js**, **Node.js**, **Express**, **Firebase** y **PostgreSQL**, diseñada para ofrecer una experiencia de aprendizaje accesible, intuitiva y escalable.

---

## 📋 Características

- **Gestión de usuarios**:
  - Autenticación con Firebase (registro e inicio de sesión).
  - Roles de usuario (administrador, profesor, estudiante, etc.).
- **Gestión de cursos**:
  - Creación, edición e inscripción en cursos.
  - Seguimiento del progreso y evaluaciones integradas.
- **Sistema de pago**:
  - Integración con pasarelas de pago seguras como PayPal/Stripe.
- **Personalización**:
  - Sugerencias de cursos basadas en preferencias del usuario.
  - Diseño responsive y accesible según WCAG 2.1.
- **Comunidad**:
  - Foros y mensajería interna entre usuarios.

---

## 🛠️ Tecnologías Utilizadas

### **Frontend**

- **Vue.js**: Framework de JavaScript para interfaces de usuario.
- **Bootstrap**: Sistema de diseño responsive.
- **FontAwesome**: Iconografía.
- **SASS**: Preprocesador CSS para estilos avanzados.

### **Backend**

- **Node.js**: Entorno de ejecución para JavaScript en el servidor.
- **Express**: Framework para la construcción de APIs RESTful.
- **Sequelize**: ORM para manejar PostgreSQL.

### **Autenticación y Datos en Tiempo Real**

- **Firebase**: Manejo de autenticación y sincronización en tiempo real.

### **Base de Datos**

- **PostgreSQL**: Base de datos relacional para almacenamiento estructurado.

---

## 🎨 Guía de Estilos

- **Colores Principales**:
  - Primario: `#2E8B57` (Verde Esmeralda)
  - Secundario: `#2A3B5F` (Azul Marino)
  - Énfasis: `#FFA500` (Naranja Brillante)
  - Fondo: `#F5F5F5` (Gris Claro)
  - Texto: `#333333` (Gris Oscuro)
  - Decoración: `#6A0DAD` (Morado Profundo)
  - Fondo Nabvar
- **Tipografías**:
  - **Roboto**: Para texto general.
  - **Playfair Display**: Para títulos y encabezados destacados.

---

## 🚀 Instalación y Configuración

### **Requisitos Previos**

1. Node.js (versión 14 o superior).
2. PostgreSQL.
3. Cuenta en Firebase y archivo de credenciales.

### **Clonar el Repositorio**

```bash
git clone https://github.com/tu-usuario/academia-virtual.git
cd academia-virtual
```

## Backend :

```markdown
## 🚀 Backend

### Ve a la carpeta del backend:
```bash
cd backend
```

### Instala las dependencias:

```bash
npm install
```

### Configura las variables de entorno en un archivo `.env`:

```env
DB_NAME=nombre_base_datos
DB_USER=usuario
DB_PASSWORD=contraseña
DB_HOST=localhost
DB_PORT=5432
PORT=3000
```

### Inicia el servidor:

```bash
npm run dev
```

---

## 🌐 Frontend

### Ve a la carpeta del frontend:

```bash
cd frontend
```

### Instala las dependencias:

```bash
npm install
```

### Inicia la aplicación:

```bash
npm run serve
```

---

## 📂 Estructura del Proyecto

```
AcademiaVirtual
├── backend
│   ├── src
│   │   ├── config        # Configuración (Firebase, PostgreSQL)
│   │   ├── controllers   # Controladores de rutas
│   │   ├── models        # Modelos de Sequelize
│   │   ├── routes        # Rutas para la API
│   │   └── app.js        # Configuración de Express
│   └── server.js         # Punto de entrada del servidor
├── frontend
│   ├── src
│   │   ├── components    # Componentes de Vue.js
│   │   ├── assets        # Estilos, imágenes, fuentes
│   │   ├── views         # Vistas principales
│   │   ├── router        # Configuración de Vue Router
│   │   └── main.js       # Punto de entrada de Vue.js
├── README.md
```

---

## 🛡️ Funcionalidades Implementadas

### **Backend**

#### Registro de Usuarios

* **Endpoint** : `POST /api/auth/register`
* Permite registrar nuevos usuarios con validaciones estrictas.
* **Errores** : Correos duplicados o inválidos.

#### Inicio de Sesión

* **Endpoint** : `POST /api/auth/login`
* Genera un token JWT tras verificar credenciales.

#### Restablecimiento de Contraseña

* **Endpoint** : `POST /api/auth/password-reset`
* Envía un enlace al correo del usuario a través de Firebase.

#### Manejo de Rutas No Encontradas

* Responde con un mensaje JSON amigable.

#### Middleware Global de Errores

* Captura y responde con detalles de errores internos.

---

### **Frontend**

#### Login View

* Formulario funcional con validación y redirección al dashboard.

#### Register View

* Valida datos de entrada y muestra errores descriptivos.

#### NotFound View

* Muestra un mensaje amigable: "404 - Página no encontrada."

---

## 🧪 Pruebas Realizadas

* Registro exitoso y detección de errores.
* Validación de credenciales en el inicio de sesión.
* Restablecimiento de contraseña.
* Manejo de rutas no encontradas.

---

# Sprint 2: Gestión de Usuarios, Cursos e Inscripciones

Este sprint se centró en la implementación y mejora de las funcionalidades relacionadas con usuarios, cursos e inscripciones, garantizando roles y permisos, y mejorando la experiencia tanto en el backend como en el frontend. A continuación, se presenta un resumen de las actividades realizadas:

## Objetivos del Sprint

1. **Gestión de Roles**: Implementar un sistema de roles para usuarios: `admin`, `teacher` y `student`.
2. **Protección de Rutas**: Proteger rutas y operaciones basadas en los roles de los usuarios.
3. **Validaciones Centralizadas**: Refactorizar la lógica de autenticación y validación para hacerla reutilizable.
4. **Centralización de Solicitudes**: Crear un cliente Axios centralizado para simplificar solicitudes HTTP.
5. **Pruebas de Endpoints**: Verificar y probar los endpoints según los permisos correspondientes a cada rol.

---

## Actividades Completadas

### **1. Middleware para Roles**

- Archivo modificado/creado: `authMiddleware.js`.
- **Funciones principales**:
  - `isAuthenticated`: Verifica que el usuario tenga un token válido.
  - `checkRole`: Verifica que el rol del usuario esté autorizado para realizar la operación.
  - `isStudent`, `isTeacher`, `isAdmin`: Wrappers de `checkRole` para roles específicos.
  - `hasCourseAccess`: Valida el acceso del usuario a un curso.
  - `hasEvaluationAccess`: Valida el acceso del usuario a evaluaciones basadas en cursos.

---

### **2. Protección de Rutas**

- Archivos modificados:
  - `auth.js`
  - `course.js`
  - `enrollment.js`
  - `evaluation.js`
- **Detalles**:
  - Se añadió el middleware de autenticación y roles en las rutas correspondientes.
  - Ejemplo:
    ```javascript
    router.get('/courses', isAuthenticated, listCourses);
    router.post('/courses', isAuthenticated, isTeacher, createCourse);
    ```

---

### **3. Verificación de Tokens**

- Archivo modificado: `authMiddleware.js`.
- **Implementación**:
  - Validación de tokens vencidos o inválidos.
  - Se añadió una respuesta clara en caso de error.

---

### **4. Actualización de Controladores**

- Archivos modificados:
  - `authController.js`: Mejora en las respuestas de login y registro, incluyendo roles en los datos devueltos.
  - `userController.js`: Mejora en la gestión de usuarios para incluir validaciones y respuestas claras.

---

### **5. Persistencia de Roles en Vuex**

- Archivo modificado/creado: `store/index.js`.
- **Implementación**:
  - Se añadió el rol del usuario al estado global.
  - Se creó un getter para acceder al rol fácilmente:
    ```javascript
    getters: {
      userRole: (state) => state.user.role,
    }
    ```

---

### **6. Protección de Rutas en el Frontend**

- Archivo modificado: `router/index.js`.
- **Implementación**:
  - Redirección basada en roles usando `meta.role` en las rutas.
  - Ejemplo:
    ```javascript
    if (to.meta.role && !to.meta.role.includes(userRole)) {
      alert("No tienes los permisos necesarios para acceder a esta página.");
      next({ name: "Home" });
    }
    ```

---

### **7. Actualización de Componentes**

- Archivos modificados:
  - `DashboardView.vue`
  - `CoursesView.vue`
  - `EnrollView.vue`
- **Mejoras**:
  - Mostrar opciones dinámicas según el rol del usuario.
  - Mensajes claros en caso de no tener acceso a funcionalidades.

---

### **8. Uso del Token para Roles**

- Archivos modificados:
  - `LoginView.vue`
  - `RegisterView.vue`
- **Implementación**:
  - Decodificación del token JWT para almacenar datos del usuario en Vuex.

---

### **9. Centralización de Solicitudes Axios**

- Archivo creado: `utils/api.js`.
- **Detalles**:
  - Configuración de un cliente Axios centralizado para manejar tokens automáticamente.
  - Ejemplo:
    ```javascript
    const apiClient = axios.create({
      baseURL: 'http://localhost:3000',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    export default apiClient;
    ```

---

### **10. Refactorización de Validaciones**

- Archivos modificados:
  - `authMiddleware.js` (backend)
  - `router/index.js` (frontend)
- **Mejoras**:
  - Creación de funciones reutilizables para validación de roles y autenticación.

---

## Pruebas Realizadas

- **Endpoints probados**:
  - **Users**: `/api/users`, `/api/users/:id`.
  - **Courses**: `/api/courses`, `/api/courses/:id`.
  - **Enrollments**: `/api/enrollments`, `/api/enrollments/:id`.
- **Roles cubiertos**:
  - `admin`, `teacher`, y `student`.
- **Herramienta utilizada**: Thunder Client.

---

## Resultados y Logros

- **Mejoras en la seguridad**: Rutas y acciones protegidas según roles.
- **Código más mantenible**: Uso de lógica centralizada para validaciones y solicitudes.
- **Flujo de trabajo más claro**: Roles y permisos bien definidos para cada usuario.

---

## Próximos Pasos

1. Mejorar las pruebas automatizadas para cubrir más casos.
2. Implementar cacheo para optimizar solicitudes frecuentes.
3. Refinar la interfaz de usuario para una mejor experiencia en gestión de cursos.

---

> **Nota**: Asegúrate de realizar un test exhaustivo después de cualquier cambio en los roles o rutas protegidas.


# Sprint 3: Documentación

## **Objetivo Principal**

Implementar y mejorar la funcionalidad relacionada con la gestión de cursos, validaciones de roles, y componentes interactivos en la aplicación. El enfoque incluyó tanto mejoras visuales como de seguridad para garantizar una experiencia fluida y protegida.

---

## **Tareas realizadas**

### 1. **Validación por roles**

#### Backend

- **Middleware actualizado:**
  - Añadidos `isAuthenticated`, `isTeacher`, e `isAdmin` para garantizar la autenticidad y permisos en los endpoints protegidos.
  - Los roles manejados son `student`, `teacher`, y `admin`.
- **Restricciones en cursos:**
  - Solo profesores (`teacher`) o administradores (`admin`) pueden crear, editar y eliminar cursos.
  - Los estudiantes (`student`) tienen permisos solo para visualizar cursos.
- **Endpoints protegidos:**
  - `routes/courses.js`:
    - Validación en todas las rutas.
    - Reglas de acceso según el rol para los métodos `POST`, `PUT`, y `DELETE`.
  - **Modelos revisados:**
    - `models/course.js`: Añadida relación con usuarios y validaciones estrictas.
    - `models/user.js`: Métodos como `isTeacher` e `isAdmin` para simplificar validaciones.

#### Frontend

- **Restricciones de roles:**
  - Crear, editar y eliminar cursos solo para profesores o administradores.
  - Los estudiantes pueden acceder únicamente a vistas de suscripción y progreso.
- **Rutas protegidas:**
  - Implementación en `router/index.js` para gestionar accesos según el rol y autenticación.

---

### 2. **Modal para detalles del curso**

#### Frontend

- **Componente `CourseModalComponent.vue`:**
  - Modal interactivo para mostrar detalles de los cursos.
  - Gestión de visibilidad mediante la propiedad `isVisible`.
  - Diseño consistente con la guía de estilos de la aplicación.
- **Integración con `CoursesComponent.vue`:**
  - Modal incluido en la lista de cursos.
  - Activación al seleccionar un curso.
- **Estilos:**
  - Paleta de colores y tipografía unificada con el diseño global.

---

### 3. **Gestión de evaluaciones**

- **Validación por roles:**
  - Creación y edición de evaluaciones restringida a profesores y administradores.
  - Los estudiantes pueden visualizar y realizar evaluaciones.
- **Componentes:**
  - `EvaluationListView.vue`: Lista de evaluaciones con validación por rol.
  - `EvaluationFormView.vue`: Formularios interactivos para crear o editar evaluaciones.
  - `EvaluationDetailView.vue`: Detalles de cada evaluación.
- **Rutas:**
  - Nuevas rutas añadidas para gestionar evaluaciones (`/evaluations`, `/evaluations/edit/:id`, etc.).

---

### 4. **Navbar y Footer mejorados**

#### Navbar

- Añadida opción **Academia Virtual** con hipervínculo al Moodle: `https://virtual.neekworld.cl/moodle41/login/index.php`.
- Iconos de FontAwesome integrados para una mejor experiencia visual.
- Mejoras en la distribución del menú basado en los roles del usuario.

#### Footer

- Nuevo componente `FooterComponent.vue`:
  - Mismo color y diseño que el Navbar.
  - Incluye enlaces como "Acerca de", "Academia Virtual", y "Contacto".
  - Aparece siempre al final de la página, independientemente del contenido.

---

### 5. **Configuración global de Axios**

- Configuración en `main.js` para unificar el uso de Axios:
  - URL base: `http://localhost:3000`.
  - Token de autenticación añadido automáticamente en los encabezados.
  - Accesibilidad a Axios mediante `this.$axios` en los componentes.

---

## **Resultados**

- **Seguridad mejorada:**
  - Validación de roles integrada en backend y frontend.
  - Rutas protegidas y acciones restringidas a usuarios autorizados.
- **Experiencia de usuario optimizada:**
  - Modal y formularios interactivos mejoran la navegación.
  - Navbar y Footer unifican el diseño y añaden funcionalidad práctica.
- **Estructura mantenible:**
  - Código modular en middlewares, modelos y componentes.
  - Estilos y guías de diseño aplicadas en todos los componentes.

---

## **Archivos modificados**

### Backend

- `routes/courses.js`
- `controllers/courseController.js`
- `middlewares/authMiddleware.js`
- `models/course.js`
- `models/user.js`

### Frontend

- **Componentes:**
  - `NavbarComponent.vue`
  - `FooterComponent.vue`
  - `CourseModalComponent.vue`
  - `CoursesComponent.vue`
  - `EvaluationListView.vue`
  - `EvaluationFormView.vue`
  - `EvaluationDetailView.vue`
- **Vistas:**
  - `CoursesView.vue`
  - `EvaluationView.vue`
- **Rutas:**
  - `router/index.js`
- **Configuración:**
  - `main.js`
- **Estilos:**
  - `variables.scss`
  - `global.scss`

---

## **Próximos pasos**

1. **Auditorías y Logs:**
   - Desarrollar un sistema de auditoría para registrar actividades y accesos.
2. **Pruebas Unitarias:**
   - Implementar pruebas unitarias e integración para validaciones de rol.
3. **Optimización del rendimiento:**
   - Cachear respuestas de evaluaciones y cursos para reducir llamadas al backend.


# Sprint 4: Documentación

## **Objetivo Principal**

Optimizar y completar las funcionalidades relacionadas con la gestión de evaluaciones, progreso de los estudiantes, y el sistema de inscripciones (enrollment). Este sprint incluyó también mejoras visuales, funcionales, y de seguridad en diversas áreas del sistema.

---

## **Tareas realizadas**

### 1. **Gestión de Evaluaciones**

#### Backend

- **Endpoints para evaluaciones:**
  - Nuevos endpoints en `routes/evaluations.js`:
    - `POST /api/evaluations`: Crear evaluación.
    - `PUT /api/evaluations/:id`: Editar evaluación.
    - `DELETE /api/evaluations/:id`: Eliminar evaluación.
    - `GET /api/evaluations/course/:courseId`: Listar evaluaciones por curso.
  - Validación de roles implementada con `isTeacher` e `isAdmin` en las rutas protegidas.
  - Relación de evaluaciones con cursos y usuarios:
    - Modelos actualizados en `models/evaluation.js` y `models/course.js`.

#### Frontend

- **Componentes desarrollados:**
  - **`EvaluationListView.vue`:** Listar evaluaciones por curso con acciones según el rol del usuario.
  - **`EvaluationFormView.vue`:** Crear y editar evaluaciones en un formulario dinámico.
  - **`EvaluationDetailView.vue`:** Mostrar los detalles de una evaluación con preguntas y opciones.
- **Rutas protegidas:**
  - Nuevas rutas en `router/index.js` para manejar evaluaciones:
    - `/evaluations`: Ver lista de evaluaciones.
    - `/evaluations/create`: Crear nueva evaluación.
    - `/evaluations/edit/:id`: Editar evaluación existente.
    - `/evaluations/:id`: Detalles de una evaluación.

---

### 2. **Seguimiento del Progreso**

#### Backend

- **Endpoints para progreso:**
  - `GET /api/progress/:userId`: Obtener el progreso del usuario en todos los cursos.
  - `GET /api/progress/course/:courseId`: Progreso de los estudiantes en un curso.
  - **Cálculo del progreso:**
    - Métodos implementados en `controllers/progressController.js` para calcular el porcentaje completado en base a evaluaciones realizadas.

#### Frontend

- **Vistas desarrolladas:**

  - **`ProgressView.vue`:**
    - Vista dedicada al progreso de los estudiantes.
    - Gráficos implementados con librerías como `Chart.js` para visualizar avances.
  - **Integración en `DashboardView.vue`:**
    - Tarjetas de resumen para mostrar el progreso de cursos inscritos.
- **Restricciones de acceso:**

  - Solo estudiantes pueden visualizar su progreso individual.
  - Profesores y administradores pueden consultar el progreso del curso completo.

---

### 3. **Sistema de Inscripciones (Enrollment)**

#### Backend

- **Endpoints para inscripciones:**
  - `POST /api/courses/enroll`: Inscribir un estudiante en un curso.
  - `DELETE /api/courses/enroll/:enrollmentId`: Desinscribir a un estudiante.
  - `GET /api/courses/enrolled`: Listar cursos en los que un estudiante está inscrito.
  - **Relaciones en los modelos:**
    - `models/enrollment.js`:
      - Relación entre usuarios y cursos con validaciones de duplicados.
    - `models/course.js`:
      - Relación con inscripciones.

#### Frontend

- **Componentes desarrollados:**

  - **`EnrollView.vue`:**
    - Formulario para inscribir estudiantes en cursos.
    - Validaciones para evitar duplicados.
  - **`StudentListModal.vue`:**
    - Modal interactivo para mostrar la lista de estudiantes inscritos en un curso.
    - Opciones para desinscribir estudiantes desde la vista del curso.
- **Rutas protegidas:**

  - Agregadas rutas en `router/index.js`:
    - `/courses/enroll`: Página para inscripciones.
    - `/courses/students`: Mostrar lista de estudiantes inscritos.

---

### 4. **Navbar y Footer**

- **Navbar:**

  - Añadida opción **Academia Virtual** con enlace directo al Moodle institucional.
  - Integración con iconos FontAwesome para mejorar la experiencia visual.
  - Ajustes dinámicos en las opciones de navegación según el rol del usuario.
- **Footer:**

  - Nuevo componente `FooterComponent.vue`:
    - Diseño consistente con el Navbar.
    - Incluye enlaces útiles: "Acerca de", "Academia Virtual", y "Contacto".
    - Posicionado de forma fija al final de la página.

---

### 5. **Configuración global y mejoras generales**

- **Configuración de Axios:**

  - Implementada en `main.js` para manejar:
    - URL base: `http://localhost:3000`.
    - Headers globales con el token de autenticación.
    - Acceso a través de `this.$axios` en todos los componentes.
- **Store Vuex mejorado:**

  - Nuevas acciones y estados:
    - `fetchProgress`: Obtener el progreso del estudiante.
    - `fetchEnrolledCourses`: Cursos en los que está inscrito un usuario.
    - `fetchEvaluations`: Evaluaciones de un curso.

---

## **Resultados**

- **Evaluaciones robustas:**
  - Profesores y administradores pueden gestionar evaluaciones fácilmente.
  - Los estudiantes tienen acceso a evaluaciones en sus cursos y pueden visualizar sus resultados.
- **Progreso visual:**
  - Gráficos intuitivos que muestran avances en los cursos.
  - Mejora en la experiencia de usuario gracias a visualizaciones interactivas.
- **Sistema de inscripciones completo:**
  - Inscripción y desinscripción gestionada de forma segura.
  - Listas de estudiantes accesibles para profesores y administradores.
- **Mejor experiencia de usuario:**
  - Navbar y Footer unificados en diseño.
  - Enlace a Moodle integrado directamente en la navegación.

---

## **Archivos modificados**

### Backend

- `routes/evaluations.js`
- `routes/progress.js`
- `routes/enrollment.js`
- `controllers/evaluationController.js`
- `controllers/progressController.js`
- `controllers/enrollmentController.js`
- `models/evaluation.js`
- `models/progress.js`
- `models/enrollment.js`

### Frontend

- **Componentes:**
  - `NavbarComponent.vue`
  - `FooterComponent.vue`
  - `EvaluationListView.vue`
  - `EvaluationFormView.vue`
  - `EvaluationDetailView.vue`
  - `ProgressView.vue`
  - `EnrollView.vue`
  - `StudentListModal.vue`
- **Vistas:**
  - `DashboardView.vue`
  - `CoursesView.vue`
  - `EvaluationView.vue`
- **Rutas:**
  - `router/index.js`
- **Store Vuex:**
  - Acciones añadidas para progreso, evaluaciones, y cursos inscritos.
- **Configuración:**
  - `main.js`

---

## **Próximos pasos**

1. **Notificaciones y recordatorios:**
   - Enviar notificaciones a estudiantes sobre evaluaciones pendientes.
2. **Exportar reportes:**
   - Progreso de estudiantes y resultados de evaluaciones exportables en PDF o Excel.
3. **Optimización del rendimiento:**
   - Implementar cacheo en la visualización de evaluaciones y progreso.
4. **Pruebas adicionales:**
   - Unitarias e integrales para garantizar la calidad en evaluaciones y progreso.
