const admin = require('../config/firebase');
const db = admin.firestore();
const campaignsCollection = db.collection('campaigns');
const coursesCollection = db.collection('courses');
const CourseModel = require('./courseModel');

/**
 * Modelo para manejar campañas de descuento
 */
class CampaignModel {
  /**
   * Crea una nueva campaña de descuento
   * @param {Object} campaignData - Datos de la campaña
   * @returns {Promise<Object>} - Campaña creada
   */
  static async create(campaignData) {
    try {
      // Validar datos requeridos
      if (!campaignData.name) throw new Error('El nombre de la campaña es obligatorio');
      if (!campaignData.discount) throw new Error('El porcentaje de descuento es obligatorio');
      if (campaignData.discount < 0 || campaignData.discount > 100) {
        throw new Error('El descuento debe estar entre 0 y 100%');
      }
      
      // Validar fechas
      if (!campaignData.startDate) throw new Error('La fecha de inicio de la campaña es obligatoria');
      if (!campaignData.endDate) throw new Error('La fecha de fin de la campaña es obligatoria');
      
      const startDate = CourseModel.ensureTimestamp(campaignData.startDate);
      const endDate = CourseModel.ensureTimestamp(campaignData.endDate);
      
      if (endDate < startDate) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      
      // Crear el documento de la campaña
      const campaign = {
        name: campaignData.name,
        description: campaignData.description || '',
        discount: campaignData.discount,
        startDate: startDate,
        endDate: endDate,
        isActive: campaignData.isActive !== false, // Por defecto activa
        courses: campaignData.courses || [],
        type: campaignData.type || 'global', // 'global', 'selected'
        createdBy: campaignData.createdBy || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      // Guardar la campaña
      const docRef = await campaignsCollection.add(campaign);
      
      // Si la campaña es activa y tiene cursos asignados, aplicar los descuentos
      if (campaign.isActive && campaign.courses && campaign.courses.length > 0) {
        await this.applyCampaignToCourses(docRef.id, campaign);
      }
      
      return {
        id: docRef.id,
        ...campaign
      };
    } catch (error) {
      console.error('Error al crear campaña:', error);
      throw error;
    }
  }
  
  /**
   * Obtener todas las campañas
   * @returns {Promise<Array>} - Lista de campañas
   */
  static async findAll() {
    try {
      const snapshot = await campaignsCollection.orderBy('createdAt', 'desc').get();
      
      if (snapshot.empty) return [];
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error al obtener campañas:', error);
      throw error;
    }
  }
  
  /**
   * Obtener una campaña por ID
   * @param {string} campaignId - ID de la campaña
   * @returns {Promise<Object>} - Campaña encontrada
   */
  static async findById(campaignId) {
    try {
      const doc = await campaignsCollection.doc(campaignId).get();
      
      if (!doc.exists) return null;
      
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error('Error al obtener campaña:', error);
      throw error;
    }
  }
  
  /**
   * Actualizar una campaña
   * @param {string} campaignId - ID de la campaña
   * @param {Object} campaignData - Datos actualizados
   * @returns {Promise<Object>} - Campaña actualizada
   */
  static async update(campaignId, campaignData) {
    try {
      const doc = await campaignsCollection.doc(campaignId).get();
      if (!doc.exists) throw new Error('Campaña no encontrada');
      
      const currentCampaign = doc.data();
      const updateData = {};
      
      // Actualizar sólo los campos proporcionados
      if (campaignData.name !== undefined) updateData.name = campaignData.name;
      if (campaignData.description !== undefined) updateData.description = campaignData.description;
      if (campaignData.isActive !== undefined) updateData.isActive = campaignData.isActive;
      
      // Validar descuento si se proporciona
      if (campaignData.discount !== undefined) {
        if (campaignData.discount < 0 || campaignData.discount > 100) {
          throw new Error('El descuento debe estar entre 0 y 100%');
        }
        updateData.discount = campaignData.discount;
      }
      
      // Validar fechas si se proporcionan
      if (campaignData.startDate !== undefined) {
        updateData.startDate = CourseModel.ensureTimestamp(campaignData.startDate);
      }
      
      if (campaignData.endDate !== undefined) {
        updateData.endDate = CourseModel.ensureTimestamp(campaignData.endDate);
      }
      
      // Si ambas fechas están presentes, validar que la fecha de fin sea posterior
      if (updateData.startDate && updateData.endDate) {
        if (updateData.endDate < updateData.startDate) {
          throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
        }
      } else if (updateData.startDate && currentCampaign.endDate) {
        if (currentCampaign.endDate < updateData.startDate) {
          throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
        }
      } else if (updateData.endDate && currentCampaign.startDate) {
        if (updateData.endDate < currentCampaign.startDate) {
          throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
        }
      }
      
      // Actualizar cursos si se proporcionan
      if (campaignData.courses !== undefined) {
        updateData.courses = campaignData.courses;
      }
      
      if (campaignData.type !== undefined) {
        updateData.type = campaignData.type;
      }
      
      updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
      
      // Actualizar la campaña
      await campaignsCollection.doc(campaignId).update(updateData);
      
      // Determinar si es necesario actualizar los cursos
      const shouldUpdateCourses = updateData.isActive !== undefined || 
                               updateData.discount !== undefined || 
                               updateData.startDate !== undefined || 
                               updateData.endDate !== undefined || 
                               updateData.courses !== undefined;
      
      // Si la campaña es activa y se cambiaron parámetros relevantes, actualizar cursos
      if (shouldUpdateCourses) {
        const updatedCampaign = await this.findById(campaignId);
        
        // Si la campaña está inactiva, quitar descuentos
        if (!updatedCampaign.isActive) {
          await this.removeCampaignFromCourses(campaignId, updatedCampaign.courses || []);
        } else {
          // Si está activa, aplicar descuentos
          await this.applyCampaignToCourses(campaignId, updatedCampaign);
        }
      }
      
      // Retornar campaña actualizada
      return await this.findById(campaignId);
    } catch (error) {
      console.error('Error al actualizar campaña:', error);
      throw error;
    }
  }
  
  /**
   * Eliminar una campaña
   * @param {string} campaignId - ID de la campaña
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  static async delete(campaignId) {
    try {
      const campaign = await this.findById(campaignId);
      if (!campaign) throw new Error('Campaña no encontrada');
      
      // Quitar los descuentos aplicados a los cursos
      await this.removeCampaignFromCourses(campaignId, campaign.courses || []);
      
      // Eliminar la campaña
      await campaignsCollection.doc(campaignId).delete();
      
      return true;
    } catch (error) {
      console.error('Error al eliminar campaña:', error);
      throw error;
    }
  }
  
  /**
   * Aplicar una campaña a cursos
   * @param {string} campaignId - ID de la campaña
   * @param {Object} campaign - Datos de la campaña
   * @returns {Promise<void>}
   */
  static async applyCampaignToCourses(campaignId, campaign) {
    try {
      // Si la campaña es de tipo global, obtener todos los cursos de pago
      let coursesToUpdate = [];
      
      if (campaign.type === 'global') {
        const snapshot = await coursesCollection
          .where('isFree', '==', false)
          .get();
        
        coursesToUpdate = snapshot.docs.map(doc => doc.id);
      } else if (campaign.courses && campaign.courses.length > 0) {
        // Si tiene cursos específicos asignados
        coursesToUpdate = campaign.courses;
      }
      
      // Aplicar descuentos a cada curso
      const batch = db.batch();
      
      for (const courseId of coursesToUpdate) {
        const courseRef = coursesCollection.doc(courseId);
        const courseDoc = await courseRef.get();
        
        // Saltar si el curso no existe o es gratuito
        if (!courseDoc.exists || courseDoc.data().isFree) continue;
        
        batch.update(courseRef, {
          discount: campaign.discount,
          discountType: 'campaign',
          discountName: campaign.name,
          discountStartDate: campaign.startDate,
          discountEndDate: campaign.endDate,
          discountCampaignId: campaignId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
      
      await batch.commit();
    } catch (error) {
      console.error('Error al aplicar campaña a cursos:', error);
      throw error;
    }
  }
  
  /**
   * Quitar una campaña de cursos
   * @param {string} campaignId - ID de la campaña
   * @param {Array} courseIds - IDs de los cursos
   * @returns {Promise<void>}
   */
  static async removeCampaignFromCourses(campaignId, courseIds) {
    try {
      // Si no hay cursos específicos, buscar todos los que tengan esta campaña
      if (!courseIds || courseIds.length === 0) {
        const snapshot = await coursesCollection
          .where('discountCampaignId', '==', campaignId)
          .get();
        
        courseIds = snapshot.docs.map(doc => doc.id);
      }
      
      // Quitar descuentos de cada curso
      const batch = db.batch();
      
      for (const courseId of courseIds) {
        const courseRef = coursesCollection.doc(courseId);
        const courseDoc = await courseRef.get();
        
        // Saltar si el curso no existe
        if (!courseDoc.exists) continue;
        
        // Quitar descuento sólo si está asociado a esta campaña
        const courseData = courseDoc.data();
        if (courseData.discountCampaignId === campaignId) {
          batch.update(courseRef, {
            discount: 0,
            discountType: null,
            discountName: null,
            discountStartDate: null,
            discountEndDate: null,
            discountCampaignId: null,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }
      
      await batch.commit();
    } catch (error) {
      console.error('Error al quitar campaña de cursos:', error);
      throw error;
    }
  }
  
  /**
   * Obtener campañas activas actualmente
   * @returns {Promise<Array>} - Lista de campañas activas
   */
  static async getActiveCampaigns() {
    try {
      const now = admin.firestore.Timestamp.now();
      
      const snapshot = await campaignsCollection
        .where('isActive', '==', true)
        .where('startDate', '<=', now)
        .where('endDate', '>=', now)
        .get();
      
      if (snapshot.empty) return [];
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error al obtener campañas activas:', error);
      throw error;
    }
  }
}

module.exports = CampaignModel;
