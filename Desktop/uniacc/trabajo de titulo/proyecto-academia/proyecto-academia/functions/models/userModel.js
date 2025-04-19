const admin = require('../config/firebase');
const db = admin.firestore();
const usersCollection = db.collection('users');

/**
 * Modelo para manejar operaciones relacionadas con usuarios en Firestore
 */
class UserModel {
  /**
   * Obtiene un usuario por su ID
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object|null>} Datos del usuario o null si no existe
   */
  static async findById(userId) {
    try {
      const userDoc = await usersCollection.doc(userId).get();
      if (!userDoc.exists) return null;
      
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    } catch (error) {
      console.error('Error en findById:', error);
      throw error;
    }
  }
  
  /**
   * Busca un usuario por su email
   * @param {string} email - Email del usuario
   * @returns {Promise<Object|null>} Datos del usuario o null si no existe
   */
  static async findByEmail(email) {
    try {
      const snapshot = await usersCollection.where('email', '==', email).limit(1).get();
      
      if (snapshot.empty) return null;
      
      const userDoc = snapshot.docs[0];
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    } catch (error) {
      console.error('Error en findByEmail:', error);
      throw error;
    }
  }
  
  /**
   * Crea un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @param {string} userId - ID opcional para el usuario
   * @returns {Promise<Object>} Datos del usuario creado
   */
  static async create(userData, userId = null) {
    try {
      // Si se proporciona un userId, usar ese ID
      if (userId) {
        await usersCollection.doc(userId).set({
          ...userData,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        return { id: userId, ...userData };
      }
      
      // Si no se proporciona ID, dejar que Firestore genere uno
      const docRef = await usersCollection.add({
        ...userData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Obtener el documento recién creado
      const newUserDoc = await docRef.get();
      return {
        id: docRef.id,
        ...newUserDoc.data()
      };
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza un usuario existente
   * @param {string} userId - ID del usuario
   * @param {Object} userData - Datos a actualizar
   * @returns {Promise<Object>} Datos del usuario actualizado
   */
  static async update(userId, userData) {
    try {
      // Verificar que el usuario exista
      const userDoc = await usersCollection.doc(userId).get();
      if (!userDoc.exists) throw new Error('Usuario no encontrado');
      
      // Actualizar datos
      await usersCollection.doc(userId).update({
        ...userData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Obtener datos actualizados
      const updatedDoc = await usersCollection.doc(userId).get();
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
   * Elimina un usuario
   * @param {string} userId - ID del usuario a eliminar
   * @returns {Promise<boolean>} true si se eliminó con éxito
   */
  static async delete(userId) {
    try {
      // Verificar que el usuario exista
      const userDoc = await usersCollection.doc(userId).get();
      if (!userDoc.exists) throw new Error('Usuario no encontrado');
      
      // Eliminar el documento
      await usersCollection.doc(userId).delete();
      return true;
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }
  
  /**
   * Lista todos los usuarios
   * @param {number} limit - Límite de resultados (opcional)
   * @returns {Promise<Array>} Lista de usuarios
   */
  static async findAll(limit = 100) {
    try {
      const snapshot = await usersCollection.limit(limit).get();
      
      if (snapshot.empty) return [];
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error en findAll:', error);
      throw error;
    }
  }
  
  /**
   * Busca usuarios por rol
   * @param {string} role - Rol a buscar ('student', 'teacher', 'admin')
   * @returns {Promise<Array>} Lista de usuarios con ese rol
   */
  static async findByRole(role) {
    try {
      const snapshot = await usersCollection.where('role', '==', role).get();
      
      if (snapshot.empty) return [];
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error en findByRole:', error);
      throw error;
    }
  }
  
  /**
   * Verifica si un email ya está en uso
   * @param {string} email - Email a verificar
   * @returns {Promise<boolean>} true si el email ya existe
   */
  static async emailExists(email) {
    try {
      const user = await this.findByEmail(email);
      return user !== null;
    } catch (error) {
      console.error('Error en emailExists:', error);
      throw error;
    }
  }
}

module.exports = UserModel;
