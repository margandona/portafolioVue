const CourseModel = require('../models/courseModel');
const EnrollmentModel = require('../models/enrollmentModel');
const admin = require('../config/firebase');
const db = admin.firestore();

// Listar todos los cursos según el rol del usuario
const listCourses = async (req, res) => {
  try {
    const coursesRef = db.collection('courses');
    const snapshot = await coursesRef.get();
    
    if (snapshot.empty) {
      return res.status(200).json({ courses: [] });
    }
    
    const courses = [];
    snapshot.forEach(doc => {
      const courseData = doc.data();
      // Asegurar que el precio total esté calculado para cada curso
      if (courseData.netPrice) {
        courseData.totalPrice = CourseModel.calculateTotalPrice(courseData.netPrice);
      }
      
      courses.push({
        id: doc.id,
        ...courseData
      });
    });
    
    return res.status(200).json({ courses });
  } catch (error) {
    console.error("Error al listar cursos:", error);
    return res.status(500).json({
      message: "Error al obtener los cursos",
      details: error.message
    });
  }
};

// Listar cursos disponibles para inscripción
const listAvailableCourses = async (req, res) => {
  try {
    const availableCourses = await CourseModel.findAvailableForStudent(req.user.uid);
    res.status(200).json(availableCourses);
  } catch (error) {
    console.error('Error al listar cursos disponibles:', error);
    res.status(500).json({ message: 'Error al obtener los cursos disponibles', details: error.message });
  }
};

// Listar cursos inscritos
const listEnrolledCourses = async (req, res) => {
  try {
    const enrolledCourses = await CourseModel.findEnrolledByStudent(req.user.uid);
    res.status(200).json(enrolledCourses);
  } catch (error) {
    console.error('Error al listar cursos inscritos:', error);
    res.status(500).json({ message: 'Error al obtener los cursos inscritos', details: error.message });
  }
};

// Inscribir al usuario en un curso
const enrollInCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    
    try {
      const enrollment = await EnrollmentModel.create(req.user.uid, courseId);
      res.status(201).json({ 
        message: 'Inscripción exitosa', 
        enrollment
      });
    } catch (error) {
      if (error.message === 'El usuario ya está inscrito en este curso') {
        return res.status(400).json({ message: error.message });
      }
      if (error.message === 'Curso no encontrado') {
        return res.status(404).json({ message: error.message });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error al inscribirse en el curso:', error);
    res.status(500).json({ message: 'Error al inscribirse en el curso', details: error.message });
  }
};

// Obtener un curso por ID
const getCourseById = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await CourseModel.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    
    // Incluir información para compra
    if (req.user && req.user.role === 'student') {
      // Verificar si el usuario ya compró este curso
      const salesSnapshot = await db.collection('sales')
        .where('userId', '==', req.user.uid)
        .where('courseId', '==', courseId)
        .where('status', 'in', ['paid', 'completed'])
        .limit(1)
        .get();
      
      course.purchased = !salesSnapshot.empty;
      
      // Verificar si hay una venta pendiente
      const pendingSaleSnapshot = await db.collection('sales')
        .where('userId', '==', req.user.uid)
        .where('courseId', '==', courseId)
        .where('status', '==', 'pending')
        .limit(1)
        .get();
      
      course.hasPendingSale = !pendingSaleSnapshot.empty;
      if (course.hasPendingSale) {
        course.pendingSaleId = pendingSaleSnapshot.docs[0].id;
      }
    }
    
    res.status(200).json(course);
  } catch (error) {
    console.error('Error al obtener el curso:', error);
    res.status(500).json({ message: 'Error al obtener el curso', details: error.message });
  }
};

// Crear un nuevo curso
const createCourse = async (req, res) => {
  try {
    const courseData = req.body;
    const user = req.user;
    
    // Handle instructor_id based on user role
    if (!courseData.instructor_id) {
      // If no instructor_id provided in request
      if (user.role === 'teacher') {
        // For teachers, automatically use their own ID
        courseData.instructor_id = user.uid;
      } else if (user.role === 'admin') {
        // Admins can create courses but must specify a teacher ID
        return res.status(400).json({
          message: "Error al crear el curso",
          details: "El ID del profesor es obligatorio para administradores"
        });
      } else {
        // Students or other roles shouldn't be creating courses
        return res.status(403).json({
          message: "Acceso denegado",
          details: "No tienes permisos para crear cursos"
        });
      }
    } else {
      // If instructor_id was provided, only admins can assign to other teachers
      if (user.role !== 'admin' && courseData.instructor_id !== user.uid) {
        return res.status(403).json({
          message: "Acceso denegado",
          details: "Solo puedes crear cursos asignados a ti mismo"
        });
      }
    }
    
    // Crear el curso usando el modelo mejorado
    try {
      const course = await CourseModel.create(courseData);
      
      return res.status(201).json({
        message: "Curso creado exitosamente",
        course_id: course.id,
        course
      });
    } catch (modelError) {
      // Capturar errores de validación del modelo
      return res.status(400).json({
        message: "Error al crear el curso",
        details: modelError.message
      });
    }
  } catch (error) {
    console.error('Error al crear curso:', error);
    return res.status(500).json({
      message: "Error al crear el curso",
      details: error.message
    });
  }
};

