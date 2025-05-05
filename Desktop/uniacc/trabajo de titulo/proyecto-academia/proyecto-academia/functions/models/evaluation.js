// Evaluation model for Firebase Functions
const admin = require('../config/firebase');
const db = admin.firestore();

class Evaluation {
  constructor(data = {}) {
    this.id = data.id || null;
    this.course_id = data.course_id || null;
    this.title = data.title || '';
    this.description = data.description || '';
    this.due_date = data.due_date || null;
    this.max_score = data.max_score || 100;
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  static async findById(id) {
    try {
      const doc = await db.collection('evaluations').doc(id).get();
      
      if (!doc.exists) return null;
      
      return new Evaluation({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error('Error in Evaluation.findById:', error);
      throw error;
    }
  }

  static async findByCourse(courseId) {
    try {
      const snapshot = await db.collection('evaluations')
        .where('course_id', '==', courseId)
        .get();
      
      return snapshot.docs.map(doc => new Evaluation({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error in Evaluation.findByCourse:', error);
      throw error;
    }
  }
}

module.exports = Evaluation;
