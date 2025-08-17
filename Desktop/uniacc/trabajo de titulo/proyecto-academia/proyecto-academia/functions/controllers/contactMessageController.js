const admin = require('../config/firebase');
const db = admin.firestore();
const { v4: uuidv4 } = require('uuid');

// Submit a new contact message
const submitMessage = async (req, res) => {
  try {
    const {
      name,
      email,
      subject,
      message,
      privacyAccepted,
      submittedAt,
      sourceUrl,
      referrer,
      metadata
    } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: 'Campos obligatorios faltantes',
        details: 'Nombre, email, asunto y mensaje son obligatorios'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Formato de email inválido',
        details: 'Por favor proporcione una dirección de correo válida'
      });
    }

    // Validate privacy policy acceptance
    if (!privacyAccepted) {
      return res.status(400).json({
        message: 'Política de privacidad no aceptada',
        details: 'Debe aceptar la política de privacidad para enviar el mensaje'
      });
    }

    // Generate a messageId if not provided
    const messageId = uuidv4();
    
    // Prepare message data
    const messageData = {
      messageId,
      name,
      email,
      subject,
      message,
      privacyAccepted,
      submittedAt: submittedAt || new Date().toISOString(),
      sourceUrl,
      referrer,
      status: 'unread',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      metadata: metadata || {}
    };

    // Store in Firestore
    await db.collection('contactMessages').doc(messageId).set(messageData);

    // Return success response
    res.status(201).json({
      message: 'Mensaje enviado exitosamente',
      messageId
    });
  } catch (error) {
    console.error('Error al enviar mensaje de contacto:', error);
    res.status(500).json({
      message: 'Error al procesar el mensaje de contacto',
      details: error.message
    });
  }
};

// Submit a contact message with file attachment
const submitMessageWithAttachment = async (req, res) => {
  try {
    // This would handle file uploads using multer or similar middleware
    // For now, a simple implementation
    const { name, email, subject, message, privacyAccepted } = req.body;
    const attachment = req.file;

    if (!attachment) {
      return res.status(400).json({
        message: 'No se proporcionó ningún archivo',
        details: 'Es necesario adjuntar un archivo'
      });
    }

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: 'Campos obligatorios faltantes',
        details: 'Nombre, email, asunto y mensaje son obligatorios'
      });
    }

    // Generate a messageId
    const messageId = uuidv4();
    
    // Prepare message data
    const messageData = {
      messageId,
      name,
      email,
      subject,
      message,
      privacyAccepted: privacyAccepted === 'true',
      submittedAt: new Date().toISOString(),
      status: 'unread',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      hasAttachment: true,
      attachmentInfo: {
        filename: attachment.originalname,
        mimetype: attachment.mimetype,
        size: attachment.size
      }
    };

    // Store message in Firestore
    await db.collection('contactMessages').doc(messageId).set(messageData);

    // Return success response
    res.status(201).json({
      message: 'Mensaje con adjunto enviado exitosamente',
      messageId
    });
  } catch (error) {
    console.error('Error al enviar mensaje con adjunto:', error);
    res.status(500).json({
      message: 'Error al procesar el mensaje con adjunto',
      details: error.message
    });
  }
};

