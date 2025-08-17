const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');
const admin = require('../config/firebase');

// Configure multer storage for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images, PDFs and common document formats
    const allowedMimes = [
      'image/jpeg', 
      'image/png', 
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes, PDF y documentos.'), false);
    }
  }
});

// Reference to Firestore
const db = admin.firestore();

/**
 * @route POST /messages
 * @desc Submit a new contact message
 * @access Public
 */
router.post('/messages', async (req, res) => {
  try {
    const { 
      name, email, subject, message, privacyAccepted,
      submittedAt, sourceUrl, referrer, metadata 
    } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        message: 'Faltan campos obligatorios (nombre, email, asunto, mensaje)'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Formato de correo electrónico inválido' });
    }

    // Validate privacy acceptance
    if (!privacyAccepted) {
      return res.status(400).json({ 
        message: 'Debe aceptar la política de privacidad'
      });
    }

    // Create contact message document
    const messageData = {
      name,
      email,
      subject,
      message,
      privacyAccepted: Boolean(privacyAccepted),
      status: 'unread',
      submittedAt: submittedAt || admin.firestore.FieldValue.serverTimestamp(),
      sourceUrl: sourceUrl || '',
      referrer: referrer || '',
      metadata: metadata || {},
      responseHistory: []
    };

    // Save to Firestore
    const docRef = await db.collection('contactMessages').add(messageData);

    res.status(201).json({
      message: 'Mensaje recibido correctamente',
      messageId: docRef.id
    });
  } catch (error) {
    console.error('Error al guardar mensaje de contacto:', error);
    res.status(500).json({ 
      message: 'Error al procesar el mensaje de contacto',
      details: error.message
    });
  }
});

/**
 * @route POST /messages/with-attachment
 * @desc Submit a contact message with file attachment
 * @access Public
 */
router.post('/messages/with-attachment', upload.single('attachment'), async (req, res) => {
  try {
    const { 
      name, email, subject, message, privacyAccepted 
    } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        message: 'Faltan campos obligatorios (nombre, email, asunto, mensaje)'
      });
    }

    // Validate privacy acceptance
    if (!privacyAccepted || privacyAccepted !== 'true') {
      return res.status(400).json({ 
        message: 'Debe aceptar la política de privacidad'
      });
    }

    // Process file if uploaded
    let fileUrl = null;
    let fileName = null;
    let fileType = null;

    if (req.file) {
      fileName = Date.now() + '-' + req.file.originalname.replace(/\s+/g, '-');
      fileType = req.file.mimetype;
      
      // Upload to Firebase Storage
      const bucket = admin.storage().bucket();
      const fileBuffer = req.file.buffer;
      
      const file = bucket.file(`contact-attachments/${fileName}`);
      await file.save(fileBuffer, {
        metadata: {
          contentType: fileType
        }
      });
      
      fileUrl = `https://storage.googleapis.com/${bucket.name}/contact-attachments/${fileName}`;
    }

    // Create contact message document
    const messageData = {
      name,
      email,
      subject,
      message,
      privacyAccepted: true,
      status: 'unread',
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      sourceUrl: req.body.sourceUrl || '',
      referrer: req.body.referrer || '',
      attachment: {
        fileName: fileName,
        fileType: fileType,
        fileUrl: fileUrl
      },
      responseHistory: []
    };

    // Save to Firestore
    const docRef = await db.collection('contactMessages').add(messageData);

    res.status(201).json({
      message: 'Mensaje con adjunto recibido correctamente',
      messageId: docRef.id
    });
  } catch (error) {
    console.error('Error al guardar mensaje con adjunto:', error);
    res.status(500).json({ 
      message: 'Error al procesar el mensaje de contacto',
      details: error.message
    });
  }
});

/**
 * @route GET /messages
 * @desc Get contact messages (admin only)
 * @access Private (Admin)
 */
