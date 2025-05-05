const admin = require('../config/firebase');
const db = admin.firestore();
const usersCollection = db.collection('users');

// Modelo de usuario para Firebase Functions
class User {
  constructor(data) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.email = data.email || '';
    this.phone = data.phone || null;
    this.password = data.password || '';
    this.role = data.role || 'student';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Método estático para encontrar un usuario por email
  static async findOne({ where }) {
    try {
      let query = usersCollection;
      
      if (where.email) {
        query = query.where('email', '==', where.email);
      } else if (where.id) {
        // Si no es email sino ID
        const doc = await usersCollection.doc(where.id).get();
        if (!doc.exists) return null;
        return new User({ id: doc.id, ...doc.data() });
      }
      
      const snapshot = await query.limit(1).get();
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      return new User({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error('Error buscando usuario:', error);
      throw error;
    }
  }

  // Método para buscar usuario por ID (compatible con findByPk de Sequelize)
  static async findByPk(id) {
    try {
      const doc = await usersCollection.doc(id).get();
      if (!doc.exists) return null;
      
      return new User({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error('Error buscando usuario por ID:', error);
      throw error;
    }
  }

  // Método para crear un nuevo usuario
  static async create(userData) {
    try {
      // Si tiene ID específico (UID de Firebase)
      if (userData.id) {
        await usersCollection.doc(userData.id).set({
          name: userData.name,
          email: userData.email,
          phone: userData.phone || null,
          password: userData.password,
          role: userData.role || 'student',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        return new User({ id: userData.id, ...userData });
      } 
      
      // Si no tiene ID, generar uno
      const docRef = await usersCollection.add({
        name: userData.name,
        email: userData.email,
        phone: userData.phone || null,
        password: userData.password,
        role: userData.role || 'student',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      const newDoc = await docRef.get();
      return new User({ id: docRef.id, ...newDoc.data() });
    } catch (error) {
      console.error('Error creando usuario:', error);
      throw error;
    }
  }

  // Método para eliminar un usuario
  async destroy() {
    if (!this.id) throw new Error('ID de usuario no especificado');
    
    try {
      await usersCollection.doc(this.id).delete();
      return true;
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      throw error;
    }
  }

  // Método para actualizar un usuario
  async update(data) {
    if (!this.id) throw new Error('ID de usuario no especificado');
    
    try {
      const updateData = { ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() };
      await usersCollection.doc(this.id).update(updateData);
      
      // Actualiza la instancia con los nuevos datos
      Object.assign(this, data);
      
      return this;
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw error;
    }
  }

  // Método para obtener todos los usuarios
  static async findAll(options = {}) {
    try {
      let query = usersCollection;
      
      // Aplicar filtros si existen
      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          query = query.where(key, '==', value);
        });
      }
      
      // Aplicar límite si existe
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      const snapshot = await query.get();
      if (snapshot.empty) return [];
      
      return snapshot.docs.map(doc => new User({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      throw error;
    }
  }
}

module.exports = User;
