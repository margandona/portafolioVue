// Course model for Firebase Functions
const admin = require('../config/firebase');
const db = admin.firestore();

class Course {
  constructor(data = {}) {
    this.id = data.id || null;
    this.title = data.title || '';
    this.description = data.description || '';
    this.instructor_id = data.instructor_id || null;
    this.category = data.category || '';
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  static async findById(id) {
    try {
      const doc = await db.collection('courses').doc(id).get();
      
      if (!doc.exists) return null;
      
      return new Course({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error('Error in Course.findById:', error);
      throw error;
    }
  }

  static async findAll(where = {}) {
    try {
      let query = db.collection('courses');
      
      if (where.instructor_id) {
        query = query.where('instructor_id', '==', where.instructor_id);
      }
      
      if (where.category) {
        query = query.where('category', '==', where.category);
      }
      
      const snapshot = await query.get();
      return snapshot.docs.map(doc => new Course({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error in Course.findAll:', error);
      throw error;
    }
  }
}

module.exports = Course;