router.get('/messages', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { status, fromDate, toDate, limit = 50, page = 1 } = req.query;
    
    // Start with base query
    let query = db.collection('contactMessages');
    
    // Apply filters
    if (status && status !== 'all') {
      query = query.where('status', '==', status);
    }
    
    // Date range filter
    if (fromDate && toDate) {
      const startDate = new Date(fromDate);
      const endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999);
      
      query = query.where('submittedAt', '>=', startDate)
                   .where('submittedAt', '<=', endDate);
    }
    
    // Order by submission date, newest first
    query = query.orderBy('submittedAt', 'desc');
    
    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.limit(parseInt(limit));
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      return res.status(200).json([]);
    }
    
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
});

/**
 * @route GET /messages/:id
 * @desc Get a specific contact message
 * @access Private (Admin)
 */
router.get('/messages/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const messageId = req.params.id;
    const doc = await db.collection('contactMessages').doc(messageId).get();
    
    if (!doc.exists) {
      return res.status(404).json({ message: 'Mensaje no encontrado' });
    }
    
    res.status(200).json({
      messageId: doc.id,
      ...doc.data()
    });
  } catch (error) {
    console.error('Error al obtener mensaje de contacto:', error);
    res.status(500).json({ 
      message: 'Error al obtener mensaje de contacto',
      details: error.message
    });
  }
});

/**
 * @route PATCH /messages/:id/status
 * @desc Update the status of a contact message
 * @access Private (Admin)
 */
router.patch('/messages/:id/status', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const messageId = req.params.id;
    const { status } = req.body;
    
    if (!['read', 'unread', 'pending', 'archived', 'replied'].includes(status)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }
    
    const docRef = db.collection('contactMessages').doc(messageId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ message: 'Mensaje no encontrado' });
    }
    
    await docRef.update({ 
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(200).json({
      message: 'Estado actualizado correctamente',
      messageId,
      status
    });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ 
      message: 'Error al actualizar estado',
      details: error.message
    });
  }
});

/**
 * @route POST /messages/:id/reply
 * @desc Reply to a contact message
 * @access Private (Admin)
 */
router.post('/messages/:id/reply', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const messageId = req.params.id;
    const { replyContent, replySubject } = req.body;
    
    if (!replyContent) {
      return res.status(400).json({ message: 'El contenido de la respuesta es obligatorio' });
    }
    
    const docRef = db.collection('contactMessages').doc(messageId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ message: 'Mensaje no encontrado' });
    }
    
    const message = doc.data();
    
    // Create a response record
    const responseData = {
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      sentBy: req.user.uid,
      sentByName: req.user.displayName || 'Administrador',
      content: replyContent,
      subject: replySubject || `Re: ${message.subject}`
    };
    
    // Update the message with the response history and status
    await docRef.update({
      status: 'replied',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      responseHistory: admin.firestore.FieldValue.arrayUnion(responseData)
    });
    
    // Here you would typically send an actual email
    // But we'll skip that implementation for now
    
    res.status(200).json({
      message: 'Respuesta enviada correctamente',
      messageId,
      response: responseData
    });
  } catch (error) {
    console.error('Error al enviar respuesta:', error);
    res.status(500).json({ 
      message: 'Error al enviar respuesta',
      details: error.message
    });
  }
});

/**
 * @route DELETE /messages/:id
 * @desc Delete a contact message
 * @access Private (Admin)
 */
router.delete('/messages/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const messageId = req.params.id;
    const docRef = db.collection('contactMessages').doc(messageId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ message: 'Mensaje no encontrado' });
    }
    
    // Check if there's an attachment to delete
    const messageData = doc.data();
    if (messageData.attachment && messageData.attachment.fileName) {
      try {
        const bucket = admin.storage().bucket();
        await bucket.file(`contact-attachments/${messageData.attachment.fileName}`).delete();
      } catch (storageError) {
        console.warn('No se pudo eliminar el archivo adjunto:', storageError);
      }
    }
    
    // Delete the document
    await docRef.delete();
    
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
});

/**
 * @route GET /messages/statistics
 * @desc Get message statistics
 * @access Private (Admin)
 */
