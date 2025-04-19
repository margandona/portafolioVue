const admin = require('../config/firebase');
const db = admin.firestore();

// Obtener información de un usuario
const getUserInfo = async (req, res) => {
  try {
    const userId = req.params.id === 'me' ? req.user.uid : req.params.id;

    if (!userId) {
      return res.status(400).json({ message: 'El ID del usuario es requerido.' });
    }

    // Buscar el usuario en Firestore
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const userData = userDoc.data();
    
    // Eliminar la contraseña del objeto para no enviarla al cliente
    delete userData.password;

    res.status(200).json({
      id: userDoc.id,
      ...userData
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor', details: error.message });
  }
};

// Buscar usuarios por correo electrónico, ID o nombre
const searchUser = async (req, res) => {
  try {
    const { id, email, name } = req.query;

    if (!id && !email && !name) {
      return res.status(400).json({ message: 'Debes proporcionar un ID, email o nombre para buscar.' });
    }

    let usersRef = db.collection('users');
    let query = usersRef;
    
    // Aplicar filtros según los parámetros recibidos
    if (id) {
      // Buscar por ID exacto
      const userDoc = await usersRef.doc(id).get();
      if (!userDoc.exists) {
        return res.status(404).json({ message: 'No se encontraron usuarios con el ID especificado.' });
      }
      const userData = userDoc.data();
      delete userData.password;
      return res.status(200).json([{
        id: userDoc.id,
        ...userData
      }]);
    } else if (email) {
      // Buscar por email exacto
      query = usersRef.where('email', '==', email);
    } else if (name) {
      // Buscar nombres que contengan la cadena de búsqueda
      // Nota: Firestore no soporta búsquedas parciales directamente
      // Esta es una aproximación limitada, para búsquedas más complejas necesitarías Algolia, ElasticSearch, etc.
      query = usersRef.orderBy('name')
                      .startAt(name)
                      .endAt(name + '\uf8ff');
    }

    const snapshot = await query.get();
    
    if (snapshot.empty) {
      return res.status(404).json({ message: 'No se encontraron usuarios con los criterios especificados.' });
    }

    const users = [];
    
    snapshot.forEach(doc => {
      const userData = doc.data();
      delete userData.password;
      users.push({
        id: doc.id,
        ...userData
      });
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('Error al buscar usuarios:', error);
    res.status(500).json({ message: 'Error interno al buscar usuarios.', details: error.message });
  }
};

// Listar todos los usuarios (solo admin)
const getAllUsers = async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    
    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const users = [];
    
    snapshot.forEach(doc => {
      const userData = doc.data();
      delete userData.password;
      users.push({
        id: doc.id,
        ...userData
      });
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('Error al obtener todos los usuarios:', error);
    res.status(500).json({ message: 'Error al obtener todos los usuarios.', details: error.message });
  }
};

// Crear un nuevo usuario (solo admin)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nombre, email y password son campos obligatorios.' });
    }

    // Validar rol
    const validRoles = ['student', 'teacher', 'admin'];
    const userRole = role || 'student'; // Si no se especifica, asignar rol de estudiante
    
    if (!validRoles.includes(userRole)) {
      return res.status(400).json({ message: `Rol inválido. Los roles permitidos son: ${validRoles.join(', ')}.` });
    }

    // Verificar si el email ya existe
    const existingUserSnapshot = await db.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!existingUserSnapshot.empty) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
    }

    // Crear usuario en Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Crear documento en Firestore
    await db.collection('users').doc(userRecord.uid).set({
      name,
      email,
      role: userRole,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Establecer rol personalizado si no es estudiante (rol por defecto)
    if (userRole !== 'student') {
      try {
        // Actualizar reclamaciones personalizadas (claims) para control de acceso
        await admin.auth().setCustomUserClaims(userRecord.uid, { role: userRole });
      } catch (claimError) {
        console.error('Error al establecer permisos de usuario:', claimError);
      }
    }

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: {
        id: userRecord.uid,
        name,
        email,
        role: userRole,
        createdAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ message: 'Error al crear usuario.', details: error.message });
  }
};

// Actualizar información del usuario
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id === 'me' ? req.user.uid : req.params.id;

    // Verificar permisos
    if (userId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permiso para actualizar la información de este usuario.' });
    }

    // Verificar si el usuario existe
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const userData = userDoc.data();
    const updateData = {};

    // Actualizar email
    if (req.body.email && req.body.email !== userData.email) {
      // Verificar que el email no esté en uso
      const emailCheck = await db.collection('users')
        .where('email', '==', req.body.email)
        .limit(1)
        .get();
      
      if (!emailCheck.empty && emailCheck.docs[0].id !== userId) {
        return res.status(400).json({ message: 'El correo electrónico ya está siendo utilizado.' });
      }

      // Actualizar email en Authentication
      await admin.auth().updateUser(userId, { email: req.body.email });
      updateData.email = req.body.email;
    }

    // Actualizar nombre
    if (req.body.name && req.body.name !== userData.name) {
      // Actualizar displayName en Authentication
      await admin.auth().updateUser(userId, { displayName: req.body.name });
      updateData.name = req.body.name;
    }

    // Actualizar contraseña (si se proporciona)
    if (req.body.password) {
      await admin.auth().updateUser(userId, { password: req.body.password });
    }

    // Actualizar rol (solo administradores)
    if (req.body.role && req.user.role === 'admin' && req.body.role !== userData.role) {
      const validRoles = ['student', 'teacher', 'admin'];
      
      if (!validRoles.includes(req.body.role)) {
        return res.status(400).json({ message: `Rol inválido. Los roles permitidos son: ${validRoles.join(', ')}.` });
      }

      updateData.role = req.body.role;
      await admin.auth().setCustomUserClaims(userId, { role: req.body.role });
    }

    // Actualizar timestamp
    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    // Actualizar en Firestore si hay cambios
    if (Object.keys(updateData).length > 0) {
      await db.collection('users').doc(userId).update(updateData);
    }

    // Obtener los datos actualizados
    const updatedUserDoc = await db.collection('users').doc(userId).get();
    const updatedUserData = updatedUserDoc.data();
    delete updatedUserData.password;

    res.status(200).json({
      message: 'Usuario actualizado correctamente.',
      user: {
        id: userId,
        ...updatedUserData
      }
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error al actualizar usuario.', details: error.message });
  }
};

// Eliminar un usuario
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Verificar si el usuario existe
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Verificar permisos para eliminar usuarios
    if (req.user.role !== 'admin' && userId !== req.user.uid) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar este usuario.' });
    }

    // Eliminar datos relacionados
    const batch = db.batch();
    
    // Eliminar inscripciones
    const enrollmentsSnapshot = await db.collection('enrollments')
      .where('userId', '==', userId)
      .get();
    
    enrollmentsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Eliminar cursos (si es profesor)
    if (userDoc.data().role === 'teacher') {
      const coursesSnapshot = await db.collection('courses')
        .where('teacherId', '==', userId)
        .get();
      
      coursesSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
    }
    
    // Eliminar respuestas a evaluaciones
    const responsesSnapshot = await db.collection('responses')
      .where('userId', '==', userId)
      .get();
    
    responsesSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Eliminar el documento de usuario
    batch.delete(db.collection('users').doc(userId));
    
    // Ejecutar batch
    await batch.commit();
    
    // Eliminar usuario en Authentication
    await admin.auth().deleteUser(userId);

    res.status(200).json({ message: 'Usuario y datos asociados eliminados correctamente.' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error al eliminar usuario.', details: error.message });
  }
};

module.exports = {
  getUserInfo,
  searchUser,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};
