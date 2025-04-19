const admin = require('../config/firebase');
const db = admin.firestore();

// Listar todos los cursos según el rol del usuario
const listCourses = async (req, res) => {
  try {
    let coursesRef = db.collection('courses');
    let query = coursesRef;

    // Filtrar por profesor si el usuario es un profesor
    if (req.user.role === 'teacher') {
      query = coursesRef.where('teacherId', '==', req.user.uid);
    }
    // Para estudiantes, obtener solo los cursos en los que están inscritos
    else if (req.user.role === 'student') {
      const enrollmentsSnapshot = await db.collection('enrollments')
        .where('userId', '==', req.user.uid)
        .get();
      
      if (enrollmentsSnapshot.empty) {
        return res.status(200).json([]);
      }
      
      const courseIds = enrollmentsSnapshot.docs.map(doc => doc.data().courseId);
      
      // Si no hay inscripciones, devolver array vacío
      if (courseIds.length === 0) {
        return res.status(200).json([]);
      }
      
      // Firestore no permite directamente buscar por un array de IDs, hay que usar in
      // Si hay muchos IDs, podríamos necesitar dividir en múltiples consultas
      query = coursesRef.where(admin.firestore.FieldPath.documentId(), 'in', courseIds);
    }

    const snapshot = await query.get();
    
    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const courses = [];
    
    for (const doc of snapshot.docs) {
      const courseData = doc.data();
      const teacherDoc = await db.collection('users').doc(courseData.teacherId).get();
      
      courses.push({
        id: doc.id,
        ...courseData,
        teacher: teacherDoc.exists ? {
          id: teacherDoc.id,
          name: teacherDoc.data().name,
          email: teacherDoc.data().email
        } : null
      });
    }

    res.status(200).json(courses);
  } catch (error) {
    console.error('Error al listar cursos:', error);
    res.status(500).json({ message: 'Error al obtener los cursos', details: error.message });
  }
};

// Listar cursos disponibles para inscripción
const listAvailableCourses = async (req, res) => {
  try {
    // Obtener IDs de cursos ya inscritos
    const enrollmentsSnapshot = await db.collection('enrollments')
      .where('userId', '==', req.user.uid)
      .get();
    
    const enrolledCourseIds = enrollmentsSnapshot.docs.map(doc => doc.data().courseId);
    
    // Obtener todos los cursos
    const coursesSnapshot = await db.collection('courses').get();
    
    if (coursesSnapshot.empty) {
      return res.status(200).json([]);
    }
    
    const availableCourses = [];
    
    for (const doc of coursesSnapshot.docs) {
      // Si el curso no está en la lista de inscritos, está disponible
      if (!enrolledCourseIds.includes(doc.id)) {
        const courseData = doc.data();
        const teacherDoc = await db.collection('users').doc(courseData.teacherId).get();
        
        availableCourses.push({
          id: doc.id,
          ...courseData,
          teacher: teacherDoc.exists ? {
            id: teacherDoc.id,
            name: teacherDoc.data().name,
            email: teacherDoc.data().email
          } : null
        });
      }
    }
    
    res.status(200).json(availableCourses);
  } catch (error) {
    console.error('Error al listar cursos disponibles:', error);
    res.status(500).json({ message: 'Error al obtener los cursos disponibles', details: error.message });
  }
};

