// Simplified Enrollment model for Firebase Functions
const admin = require('../config/firebase');
const db = admin.firestore();

class Enrollment {
  constructor(data = {}) {
    this.id = data.id || null;
    this.user_id = data.user_id || null;
    this.course_id = data.course_id || null;
  }

  static async findOne(where = {}) {
    try {
      let query = db.collection('enrollments');
      
      if (where.user_id && where.course_id) {
        query = query
          .where('user_id', '==', where.user_id)
          .where('course_id', '==', where.course_id);
      }
      
      const snapshot = await query.limit(1).get();
      
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      return new Enrollment({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error('Error in Enrollment.findOne:', error);
      throw error;
    }
  }
}

module.exports = Enrollment;
