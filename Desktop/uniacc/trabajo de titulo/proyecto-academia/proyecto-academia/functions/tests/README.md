# Guía de Pruebas de API

Esta guía te ayudará a probar las APIs del sistema de cursos, ventas e inscripciones utilizando cualquier cliente HTTP.

## Requerimientos

Para realizar las pruebas puedes utilizar cualquiera de estas herramientas:
- [Postman](https://www.postman.com/downloads/)
- [Insomnia](https://insomnia.rest/download)
- [Thunder Client](https://www.thunderclient.com/) (extensión para VS Code)
- [curl](https://curl.se/) (línea de comandos)

## Variables a configurar

Antes de ejecutar las pruebas, necesitarás obtener y configurar estas variables:

- `TOKEN`: Token de autenticación para un usuario cualquiera
- `ADMIN_TOKEN`: Token para un usuario con rol de administrador
- `TEACHER_TOKEN`: Token para un usuario con rol de profesor
- `STUDENT_TOKEN`: Token para un usuario con rol de estudiante 
- `COURSE_ID`: ID de un curso de pago
- `FREE_COURSE_ID`: ID de un curso gratuito
- `SALE_ID`: ID de una venta
- `STUDENT_ID`: ID de un usuario estudiante
- `ENROLLMENT_ID`: ID de una inscripción

## Obteniendo tokens de autenticación

Para obtener un token, necesitas hacer login con un usuario:

```bash
curl -X POST "http://localhost:5001/proyecto-academia/us-central1/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@ejemplo.com","password":"contraseña"}'
```

La respuesta incluirá un token que debes usar en las siguientes peticiones.

## Flujo básico de pruebas

1. Login para obtener tokens
2. Crear cursos (gratuito y de pago)
3. Probar ventas e inscripciones
4. Verificar descuentos y asignaciones especiales

## Ejemplos con curl

### 1. Iniciar compra de curso

```bash
curl -X POST "http://localhost:5001/proyecto-academia/us-central1/api/sales" \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"courseId":"ID_DEL_CURSO"}'
```

### 2. Obtener detalles de una venta

```bash
curl -X GET "http://localhost:5001/proyecto-academia/us-central1/api/sales/ID_DE_VENTA" \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

### 3. Procesar pago

```bash
curl -X POST "http://localhost:5001/proyecto-academia/us-central1/api/sales/ID_DE_VENTA/process-payment" \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"paymentId":"pay_123","paymentMethod":"credit_card"}'
```

### 4. Crear un curso gratuito

```bash
curl -X POST "http://localhost:5001/proyecto-academia/us-central1/api/courses" \
  -H "Authorization: Bearer TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Curso Gratuito","description":"Descripción del curso","category":"Programación","modality":"asynchronized","duration_days":30,"isFree":true}'
```