router.get('/messages/statistics', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    
    // Base query to get all messages
    const messagesRef = db.collection('contactMessages');
    
    // Get total count of messages
    const totalSnapshot = await messagesRef.count().get();
    const totalCount = totalSnapshot.data().count;
    
    // Get count by status
    const statusCounts = {
      unread: 0,
      read: 0,
      pending: 0,
      replied: 0,
      archived: 0
    };
    
    // This would be more efficient with a proper query, but Firestore doesn't support OR filters
    // So we'll make separate queries for each status
    for (const status of Object.keys(statusCounts)) {
      const statusSnapshot = await messagesRef.where('status', '==', status).count().get();
      statusCounts[status] = statusSnapshot.data().count;
    }
    
    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentSnapshot = await messagesRef
      .where('submittedAt', '>=', sevenDaysAgo)
      .orderBy('submittedAt', 'desc')
      .get();
    
    const recentMessages = [];
    recentSnapshot.forEach(doc => {
      recentMessages.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json({
      totalCount,
      statusCounts,
      recentMessages
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      message: 'Error al obtener estadísticas',
      details: error.message
    });
  }
});

/**
 * @route PATCH /messages/bulk/status
 * @desc Update status for multiple messages at once
 * @access Private (Admin)
 */
router.patch('/messages/bulk/status', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { messageIds, status } = req.body;
    
    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ message: 'Debe proporcionar una lista de IDs de mensajes' });
    }
    
    if (!['read', 'unread', 'pending', 'archived', 'replied'].includes(status)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }
    
    const batch = db.batch();
    
    // Update each message in the batch
    for (const id of messageIds) {
      const docRef = db.collection('contactMessages').doc(id);
      batch.update(docRef, { 
        status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    await batch.commit();
    
    res.status(200).json({
      message: 'Estados actualizados correctamente',
      updatedCount: messageIds.length,
      newStatus: status
    });
  } catch (error) {
    console.error('Error al actualizar estados en lote:', error);
    res.status(500).json({ 
      message: 'Error al actualizar estados en lote',
      details: error.message
    });
  }
});

/**
 * @route POST /messages/export
 * @desc Export messages to a downloadable format
 * @access Private (Admin)
 */
router.post('/messages/export', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { format = 'csv', fromDate, toDate, status = 'all' } = req.body;
    
    // Start building query
    let query = db.collection('contactMessages');
    
    // Apply filters
    if (status !== 'all') {
      query = query.where('status', '==', status);
    }
    
    // Date range filter
    if (fromDate && toDate) {
      const startDate = new Date(fromDate);
      const endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999);
      
      query = query.where('submittedAt', '>=', startDate)
                  .where('submittedAt', '<=', endDate);
    }
    
    // Order by submission date
    query = query.orderBy('submittedAt', 'desc');
    
    // Get messages
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      return res.status(404).json({ message: 'No se encontraron mensajes que cumplan con los criterios' });
    }
    
    const messages = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        status: data.status,
        submittedAt: data.submittedAt ? data.submittedAt.toDate().toISOString() : '',
        sourceUrl: data.sourceUrl || '',
        referrer: data.referrer || ''
      });
    });
    
    // Generate the export based on the requested format
    if (format === 'csv') {
      // Simple CSV generation
      const fields = ['id', 'name', 'email', 'subject', 'message', 'status', 'submittedAt', 'sourceUrl', 'referrer'];
      let csv = fields.join(',') + '\n';
      
      messages.forEach(msg => {
        const row = fields.map(field => {
          let value = msg[field] || '';
          // Escape quotes and enclose in quotes
          value = String(value).replace(/"/g, '""');
          return `"${value}"`;
        });
        csv += row.join(',') + '\n';
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="messages-export.csv"');
      res.status(200).send(csv);
    } else if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="messages-export.json"');
      res.status(200).json(messages);
    } else {
      res.status(400).json({ message: 'Formato no soportado' });
    }
  } catch (error) {
    console.error('Error al exportar mensajes:', error);
    res.status(500).json({ 
      message: 'Error al exportar mensajes',
      details: error.message
    });
  }
});

module.exports = router;