// Actualizar un curso existente
const updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const courseData = req.body;
    
    console.log('Received course update data:', courseData);
    
    // Verificar datos mínimos requeridos
    if (!courseData || Object.keys(courseData).length === 0) {
      return res.status(400).json({
        message: "Error al actualizar el curso",
        details: "No se proporcionaron datos para actualizar"
      });
    }
    
    // Verificar que el curso existe
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    
    const existingCourse = courseDoc.data();

    // Si se está actualizando la modalidad, validar los campos específicos
    if (courseData.modality) {
      // Para cursos asíncronos, verificar que se proporcione duration_days
      if (courseData.modality === 'asynchronized') {
        if (courseData.duration_days === undefined || courseData.duration_days === null) {
          // Si no se proporciona en la actualización, verificar si el curso ya tenía duración
          if (!existingCourse.duration_days) {
            return res.status(400).json({
              message: "Error al actualizar el curso",
              details: "La duración en días es obligatoria para cursos asincrónicos"
            });
          }
        } else if (isNaN(parseInt(courseData.duration_days)) || parseInt(courseData.duration_days) <= 0) {
          return res.status(400).json({
            message: "Error al actualizar el curso",
            details: "La duración debe ser un número mayor a 0"
          });
        }
        
        // Asegurarse de que duration_days sea un número
        courseData.duration_days = parseInt(courseData.duration_days);
      }
      
      // Para cursos sincronizados, verificar fechas de inicio/fin
      if (courseData.modality === 'synchronized') {
        if ((!courseData.start_date && !existingCourse.start_date) || 
            (!courseData.end_date && !existingCourse.end_date)) {
          return res.status(400).json({
            message: "Error al actualizar el curso",
            details: "Las fechas de inicio y fin son obligatorias para cursos sincronizados"
          });
        }
      }
    }
    
    // Handle key name inconsistencies
    if (courseData.teacherId && !courseData.instructor_id) {
      courseData.instructor_id = courseData.teacherId;
    }
    
    if (!courseData.teacherId && courseData.instructor_id) {
      courseData.teacherId = courseData.instructor_id;
    }
    
    // Handle date fields
    ['start_date', 'end_date'].forEach(dateField => {
      if (courseData[dateField]) {
        try {
          // Convert string date to Firestore timestamp
          courseData[dateField] = admin.firestore.Timestamp.fromDate(new Date(courseData[dateField]));
        } catch (error) {
          console.warn(`Could not convert ${dateField} to Timestamp:`, error);
        }
      }
    });
    
    // Combine existing course data with updates for complete validation
    const combinedData = { ...existingCourse, ...courseData };
    
    // Log the final data that will be used for the update
    console.log('Final data for update:', combinedData);
    
    // Actualizar el curso usando el modelo mejorado
    try {
      const course = await CourseModel.update(courseId, courseData);
      
      res.status(200).json({
        message: 'Curso actualizado exitosamente',
        course
      });
    } catch (modelError) {
      // Capturar errores de validación del modelo
      console.error('Model validation error:', modelError);
      return res.status(400).json({
        message: "Error al actualizar el curso",
        details: modelError.message
      });
    }
  } catch (error) {
    console.error('Error al actualizar el curso:', error);
    res.status(500).json({ 
      message: 'Error al actualizar el curso', 
      details: error.message 
    });
  }
};

// Eliminar un curso
const deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    
    await CourseModel.delete(courseId);
    
    res.status(200).json({ message: 'Curso y sus inscripciones eliminados exitosamente' });
  } catch (error) {
    console.error('Error al eliminar el curso:', error);
    res.status(500).json({ message: 'Error al eliminar el curso', details: error.message });
  }
};

// Agregar un nuevo endpoint para iniciar el proceso de compra
const initiatePurchase = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.uid;
    
    // Verificar que el usuario es un estudiante
    if (req.user.role !== 'student') {
      return res.status(403).json({
        message: "Solo los estudiantes pueden comprar cursos"
      });
    }
    
    // Verificar que el curso existe
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    
    // Verificar que el estudiante no sea el profesor del curso
    if (course.teacherId === userId || course.instructor_id === userId) {
      return res.status(400).json({
        message: "No puedes comprar tu propio curso"
      });
    }
    
    // Verificar si ya existe una venta pendiente
    const existingSale = await db.collection('sales')
      .where('userId', '==', userId)
      .where('courseId', '==', courseId)
      .where('status', '==', 'pending')
      .limit(1)
      .get();
      
    if (!existingSale.empty) {
      return res.status(200).json({ 
        message: 'Ya tienes una compra pendiente para este curso',
        saleId: existingSale.docs[0].id,
        redirectTo: `/checkout/${existingSale.docs[0].id}`
      });
    }
    
    // Crear la venta en estado pendiente
    const SaleModel = require('../models/saleModel');
    const sale = await SaleModel.create(userId, courseId);
    
    res.status(201).json({
      message: 'Proceso de compra iniciado',
      saleId: sale.id,
      redirectTo: `/checkout/${sale.id}`
    });
  } catch (error) {
    console.error('Error al iniciar compra:', error);
    res.status(500).json({ 
      message: 'Error al iniciar el proceso de compra', 
      details: error.message 
    });
  }
};