// Listar cursos inscritos
const listEnrolledCourses = async (req, res) => {
  try {
    const enrollmentsSnapshot = await db.collection('enrollments')
      .where('userId', '==', req.user.uid)
      .get();
    
    if (enrollmentsSnapshot.empty) {
      return res.status(200).json([]);
    }
    
    const enrolledCourses = [];
    
    for (const doc of enrollmentsSnapshot.docs) {
      const enrollmentData = doc.data();
      const courseDoc = await db.collection('courses').doc(enrollmentData.courseId).get();
      
      if (courseDoc.exists) {
        const courseData = courseDoc.data();
        const teacherDoc = await db.collection('users').doc(courseData.teacherId).get();
        
        enrolledCourses.push({
          id: courseDoc.id,
          ...courseData,
          enrollment: {
            id: doc.id,
            progress: enrollmentData.progress,
            completedEvaluations: enrollmentData.completedEvaluations || []
          },
          teacher: teacherDoc.exists ? {
            id: teacherDoc.id,
            name: teacherDoc.data().name,
            email: teacherDoc.data().email
          } : null
        });
      }
    }
    
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
    
    // Verificar que el curso existe
    const courseDoc = await db.collection('courses').doc(courseId).get();
    
    if (!courseDoc.exists) {
      return res.status(404).json({ message: 'El curso no existe' });
    }
    
    // Verificar si ya está inscrito
    const enrollmentSnapshot = await db.collection('enrollments')
      .where('userId', '==', req.user.uid)
      .where('courseId', '==', courseId)
      .limit(1)
      .get();
    
    if (!enrollmentSnapshot.empty) {
      return res.status(400).json({ message: 'Ya estás inscrito en este curso' });
    }
    
    // Crear la inscripción
    const enrollmentRef = await db.collection('enrollments').add({
      userId: req.user.uid,
      courseId: courseId,
      progress: 0,
      completedEvaluations: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(201).json({ 
      message: 'Inscripción exitosa', 
      enrollment: {
        id: enrollmentRef.id,
        courseId: courseId,
        userId: req.user.uid
      }
    });
  } catch (error) {
    console.error('Error al inscribirse en el curso:', error);
    res.status(500).json({ message: 'Error al inscribirse en el curso', details: error.message });
  }
};

// Obtener un curso por ID
const getCourseById = async (req, res) => {
  try {
    const courseId = req.params.id;
    const courseDoc = await db.collection('courses').doc(courseId).get();
    
    if (!courseDoc.exists) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    
    const courseData = courseDoc.data();
    const teacherDoc = await db.collection('users').doc(courseData.teacherId).get();
    
    res.status(200).json({
      id: courseDoc.id,
      ...courseData,
      teacher: teacherDoc.exists ? {
        id: teacherDoc.id,
        name: teacherDoc.data().name,
        email: teacherDoc.data().email
      } : null
    });
  } catch (error) {
    console.error('Error al obtener el curso:', error);
    res.status(500).json({ message: 'Error al obtener el curso', details: error.message });
  }
};

// Crear un nuevo curso
const createCourse = async (req, res) => {
  try {
    const { title, description, category, modality, durationDays, startDate, endDate } = req.body;
    
    if (!title || !description || !category || !modality) {
      return res.status(400).json({ message: 'Los campos título, descripción, categoría y modalidad son obligatorios' });
    }
    
    // Validar la modalidad
    if (modality !== 'synchronized' && modality !== 'asynchronized') {
      return res.status(400).json({ message: 'La modalidad debe ser "synchronized" o "asynchronized"' });
    }
    
    // Validar campos según la modalidad
    if (modality === 'synchronized') {
      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Para cursos sincronizados, se requieren fechas de inicio y fin' });
      }
    } else {
      if (!durationDays) {
        return res.status(400).json({ message: 'Para cursos asíncronos, se requiere la duración en días' });
      }
    }
    
    // Crear el curso en Firestore
    const courseData = {
      title,
      description,
      category,
      modality,
      teacherId: req.user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Añadir campos según la modalidad
    if (modality === 'synchronized') {
      courseData.startDate = new Date(startDate);
      courseData.endDate = new Date(endDate);
    } else {
      courseData.durationDays = parseInt(durationDays);
    }
    
    const courseRef = await db.collection('courses').add(courseData);
    
    res.status(201).json({
      message: 'Curso creado exitosamente',
      course: {
        id: courseRef.id,
        ...courseData
      }
    });
  } catch (error) {
    console.error('Error al crear el curso:', error);
    res.status(500).json({ message: 'Error al crear el curso', details: error.message });
  }
};

// Actualizar un curso existente
const updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const courseDoc = await db.collection('courses').doc(courseId).get();
    
    if (!courseDoc.exists) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    
    const courseData = courseDoc.data();
    
    // Verificar permisos (ya manejados por el middleware hasCourseAccess)
    if (courseData.teacherId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para actualizar este curso' });
    }
    
    const { title, description, category, modality, durationDays, startDate, endDate } = req.body;
    
    // Validar la modalidad si se está actualizando
    if (modality && modality !== 'synchronized' && modality !== 'asynchronized') {
      return res.status(400).json({ message: 'La modalidad debe ser "synchronized" o "asynchronized"' });
    }
    
    // Preparar datos de actualización
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    
    if (modality) {
      updateData.modality = modality;
      
      // Actualizar campos según la modalidad
      if (modality === 'synchronized') {
        if (startDate) updateData.startDate = new Date(startDate);
        if (endDate) updateData.endDate = new Date(endDate);
        // Eliminar durationDays si existe
        updateData.durationDays = admin.firestore.FieldValue.delete();
      } else {
        if (durationDays) updateData.durationDays = parseInt(durationDays);
        // Eliminar fechas si existen
        updateData.startDate = admin.firestore.FieldValue.delete();
        updateData.endDate = admin.firestore.FieldValue.delete();
      }
    } else {
      // Si no se cambia la modalidad, actualizar los campos correspondientes
      if (courseData.modality === 'synchronized') {
        if (startDate) updateData.startDate = new Date(startDate);
        if (endDate) updateData.endDate = new Date(endDate);
      } else {
        if (durationDays) updateData.durationDays = parseInt(durationDays);
      }
    }
    
    // Actualizar el curso
    await db.collection('courses').doc(courseId).update(updateData);
    
    // Obtener el curso actualizado
    const updatedCourseDoc = await db.collection('courses').doc(courseId).get();
    
    res.status(200).json({
      message: 'Curso actualizado exitosamente',
      course: {
        id: updatedCourseDoc.id,
        ...updatedCourseDoc.data()
      }
    });
  } catch (error) {
    console.error('Error al actualizar el curso:', error);
    res.status(500).json({ message: 'Error al actualizar el curso', details: error.message });
  }
};

// Eliminar un curso
const deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const courseDoc = await db.collection('courses').doc(courseId).get();
    
    if (!courseDoc.exists) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    
    const courseData = courseDoc.data();
    
    // Verificar permisos (ya manejados por el middleware hasCourseAccess)
    if (courseData.teacherId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para eliminar este curso' });
    }
    
    // Eliminar inscripciones asociadas
    const enrollmentsSnapshot = await db.collection('enrollments')
      .where('courseId', '==', courseId)
      .get();
    
    // Realizar operaciones de eliminación en un batch
    const batch = db.batch();
    
    // Añadir eliminación de inscripciones al batch
    enrollmentsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Añadir eliminación del curso al batch
    batch.delete(db.collection('courses').doc(courseId));
    
    // Ejecutar el batch
    await batch.commit();
    
    res.status(200).json({ message: 'Curso y sus inscripciones eliminados exitosamente' });
  } catch (error) {
    console.error('Error al eliminar el curso:', error);
    res.status(500).json({ message: 'Error al eliminar el curso', details: error.message });
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
  deleteCourse
};
