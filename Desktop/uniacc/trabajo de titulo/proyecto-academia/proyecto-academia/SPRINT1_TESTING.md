# 📋 Plan de Testing - Sprint 1: Sistema de Pagos

## Resumen del Sprint
Implementación completa del sistema de checkout y procesamiento de pagos para la plataforma educativa.

## Componentes Implementados

### Frontend
- ✅ `CheckoutView.vue` - Vista principal de checkout
- ✅ `PaymentForm.vue` - Formulario de procesamiento de pagos
- ✅ `PaymentSuccessView.vue` - Vista de confirmación de pago exitoso
- ✅ Rutas de navegación actualizadas
- ✅ Store actualizado con acciones de pago

### Backend
- ✅ `paymentService.js` - Servicio centralizado de pagos
- ✅ Controlador de ventas actualizado
- ✅ Rutas de API extendidas
- ✅ Integración preparada para múltiples proveedores

---

## 🧪 Plan de Testing

### 1. Testing de Funcionalidad Básica

#### Test Case 1.1: Navegación al Checkout
**Objetivo:** Verificar que los estudiantes pueden acceder al checkout desde la página del curso.

**Pasos:**
1. Iniciar sesión como estudiante
2. Navegar a un curso de pago
3. Hacer clic en "Comprar ahora"
4. Verificar redirección a `/courses/{id}/checkout`

**Resultado esperado:** Redirección exitosa con información del curso cargada.

#### Test Case 1.2: Validación de Formulario de Pago
**Objetivo:** Verificar validación de datos de tarjeta de crédito.

**Pasos:**
1. Acceder al checkout
2. Probar con número de tarjeta inválido: `1234567890123456`
3. Probar con fecha de vencimiento pasada: `01/20`
4. Probar con CVV inválido: `12`
5. Probar con datos válidos: `4111111111111111`, `12/28`, `123`

**Resultado esperado:** 
- Errores de validación mostrados para datos inválidos
- Formulario válido para datos correctos

#### Test Case 1.3: Procesamiento de Pago Simulado
**Objetivo:** Verificar que el procesamiento de pago funciona correctamente.

**Pasos:**
1. Completar formulario con datos válidos
2. Hacer clic en "Pagar"
3. Esperar procesamiento (3-4 segundos)
4. Verificar redirección a página de éxito

**Resultado esperado:** 
- Loading state mostrado durante procesamiento
- Redirección a `/payment/success` con parámetros correctos
- Venta creada en estado "completed"
- Inscripción automática generada

### 2. Testing de Integración

#### Test Case 2.1: Flujo Completo de Compra
**Objetivo:** Probar el flujo completo desde selección hasta acceso al curso.

**Pasos:**
1. Seleccionar curso de pago
2. Proceder al checkout
3. Completar información de pago
4. Confirmar pago
5. Acceder al curso desde página de éxito

**Resultado esperado:** Acceso completo al contenido del curso.

#### Test Case 2.2: Gestión de Estados de Venta
**Objetivo:** Verificar que los estados de venta se manejan correctamente.

**Pasos:**
1. Crear venta (estado: PENDING)
2. Procesar pago (estado: PROCESSING → PAID → COMPLETED)
3. Verificar inscripción automática
4. Probar falla de pago (estado: FAILED)

**Resultado esperado:** Estados correctos en cada paso del proceso.

### 3. Testing de API

#### Test Case 3.1: Crear Venta
```bash
POST /api/sales
Headers: { Authorization: "Bearer {token}" }
Body: { "courseId": "course123" }
```

**Resultado esperado:**
- Status: 201
- Respuesta con ID de venta y estado PENDING

#### Test Case 3.2: Procesar Pago
```bash
POST /api/sales/{saleId}/process-payment
Headers: { Authorization: "Bearer {token}" }
Body: {
  "paymentMethod": "credit_card",
  "cardData": { ... },
  "billingAddress": { ... }
}
```

**Resultado esperado:**
- Status: 200
- Respuesta con éxito del pago y ID de transacción

#### Test Case 3.3: Webhook de Pago
```bash
POST /api/sales/webhook?provider=generic
Body: {
  "event_type": "payment.completed",
  "reference_id": "sale123",
  "payment_id": "pay456"
}
```

