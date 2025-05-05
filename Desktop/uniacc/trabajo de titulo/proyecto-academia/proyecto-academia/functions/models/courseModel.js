const admin = require('../config/firebase');
const db = admin.firestore();
const coursesCollection = db.collection('courses');
const enrollmentsCollection = db.collection('enrollments');
const usersCollection = db.collection('users');

/**
 * Modelo para manejar operaciones relacionadas con cursos en Firestore
 */
class CourseModel {
  // Constante para el IVA (19% en Chile)
  static IVA_RATE = 0.19;

  /**
   * Obtiene un curso por su ID
   * @param {string} courseId - ID del curso
   * @returns {Promise<Object|null>} Datos del curso o null si no existe
   */
  static async findById(courseId) {
    try {
      const courseDoc = await coursesCollection.doc(courseId).get();
      if (!courseDoc.exists) return null;
      
      const courseData = courseDoc.data();
      
      // Obtener información del profesor
      if (courseData.teacherId) {
        const teacherDoc = await usersCollection.doc(courseData.teacherId).get();
        if (teacherDoc.exists) {
          const teacherData = teacherDoc.data();
          courseData.teacher = {
            id: teacherDoc.id,
            name: teacherData.name,
            email: teacherData.email
          };
        }
      }
      
      // Calcular precios con descuentos
      this.calculatePricing(courseData);
      
      return {
        id: courseDoc.id,
        ...courseData
      };
    } catch (error) {
      console.error('Error en findById:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene todos los cursos
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Array>} Lista de cursos
   */
  static async findAll(limit = 100) {
    try {
      const snapshot = await coursesCollection.limit(limit).get();
      
      if (snapshot.empty) return [];
      
      const courses = [];
      
      for (const doc of snapshot.docs) {
        const courseData = doc.data();
        
        // Obtener información del profesor para cada curso
        if (courseData.teacherId) {
          const teacherDoc = await usersCollection.doc(courseData.teacherId).get();
          if (teacherDoc.exists) {
            const teacherData = teacherDoc.data();
            courseData.teacher = {
              id: teacherDoc.id,
              name: teacherData.name,
              email: teacherData.email
            };
          }
        }
        
        // Calcular precios con descuentos
        this.calculatePricing(courseData);
        
        courses.push({
          id: doc.id,
          ...courseData
        });
      }
      
      return courses;
    } catch (error) {
      console.error('Error en findAll:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene cursos por profesor/creador
   * @param {string} teacherId - ID del profesor
   * @returns {Promise<Array>} Lista de cursos del profesor
   */
  static async findByTeacher(teacherId) {
    try {
      const snapshot = await coursesCollection.where('teacherId', '==', teacherId).get();
      
      if (snapshot.empty) return [];
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error en findByTeacher:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene cursos disponibles para un estudiante (en los que no está inscrito)
   * @param {string} studentId - ID del estudiante
   * @returns {Promise<Array>} Lista de cursos disponibles
   */
  static async findAvailableForStudent(studentId) {
    try {
      // Obtener IDs de cursos en los que el estudiante ya está inscrito
      const enrollmentsSnapshot = await enrollmentsCollection
        .where('userId', '==', studentId)
        .get();
      
      const enrolledCourseIds = enrollmentsSnapshot.docs.map(doc => doc.data().courseId);
      
      // Obtener todos los cursos
      const coursesSnapshot = await coursesCollection.get();
      
      if (coursesSnapshot.empty) return [];
      
      const availableCourses = [];
      
      for (const doc of coursesSnapshot.docs) {
        // Si el curso no está en la lista de inscritos, está disponible
        if (!enrolledCourseIds.includes(doc.id)) {
          const courseData = doc.data();
          
          // Obtener información del profesor
          if (courseData.teacherId) {
            const teacherDoc = await usersCollection.doc(courseData.teacherId).get();
            if (teacherDoc.exists) {
              const teacherData = teacherDoc.data();
              courseData.teacher = {
                id: teacherDoc.id,
                name: teacherData.name,
                email: teacherData.email
              };
            }
          }
          
          availableCourses.push({
            id: doc.id,
            ...courseData
          });
        }
      }
      
      return availableCourses;
    } catch (error) {
      console.error('Error en findAvailableForStudent:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene cursos en los que un estudiante está inscrito
   * @param {string} studentId - ID del estudiante
   * @returns {Promise<Array>} Lista de cursos inscritos
   */
  static async findEnrolledByStudent(studentId) {
    try {
      // Obtener inscripciones del estudiante
      const enrollmentsSnapshot = await enrollmentsCollection
        .where('userId', '==', studentId)
        .get();
      
      if (enrollmentsSnapshot.empty) return [];
      
      const enrolledCourses = [];
      
      for (const doc of enrollmentsSnapshot.docs) {
        const enrollmentData = doc.data();
        const courseDoc = await coursesCollection.doc(enrollmentData.courseId).get();
        
        if (courseDoc.exists) {
          const courseData = courseDoc.data();
          
          // Obtener información del profesor
          let teacher = null;
          if (courseData.teacherId) {
            const teacherDoc = await usersCollection.doc(courseData.teacherId).get();
            if (teacherDoc.exists) {
              const teacherData = teacherDoc.data();
              teacher = {
                id: teacherDoc.id,
                name: teacherData.name,
                email: teacherData.email
              };
            }
          }
          
          enrolledCourses.push({
            id: courseDoc.id,
            ...courseData,
            enrollment: {
              id: doc.id,
              progress: enrollmentData.progress || 0,
              completedEvaluations: enrollmentData.completedEvaluations || []
            },
            teacher
          });
        }
      }
      
      return enrolledCourses;
    } catch (error) {
      console.error('Error en findEnrolledByStudent:', error);
      throw error;
    }
  }
  
  /**
   * Crea un nuevo curso
   * @param {Object} courseData - Datos del curso a crear
   * @returns {Promise<Object>} Datos del curso creado
   */
  static async create(courseData) {
    try {
      // Validar campos requeridos
      if (!courseData.title) throw new Error('El título del curso es obligatorio');
      if (!courseData.description) throw new Error('La descripción del curso es obligatoria');
      if (!courseData.category) throw new Error('La categoría del curso es obligatoria');
      if (!courseData.instructor_id) throw new Error('El ID del profesor es obligatorio');
      
      // Validar si es curso gratuito
      const isFree = !!courseData.isFree;
      
      // Si es de pago, validar SKU y precio
      if (!isFree) {
        if (!courseData.sku) throw new Error('El SKU del curso es obligatorio para cursos de pago');
        if (!courseData.netPrice && courseData.netPrice !== 0) throw new Error('El precio del curso es obligatorio para cursos de pago');
        if (isNaN(courseData.netPrice) || courseData.netPrice < 0) {
          throw new Error('El precio debe ser un número positivo');
        }
        
        // Verificar si el SKU ya existe para evitar duplicados
        const skuExists = await coursesCollection
          .where('sku', '==', courseData.sku)
          .limit(1)
          .get();
          
        if (!skuExists.empty) {
          throw new Error('El SKU ya existe. Debe ser único para cada curso');
        }
      } else {
        // Para cursos gratuitos establecer precio en 0
        courseData.netPrice = 0;
        // Si no se proporciona SKU para curso gratuito, generar uno
        if (!courseData.sku) {
          courseData.sku = `FREE-${Date.now()}`;
        }
      }
      
      // Validar modalidad y campos específicos
      if (!['synchronized', 'asynchronized'].includes(courseData.modality)) {
        throw new Error('La modalidad debe ser "synchronized" o "asynchronized"');
      }
      
      if (courseData.modality === 'synchronized') {
        if (!courseData.start_date) throw new Error('La fecha de inicio es obligatoria para cursos sincronizados');
        if (!courseData.end_date) throw new Error('La fecha de término es obligatoria para cursos sincronizados');
        // Asegurarse de que las fechas sean objetos Date
        courseData.start_date = this.ensureTimestamp(courseData.start_date);
        courseData.end_date = this.ensureTimestamp(courseData.end_date);
        // Asegurarse de que la fecha de fin sea posterior a la de inicio
        if (courseData.end_date < courseData.start_date) {
          throw new Error('La fecha de término debe ser posterior a la fecha de inicio');
        }
        // Para cursos sincronizados, duration_days es calculado
        courseData.duration_days = null;
      } else {
        // Para cursos asincrónicos, se requiere duración en días
        if (!courseData.duration_days) throw new Error('La duración en días es obligatoria para cursos asincrónicos');
        if (isNaN(courseData.duration_days) || courseData.duration_days < 1) {
          throw new Error('La duración debe ser un número positivo');
        }
        // Para cursos asincrónicos, no se usan fechas de inicio/fin
        courseData.start_date = null;
        courseData.end_date = null;
      }
      
      // Procesar información de descuento si existe
      if (courseData.discount) {
        this.validateDiscountData(courseData);
      }
      
      // Calcular precio total con IVA
      courseData.totalPrice = this.calculateTotalPrice(courseData.netPrice);
      courseData.isFree = isFree;
      
      // Inicializar campos de descuento si no existen
      if (!courseData.discount) {
        courseData.discount = 0;
        courseData.discountType = null;
        courseData.discountStartDate = null;
        courseData.discountEndDate = null;
        courseData.discountName = null;
      }
      
      // Si tiene descuento, calcular precios con descuento
      if (courseData.discount > 0) {
        this.calculatePricing(courseData);
      }
      
      // Agregar campos de auditoría
      courseData.created_at = admin.firestore.FieldValue.serverTimestamp();
      courseData.updated_at = admin.firestore.FieldValue.serverTimestamp();
      
      // Crear el curso
      const docRef = await coursesCollection.add(courseData);
      
      return {
        id: docRef.id,
        ...courseData
      };
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }
  
  /**
   * Validar datos de descuento
   * @param {Object} courseData - Datos del curso con descuento
   */
  static validateDiscountData(courseData) {
    // Validar porcentaje de descuento
    if (courseData.discount < 0 || courseData.discount > 100) {
      throw new Error('El descuento debe estar entre 0 y 100%');
    }
    
    // Validar tipo de descuento
    const validTypes = ['manual', 'campaign', 'global'];
    if (courseData.discountType && !validTypes.includes(courseData.discountType)) {
      throw new Error(`Tipo de descuento inválido. Debe ser uno de: ${validTypes.join(', ')}`);
    }
    
    // Si tiene fechas, validarlas
    if (courseData.discountStartDate && courseData.discountEndDate) {
      const startDate = this.ensureTimestamp(courseData.discountStartDate);
      const endDate = this.ensureTimestamp(courseData.discountEndDate);
      
      if (endDate < startDate) {
        throw new Error('La fecha de fin del descuento debe ser posterior a la fecha de inicio');
      }
      
      // Actualizar a Timestamps de Firestore
      courseData.discountStartDate = startDate;
      courseData.discountEndDate = endDate;
    }
  }
  
  /**
   * Convierte varios formatos de fecha a Timestamp de Firestore
   * @param {Date|string|number} date - Fecha a convertir
   * @returns {Timestamp} Timestamp de Firestore
   */
  static ensureTimestamp(date) {
    if (!date) return null;
    
    if (date instanceof admin.firestore.Timestamp) {
      return date;
    }
    
    if (typeof date === 'string') {
      return admin.firestore.Timestamp.fromDate(new Date(date));
    }
    
    if (date instanceof Date) {
      return admin.firestore.Timestamp.fromDate(date);
    }
    
    if (typeof date === 'number') {
      return admin.firestore.Timestamp.fromMillis(date);
    }
    
    return null;
  }
  
  /**
   * Calcula el precio total con IVA
   * @param {number} netPrice - Precio neto sin IVA
   * @returns {number} Precio total con IVA
   */
  static calculateTotalPrice(netPrice) {
    if (!netPrice || isNaN(netPrice)) return 0;
    
    const iva = netPrice * this.IVA_RATE;
    const totalPrice = Math.round((netPrice + iva) * 100) / 100; // Redondear a 2 decimales
    
    return totalPrice;
  }
  
  /**
   * Calcula todos los precios de un curso incluyendo descuentos
   * @param {Object} courseData - Datos del curso
   */
  static calculatePricing(courseData) {
    // Si es gratis, establecer todos los precios a 0
    if (courseData.isFree) {
      courseData.netPrice = 0;
      courseData.totalPrice = 0;
      courseData.discountedNetPrice = 0;
      courseData.discountedTotalPrice = 0;
      courseData.discountAmount = 0;
      courseData.hasActiveDiscount = false;
      return;
    }
    
    // Calcular precio con IVA si tiene precio
    if (courseData.netPrice || courseData.netPrice === 0) {
      courseData.totalPrice = this.calculateTotalPrice(courseData.netPrice);
    }
    
    // Verificar si hay un descuento activo
    courseData.hasActiveDiscount = this.isDiscountActive(courseData);
    
    if (courseData.hasActiveDiscount && courseData.discount > 0) {
      // Calcular precios con descuento
      const discountMultiplier = (100 - courseData.discount) / 100;
      courseData.discountedNetPrice = Math.round(courseData.netPrice * discountMultiplier * 100) / 100;
      courseData.discountedTotalPrice = this.calculateTotalPrice(courseData.discountedNetPrice);
      courseData.discountAmount = Math.round((courseData.netPrice - courseData.discountedNetPrice) * 100) / 100;
    } else {
      // Sin descuento, los precios con descuento son iguales a los normales
      courseData.discountedNetPrice = courseData.netPrice;
      courseData.discountedTotalPrice = courseData.totalPrice;
      courseData.discountAmount = 0;
      courseData.hasActiveDiscount = false;
    }
  }
  
  /**
   * Verifica si un descuento está activo
   * @param {Object} courseData - Datos del curso
   * @returns {boolean} - true si el descuento está activo
   */
  static isDiscountActive(courseData) {
    // Si no hay descuento o es 0, no está activo
    if (!courseData.discount || courseData.discount <= 0) {
      return false;
    }
    
    // Si es descuento manual o global sin fechas, está activo
    if (courseData.discountType === 'manual' || courseData.discountType === 'global') {
      // Si no tiene fechas, está activo
      if (!courseData.discountStartDate || !courseData.discountEndDate) {
        return true;
      }
    }
    
    // Si tiene fechas, verificar que esté dentro del rango
    if (courseData.discountStartDate && courseData.discountEndDate) {
      const now = admin.firestore.Timestamp.now();
      return now >= courseData.discountStartDate && now <= courseData.discountEndDate;
    }
    
    return true;
  }
  
  /**
   * Actualiza un curso existente
   * @param {string} courseId - ID del curso a actualizar
   * @param {Object} courseData - Datos a actualizar
   * @returns {Promise<Object>} El curso actualizado
   */
  static async update(courseId, courseData) {
    try {
      // Verificar que el curso exista
      const courseDoc = await coursesCollection.doc(courseId).get();
      if (!courseDoc.exists) throw new Error('Curso no encontrado');
      
      const existingCourse = courseDoc.data();
      
      // Si se cambia entre gratis y pago, validar datos
      if (courseData.isFree !== undefined && courseData.isFree !== existingCourse.isFree) {
        if (courseData.isFree) {
          // Si se cambia a gratis, establecer precio en 0
          courseData.netPrice = 0;
        } else if (!courseData.netPrice && !existingCourse.netPrice) {
          // Si se cambia a pago pero no tiene precio
          throw new Error('Al cambiar a curso de pago, debe establecer un precio');
        }
      }
      
      // Si está actualizando el SKU, verificar que no exista
      if (courseData.sku) {
        const skuExists = await coursesCollection
          .where('sku', '==', courseData.sku)
          .limit(1)
          .get();
          
        if (!skuExists.empty && skuExists.docs[0].id !== courseId) {
          throw new Error('El SKU ya existe. Debe ser único para cada curso');
        }
      }
      
      // Si está actualizando el precio, calcular el total con IVA
      if (courseData.netPrice !== undefined) {
        if (!courseData.isFree && (isNaN(courseData.netPrice) || courseData.netPrice < 0)) {
          throw new Error('El precio debe ser un número positivo');
        }
        courseData.totalPrice = this.calculateTotalPrice(courseData.netPrice);
      }
      
      // Si está actualizando el descuento, validarlo
      if (courseData.discount !== undefined) {
        // Mezclar datos existentes con nuevos para validación completa
        const discountData = {
          discount: courseData.discount !== undefined ? courseData.discount : existingCourse.discount,
          discountType: courseData.discountType || existingCourse.discountType,
          discountStartDate: courseData.discountStartDate || existingCourse.discountStartDate,
          discountEndDate: courseData.discountEndDate || existingCourse.discountEndDate,
        };
        
        this.validateDiscountData(discountData);
        
        // Actualizar todos los campos de descuento
        courseData.discount = discountData.discount;
        courseData.discountType = discountData.discountType;
        courseData.discountStartDate = discountData.discountStartDate;
        courseData.discountEndDate = discountData.discountEndDate;
      }
      
      // Preparar datos para actualización
      const updateData = {
        ...courseData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      // Si cambia la modalidad, validar los campos específicos
      if (courseData.modality) {
        this.validateModalityFields(courseData.modality, courseData);
      }
      
      // Actualizar el curso
      await coursesCollection.doc(courseId).update(updateData);
      
      // Obtener el curso actualizado
      const updatedDoc = await coursesCollection.doc(courseId).get();
      const updatedData = updatedDoc.data();
      
      // Calcular precios con descuentos para la respuesta
      this.calculatePricing(updatedData);
      
      return {
        id: updatedDoc.id,
        ...updatedData
      };
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  }
  
  /**
   * Aplica un descuento a un curso
   * @param {string} courseId - ID del curso
   * @param {Object} discountData - Datos del descuento
   * @returns {Promise<Object>} - Curso con descuento aplicado
   */
  static async applyDiscount(courseId, discountData) {
    try {
      const courseDoc = await coursesCollection.doc(courseId).get();
      if (!courseDoc.exists) {
        throw new Error('Curso no encontrado');
      }
      
      const courseData = courseDoc.data();
      
      // No permitir descuentos en cursos gratuitos
      if (courseData.isFree) {
        throw new Error('No se pueden aplicar descuentos a cursos gratuitos');
      }
      
      // Validar datos de descuento
      this.validateDiscountData(discountData);
      
      // Actualizar curso con el descuento
      const updateData = {
        discount: discountData.discount,
        discountType: discountData.discountType,
        discountName: discountData.discountName,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      // Actualizar fechas si se proporcionan
      if (discountData.discountStartDate) {
        updateData.discountStartDate = this.ensureTimestamp(discountData.discountStartDate);
      }
      
      if (discountData.discountEndDate) {
        updateData.discountEndDate = this.ensureTimestamp(discountData.discountEndDate);
      }
      
      await coursesCollection.doc(courseId).update(updateData);
      
      // Retornar curso actualizado
      return await this.findById(courseId);
    } catch (error) {
      console.error('Error al aplicar descuento:', error);
      throw error;
    }
  }
  
  /**
   * Elimina el descuento de un curso
   * @param {string} courseId - ID del curso
   * @returns {Promise<Object>} - Curso sin descuento
   */
  static async removeDiscount(courseId) {
    try {
      const courseDoc = await coursesCollection.doc(courseId).get();
      if (!courseDoc.exists) {
        throw new Error('Curso no encontrado');
      }
      
      // Eliminar descuento
      await coursesCollection.doc(courseId).update({
        discount: 0,
        discountType: null,
        discountName: null,
        discountStartDate: null,
        discountEndDate: null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Retornar curso actualizado
      return await this.findById(courseId);
    } catch (error) {
      console.error('Error al eliminar descuento:', error);
      throw error;
    }
  }
  
  /**
   * Elimina un curso
   * @param {string} courseId - ID del curso a eliminar
   * @returns {Promise<boolean>} true si se eliminó correctamente
   */
  static async delete(courseId) {
    try {
      // Verificar que el curso exista
      const courseDoc = await coursesCollection.doc(courseId).get();
      if (!courseDoc.exists) throw new Error('Curso no encontrado');
      
      // Eliminar inscripciones asociadas
      const enrollmentsSnapshot = await enrollmentsCollection
        .where('courseId', '==', courseId)
        .get();
      
      // Usar batch para eliminar múltiples documentos en una transacción
      const batch = db.batch();
      
      enrollmentsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Añadir eliminación del curso
      batch.delete(coursesCollection.doc(courseId));
      
      // Ejecutar batch
      await batch.commit();
      
      return true;
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }
  
  /**
   * Valida los datos básicos de un curso
   * @param {Object} courseData - Datos a validar
   */
  static validateCourseData(courseData) {
    const { title, description, category, modality, teacherId } = courseData;
    
    if (!title) throw new Error('El título del curso es obligatorio');
    if (!description) throw new Error('La descripción del curso es obligatoria');
    if (!category) throw new Error('La categoría del curso es obligatoria');
    if (!modality) throw new Error('La modalidad del curso es obligatoria');
    if (!teacherId) throw new Error('El ID del profesor es obligatorio');
    
    if (modality !== 'synchronized' && modality !== 'asynchronized') {
      throw new Error('La modalidad debe ser "synchronized" o "asynchronized"');
    }
    
    this.validateModalityFields(modality, courseData);
  }
  
  /**
   * Valida campos específicos según la modalidad del curso
   * @param {string} modality - Modalidad del curso
   * @param {Object} courseData - Datos del curso
   */
  static validateModalityFields(modality, courseData) {
    if (modality === 'synchronized') {
      if (!courseData.startDate || !courseData.endDate) {
        throw new Error('Para cursos sincronizados, se requieren fechas de inicio y fin');
      }
    } else if (modality === 'asynchronized') {
      if (!courseData.durationDays) {
        throw new Error('Para cursos asíncronos, se requiere la duración en días');
      }
    }
  }
}

module.exports = CourseModel;
