const admin = require('../config/firebase');
const db = admin.firestore();
const coursesCollection = db.collection('courses');
const enrollmentsCollection = db.collection('enrollments');
const usersCollection = db.collection('users');

/**
 * Modelo para manejar operaciones relacionadas con cursos en Firestore
 */
class CourseModel {
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
   * @param {Object} courseData - Datos del curso
   * @returns {Promise<Object>} El curso creado
   */
  static async create(courseData) {
    try {
      // Validar datos básicos
      this.validateCourseData(courseData);
      
      // Añadir timestamps
      const dataWithTimestamps = {
        ...courseData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      // Crear el curso
      const docRef = await coursesCollection.add(dataWithTimestamps);
      
      // Obtener el curso recién creado
      const newCourseDoc = await docRef.get();
      return {
        id: docRef.id,
        ...newCourseDoc.data()
      };
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
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
      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      };
    } catch (error) {
      console.error('Error en update:', error);
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