// Get all messages (Admin only)
const getAllMessages = async (req, res) => {
  try {
    // Handle query parameters for filtering
    const { status, fromDate, toDate } = req.query;
    
    let query = db.collection('contactMessages').orderBy('createdAt', 'desc');
    
    // Apply filters if provided
    if (status && status !== 'all') {
      query = query.where('status', '==', status);
    }
    
    if (fromDate) {
      const fromDateObj = new Date(fromDate);
      query = query.where('createdAt', '>=', fromDateObj);
    }
    
    if (toDate) {
      const toDateObj = new Date(toDate);
      // Add one day to include the entire end date
      toDateObj.setDate(toDateObj.getDate() + 1);
      query = query.where('createdAt', '<', toDateObj);
    }
    
    const snapshot = await query.get();
    
    const messages = [];
    snapshot.forEach(doc => {
      messages.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error al obtener mensajes de contacto:', error);
    res.status(500).json({
      message: 'Error al obtener mensajes de contacto',
      details: error.message
    });
  }
};

// Get a message by ID (Admin only)
const getMessageById = async (req, res) => {
  try {
    const messageId = req.params.id;
    
    const messageDoc = await db.collection('contactMessages').doc(messageId).get();
    
    if (!messageDoc.exists) {
      return res.status(404).json({
        message: 'Mensaje no encontrado',
        details: `No se encontró un mensaje con ID ${messageId}`
      });
    }
    
    res.status(200).json({
      id: messageDoc.id,
      ...messageDoc.data()
    });
  } catch (error) {
    console.error('Error al obtener mensaje de contacto:', error);
    res.status(500).json({
      message: 'Error al obtener mensaje de contacto',
      details: error.message
    });
  }
};

// Update message status (Admin only)
const updateMessageStatus = async (req, res) => {
  try {
    const messageId = req.params.id;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        message: 'Estado no proporcionado',
        details: 'Debe proporcionar un estado para el mensaje'
      });
    }
    
    const validStatuses = ['unread', 'read', 'replied', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Estado inválido',
        details: `Los estados válidos son: ${validStatuses.join(', ')}`
      });
    }
    
    const messageDoc = await db.collection('contactMessages').doc(messageId).get();
    
    if (!messageDoc.exists) {
      return res.status(404).json({
        message: 'Mensaje no encontrado',
        details: `No se encontró un mensaje con ID ${messageId}`
      });
    }
    
    await db.collection('contactMessages').doc(messageId).update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(200).json({
      message: 'Estado actualizado correctamente',
      messageId,
      status
    });
  } catch (error) {
    console.error('Error al actualizar estado de mensaje:', error);
    res.status(500).json({
      message: 'Error al actualizar estado de mensaje',
      details: error.message
    });
  }
};

// Reply to a message (Admin only)
const replyToMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const { replyContent, replySubject } = req.body;
    
    if (!replyContent) {
      return res.status(400).json({
        message: 'Contenido de respuesta no proporcionado',
        details: 'Debe proporcionar el contenido de la respuesta'
      });
    }
    
    const messageDoc = await db.collection('contactMessages').doc(messageId).get();
    
    if (!messageDoc.exists) {
      return res.status(404).json({
        message: 'Mensaje no encontrado',
        details: `No se encontró un mensaje con ID ${messageId}`
      });
    }
    
    const messageData = messageDoc.data();
    
    // Update message with reply information
    await db.collection('contactMessages').doc(messageId).update({
      status: 'replied',
      reply: {
        content: replyContent,
        subject: replySubject || `Re: ${messageData.subject}`,
        sentAt: new Date().toISOString(),
        sentBy: req.user.email || req.user.uid
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Here you would typically send an actual email
    // This is just a placeholder for the actual email sending logic
    console.log(`Sending email reply to ${messageData.email} with subject: ${replySubject || `Re: ${messageData.subject}`}`);
    
    res.status(200).json({
      message: 'Respuesta enviada correctamente',
      messageId
    });
  } catch (error) {
    console.error('Error al responder mensaje:', error);
    res.status(500).json({
      message: 'Error al responder mensaje',
      details: error.message
    });
  }
};

// Delete a message (Admin only)
const deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    
    const messageDoc = await db.collection('contactMessages').doc(messageId).get();
    
    if (!messageDoc.exists) {
      return res.status(404).json({
        message: 'Mensaje no encontrado',
        details: `No se encontró un mensaje con ID ${messageId}`
      });
    }
    
    await db.collection('contactMessages').doc(messageId).delete();
    
    res.status(200).json({
      message: 'Mensaje eliminado correctamente',
      messageId
    });
  } catch (error) {
    console.error('Error al eliminar mensaje:', error);
    res.status(500).json({
      message: 'Error al eliminar mensaje',
      details: error.message
    });
  }
};

module.exports = {
  submitMessage,
  submitMessageWithAttachment,
  getAllMessages,
  getMessageById,
  updateMessageStatus,
  replyToMessage,
  deleteMessage
};