**Resultado esperado:**
- Status: 200
- Venta actualizada automáticamente

### 4. Testing de Errores

#### Test Case 4.1: Pago Rechazado
**Objetivo:** Verificar manejo de pagos rechazados.

**Pasos:**
1. Usar datos de tarjeta que simulen rechazo
2. Verificar mensaje de error
3. Confirmar que venta queda en estado FAILED
4. Permitir reintentar pago

#### Test Case 4.2: Timeouts de Red
**Objetivo:** Probar comportamiento con problemas de conectividad.

**Pasos:**
1. Simular timeout en API de pagos
2. Verificar mensaje de error apropiado
3. Confirmar que no se crea inscripción duplicada

### 5. Testing de Seguridad

#### Test Case 5.1: Validación de Permisos
**Objetivo:** Verificar que solo usuarios autorizados pueden procesar pagos.

**Pasos:**
1. Intentar acceder a checkout sin autenticación
2. Intentar procesar pago de otro usuario
3. Verificar redirecciones y mensajes de error

#### Test Case 5.2: Validación de Datos
**Objetivo:** Probar resistencia a datos maliciosos.

**Pasos:**
1. Enviar datos con scripts XSS
2. Probar inyección SQL en campos de texto
3. Verificar sanitización correcta

---

## 🔧 Comandos de Testing

### Instalar dependencias de desarrollo (Backend)
```bash
cd functions
npm install --save-dev jest supertest
```

### Ejecutar tests del backend
```bash
cd functions
npm test
```

### Instalar dependencias de desarrollo (Frontend)
```bash
cd frontend
npm install --save-dev @vue/test-utils jest vue-jest
```

### Ejecutar tests del frontend
```bash
cd frontend
npm run test:unit
```

---

## 📊 Métricas de Éxito

### KPIs del Sprint
- ✅ Tiempo de checkout < 2 minutos
- ✅ Tasa de éxito de pagos > 95%
- ✅ Tiempo de respuesta API < 500ms
- ✅ Cero errores críticos en producción

### Cobertura de Código
- Backend: > 80%
- Frontend: > 70%
- Funciones críticas: 100%

---

## 🚀 Deployment y Configuración

### Variables de Entorno Requeridas

#### Backend (.env)
```env
# Payment Providers
TRANSBANK_ENABLED=false
TRANSBANK_API_KEY=your_transbank_key
TRANSBANK_ENVIRONMENT=sandbox

PAYPAL_ENABLED=false
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
PAYPAL_ENVIRONMENT=sandbox

STRIPE_ENABLED=false
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_PUBLIC_KEY=your_stripe_public
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# App URLs
FRONTEND_URL=http://localhost:8080
```

### Comandos de Deployment

#### Backend
```bash
cd functions
npm run deploy
```

#### Frontend
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

---

## 🐛 Issues Conocidos y Soluciones

### Issue 1: Error de ESLint/Babel
**Problema:** `Cannot find module '@vue/cli-plugin-babel/preset'`
**Solución:** Instalar dependencias faltantes o deshabilitar ESLint temporalmente

### Issue 2: CORS en desarrollo
**Problema:** Errores de CORS al conectar frontend con backend
**Solución:** Configurar proxy en vue.config.js

### Issue 3: Validación de tarjetas
**Problema:** Algoritmo de Luhn muy estricto
**Solución:** Usar números de tarjeta de prueba estándar

---

## 🎯 Próximos Pasos (Sprint 2)

1. **Sistema de Evaluaciones**
   - Crear/tomar exámenes
   - Calificación automática
   - Reportes de resultados

2. **Notificaciones**
   - En tiempo real
   - Emails automáticos
   - Centro de notificaciones

3. **Progreso y Certificados**
   - Tracking detallado
   - Emisión de certificados
   - Badges y logros

4. **Mejoras de UX**
   - Loading states mejorados
   - Animaciones fluidas
   - Responsive design optimizado

---

## 📞 Contacto del Equipo

- **Lead Developer:** [Tu nombre]
- **QA Tester:** [Nombre del tester]
- **Product Owner:** [Nombre del PO]

**¡Sprint 1 completado exitosamente! 🎉**
