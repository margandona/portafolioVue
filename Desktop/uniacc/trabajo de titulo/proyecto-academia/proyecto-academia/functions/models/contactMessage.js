const admin = require('../config/firebase');
const db = admin.firestore();

class ContactMessage {
  constructor(data) {
    this.name = data.name;
    this.email = data.email;
    this.subject = data.subject;
    this.message = data.message;
    this.messageId = data.messageId;
    this.submittedAt = data.submittedAt || new Date().toISOString();
    this.sourceUrl = data.sourceUrl || '';
    this.referrer = data.referrer || '';
    this.metadata = data.metadata || {};
    this.status = data.status || 'new'; // new, read, replied
    this.isRead = data.isRead || false;
    this.tags = data.tags || [];
  }

  static async create(data) {
    try {
      const messageData = new ContactMessage(data);
      const docRef = await db.collection('contactMessages').add({
        ...messageData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return {
        id: docRef.id,
        ...messageData
      };
    } catch (error) {
      throw new Error(`Error creating contact message: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const doc = await db.collection('contactMessages').doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      throw new Error(`Error finding contact message: ${error.message}`);
    }
  }

  static async findAll(options = {}) {
    try {
      let query = db.collection('contactMessages');
      
      // Apply filters
      if (options.status) {
        query = query.where('status', '==', options.status);
      }
      
      if (options.isRead !== undefined) {
        query = query.where('isRead', '==', options.isRead);
      }
      
      // Apply sorting
      if (options.orderBy) {
        const [field, direction] = options.orderBy.split(':');
        query = query.orderBy(field, direction || 'desc');
      } else {
        query = query.orderBy('submittedAt', 'desc');
      }
      
      // Apply pagination
      if (options.limit) {
        query = query.limit(parseInt(options.limit));
      }
      
      const snapshot = await query.get();
      const messages = [];
      
      snapshot.forEach(doc => {
        messages.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return messages;
    } catch (error) {
      throw new Error(`Error finding contact messages: ${error.message}`);
    }
  }

  static async updateStatus(id, status, isRead = true) {
    try {
      await db.collection('contactMessages').doc(id).update({
        status,
        isRead,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return {
        id,
        status,
        isRead,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Error updating contact message status: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      await db.collection('contactMessages').doc(id).delete();
      return true;
    } catch (error) {
      throw new Error(`Error deleting contact message: ${error.message}`);
    }
  }
}

module.exports = ContactMessage;