// Aplicar descuento a un curso
const applyCourseDiscount = async (req, res) => {
  try {
    const courseId = req.params.id;
    const discountData = req.body;
    
    // Validar datos mínimos
    if (discountData.discount === undefined) {
      return res.status(400).json({
        message: "El porcentaje de descuento es obligatorio"
      });
    }
    
    // Solo profesores del curso o administradores pueden aplicar descuentos
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    
    const courseData = courseDoc.data();
    const isTeacher = courseData.teacherId === req.user.uid || courseData.instructor_id === req.user.uid;
    const isAdmin = req.user.role === 'admin';
    
    if (!isTeacher && !isAdmin) {
      return res.status(403).json({
        message: "No tienes permiso para modificar este curso"
      });
    }
    
    // Aplicar el descuento
    const updatedCourse = await CourseModel.applyDiscount(courseId, discountData);
    
    res.status(200).json({
      message: 'Descuento aplicado exitosamente',
      course: updatedCourse
    });
  } catch (error) {
    console.error('Error al aplicar descuento:', error);
    res.status(500).json({
      message: 'Error al aplicar el descuento',
      details: error.message
    });
  }
};

// Eliminar descuento de un curso
const removeCourseDiscount = async (req, res) => {
  try {
    const courseId = req.params.id;
    
    // Solo profesores del curso o administradores pueden eliminar descuentos
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    
    const courseData = courseDoc.data();
    const isTeacher = courseData.teacherId === req.user.uid || courseData.instructor_id === req.user.uid;
    const isAdmin = req.user.role === 'admin';
    
    if (!isTeacher && !isAdmin) {
      return res.status(403).json({
        message: "No tienes permiso para modificar este curso"
      });
    }
    
    // Eliminar el descuento
    const updatedCourse = await CourseModel.removeDiscount(courseId);
    
    res.status(200).json({
      message: 'Descuento eliminado exitosamente',
      course: updatedCourse
    });
  } catch (error) {
    console.error('Error al eliminar descuento:', error);
    res.status(500).json({
      message: 'Error al eliminar el descuento',
      details: error.message
    });
  }
};

// Asignar curso gratuitamente a un estudiante
const assignFreeCourseAccess = async (req, res) => {
  try {
    const courseId = req.params.id;
    const { userId, reason } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        message: 'El ID del usuario es requerido' 
      });
    }
    
    // Verificar que el curso existe
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    
    // Solo profesores del curso o administradores pueden asignar acceso gratuito
    const isTeacher = course.teacherId === req.user.uid || course.instructor_id === req.user.uid;
    const isAdmin = req.user.role === 'admin';
    
    if (!isTeacher && !isAdmin) {
      return res.status(403).json({
        message: "No tienes permiso para asignar acceso gratuito a este curso"
      });
    }
    
    // Verificar que el usuario existe
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Verificar que el usuario no sea ya el profesor del curso
    if (userId === course.teacherId || userId === course.instructor_id) {
      return res.status(400).json({
        message: "El profesor del curso ya tiene acceso completo"
      });
    }
    
    // Verificar si el usuario ya está inscrito
    const existingEnrollment = await db.collection('enrollments')
      .where('userId', '==', userId)
      .where('courseId', '==', courseId)
      .limit(1)
      .get();
      
    if (!existingEnrollment.empty) {
      return res.status(400).json({ 
        message: 'El usuario ya está inscrito en este curso' 
      });
    }
    
    // Crear una venta gratuita para registrar la asignación
    const SaleModel = require('../models/saleModel');
    const sale = await SaleModel.create(userId, courseId, {
      specialAssignment: true,
      assignedBy: req.user.uid,
      assignmentReason: reason || 'Asignación especial',
      originalPrice: course.netPrice,
    });
    
    // Completar la venta automáticamente para crear la inscripción
    await SaleModel.updateStatus(
      sale.id,
      SaleModel.STATUS.COMPLETED,
      'Acceso gratuito asignado por instructor o administrador'
    );
    
    res.status(201).json({
      message: 'Acceso gratuito asignado exitosamente',
      sale
    });
  } catch (error) {
    console.error('Error al asignar acceso gratuito:', error);
    res.status(500).json({
      message: 'Error al asignar acceso gratuito',
      details: error.message
    });
  }
};

module.exports = {
  listCourses,
  listAvailableCourses,
  listEnrolledCourses,
  enrollInCourse,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  initiatePurchase,
  applyCourseDiscount,     // Nueva función
  removeCourseDiscount,    // Nueva función
  assignFreeCourseAccess   // Nueva función
};
