const CampaignModel = require('../models/campaignModel');
const CourseModel = require('../models/courseModel');
const admin = require('../config/firebase');
const db = admin.firestore();

/**
 * Crear una nueva campaña de descuento
 */
const createCampaign = async (req, res) => {
  try {
    const campaignData = req.body;
    
    // Añadir el usuario creador
    campaignData.createdBy = req.user.uid;
    
    // Crear la campaña
    const campaign = await CampaignModel.create(campaignData);
    
    res.status(201).json({
      message: 'Campaña creada exitosamente',
      campaign
    });
  } catch (error) {
    console.error('Error al crear campaña:', error);
    res.status(500).json({
      message: 'Error al crear la campaña',
      details: error.message
    });
  }
};

/**
 * Obtener todas las campañas
 */
const getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await CampaignModel.findAll();
    
    res.status(200).json(campaigns);
  } catch (error) {
    console.error('Error al obtener campañas:', error);
    res.status(500).json({
      message: 'Error al obtener las campañas',
      details: error.message
    });
  }
};

/**
 * Obtener una campaña por ID
 */
const getCampaignById = async (req, res) => {
  try {
    const campaignId = req.params.id;
    const campaign = await CampaignModel.findById(campaignId);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaña no encontrada' });
    }
    
    res.status(200).json(campaign);
  } catch (error) {
    console.error('Error al obtener campaña:', error);
    res.status(500).json({
      message: 'Error al obtener la campaña',
      details: error.message
    });
  }
};

/**
 * Actualizar una campaña
 */
const updateCampaign = async (req, res) => {
  try {
    const campaignId = req.params.id;
    const campaignData = req.body;
    
    const updatedCampaign = await CampaignModel.update(campaignId, campaignData);
    
    res.status(200).json({
      message: 'Campaña actualizada exitosamente',
      campaign: updatedCampaign
    });
  } catch (error) {
    console.error('Error al actualizar campaña:', error);
    res.status(500).json({
      message: 'Error al actualizar la campaña',
      details: error.message
    });
  }
};

/**
 * Eliminar una campaña
 */
const deleteCampaign = async (req, res) => {
  try {
    const campaignId = req.params.id;
    
    await CampaignModel.delete(campaignId);
    
    res.status(200).json({
      message: 'Campaña eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar campaña:', error);
    res.status(500).json({
      message: 'Error al eliminar la campaña',
      details: error.message
    });
  }
};

/**
 * Añadir cursos a una campaña
 */
const addCoursesToCampaign = async (req, res) => {
  try {
    const campaignId = req.params.id;
    const { courseIds } = req.body;
    
    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({
        message: 'Se requiere un array de IDs de cursos'
      });
    }
    
    const campaign = await CampaignModel.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaña no encontrada' });
    }
    
    // Obtener lista actual de cursos
    const currentCourses = campaign.courses || [];
    
    // Añadir nuevos cursos sin duplicados
    const updatedCourses = [...new Set([...currentCourses, ...courseIds])];
    
    // Actualizar la campaña
    const updatedCampaign = await CampaignModel.update(campaignId, { 
      courses: updatedCourses 
    });
    
    res.status(200).json({
      message: 'Cursos añadidos exitosamente a la campaña',
      campaign: updatedCampaign
    });
  } catch (error) {
    console.error('Error al añadir cursos a la campaña:', error);
    res.status(500).json({
      message: 'Error al añadir cursos a la campaña',
      details: error.message
    });
  }
};

/**
 * Eliminar cursos de una campaña
 */
const removeCoursesFromCampaign = async (req, res) => {
  try {
    const campaignId = req.params.id;
    const { courseIds } = req.body;
    
    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({
        message: 'Se requiere un array de IDs de cursos'
      });
    }
    
    const campaign = await CampaignModel.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaña no encontrada' });
    }
    
    // Obtener lista actual de cursos
    const currentCourses = campaign.courses || [];
    
    // Filtrar los cursos a eliminar
    const updatedCourses = currentCourses.filter(id => !courseIds.includes(id));
    
    // Actualizar la campaña
    const updatedCampaign = await CampaignModel.update(campaignId, { 
      courses: updatedCourses 
    });
    
    res.status(200).json({
      message: 'Cursos eliminados exitosamente de la campaña',
      campaign: updatedCampaign
    });
  } catch (error) {
    console.error('Error al eliminar cursos de la campaña:', error);
    res.status(500).json({
      message: 'Error al eliminar cursos de la campaña',
      details: error.message
    });
  }
};

/**
 * Activar o desactivar una campaña
 */
const toggleCampaignStatus = async (req, res) => {
  try {
    const campaignId = req.params.id;
    const { isActive } = req.body;
    
    if (isActive === undefined) {
      return res.status(400).json({
        message: 'Se requiere el estado (isActive)'
      });
    }
    
    const campaign = await CampaignModel.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaña no encontrada' });
    }
    
    // Actualizar estado de la campaña
    const updatedCampaign = await CampaignModel.update(campaignId, { 
      isActive: Boolean(isActive) 
    });
    
    res.status(200).json({
      message: isActive ? 'Campaña activada exitosamente' : 'Campaña desactivada exitosamente',
      campaign: updatedCampaign
    });
  } catch (error) {
    console.error('Error al cambiar estado de la campaña:', error);
    res.status(500).json({
      message: 'Error al cambiar estado de la campaña',
      details: error.message
    });
  }
};

module.exports = {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  addCoursesToCampaign,
  removeCoursesFromCampaign,
  toggleCampaignStatus
};
