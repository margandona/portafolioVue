const { Op } = require('sequelize');
const User = require('../models/user');
const admin = require('../config/firebase');
const bcrypt = require('bcrypt');

// Obtener información de un usuario
const getUserInfo = async (req, res) => {
  try {
    const userId = req.params.id === 'me' ? req.user.id : req.params.id;

    if (!userId) {
      return res.status(400).json({ message: 'El ID del usuario es requerido.' });
    }

    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error al obtener usuario:', error.message);
    res.status(500).json({ message: 'Error interno del servidor', details: error.message });
  }
};

// Buscar usuarios por correo electrónico, ID o nombre
const searchUser = async (req, res) => {
  try {
    const { id, email, name } = req.query;

    if (!id && !email && !name) {
      return res.status(400).json({ message: 'Debes proporcionar un ID, email o nombre para buscar.' });
    }

    let users;
    if (id) {
      users = await User.findByPk(id, {
        attributes: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
      });
      users = users ? [users] : [];
    } else {
      const whereClause = {};
      if (email) whereClause.email = email;
      if (name) whereClause.name = { [Op.like]: `%${name}%` };

      users = await User.findAll({
        where: whereClause,
        attributes: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
      });
    }

    if (users.length === 0) {
      return res.status(404).json({ message: 'No se encontraron usuarios con los criterios especificados.' });
    }

    res.status(200).json(users);
  } catch (error) {
    console.error('Error al buscar usuarios:', error);
    res.status(500).json({ message: 'Error interno al buscar usuarios.', details: error.message });
  }
};

// Listar todos los usuarios (solo admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
    });

    if (users.length === 0) {
      return res.status(200).json({ message: 'No se encontraron usuarios.' });
    }

    res.status(200).json(users);
  } catch (error) {
    console.error('Error al obtener todos los usuarios:', error);
    res.status(500).json({ message: 'Error al obtener todos los usuarios.', details: error.message });
  }
};

// Crear un nuevo usuario (solo admin)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios (name, email, password, role).' });
    }

    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Rol inválido. Los roles permitidos son: student, teacher, admin.' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El correo electrónico ya está en uso.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const firebaseUser = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    const user = await User.create({
      id: firebaseUser.uid,
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({ message: 'Usuario creado correctamente.', user });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ message: 'Error al crear usuario.', details: error.message });
  }
};

// Actualizar información del usuario
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id === 'me' ? req.user.id : req.params.id;

    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permiso para actualizar esta información.' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findOne({ where: { email: req.body.email } });
      if (existingUser) {
        return res.status(400).json({ message: 'El correo electrónico ya está en uso.' });
      }
    }

    const firebaseUpdates = {};
    if (req.body.email && req.body.email !== user.email) {
      firebaseUpdates.email = req.body.email;
    }
    if (req.body.name && req.body.name !== user.name) {
      firebaseUpdates.displayName = req.body.name;
    }

    if (Object.keys(firebaseUpdates).length > 0) {
      try {
        await admin.auth().updateUser(user.id, firebaseUpdates);
      } catch (firebaseError) {
        console.error('Error al actualizar datos en Firebase:', firebaseError);
        return res.status(500).json({
          message: 'Error al actualizar los datos del usuario en Firebase.',
          details: firebaseError.message,
        });
      }
    }

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.update(req.body);
    res.status(200).json({ message: 'Usuario actualizado correctamente.', user: updatedUser });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error al actualizar usuario.', details: error.message });
  }
};

// Eliminar un usuario
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    await admin.auth().deleteUser(user.id);
    await user.destroy();
    res.status(200).json({ message: 'Usuario eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error al eliminar usuario.', details: error.message });
  }
};

module.exports = {
  getUserInfo,
  searchUser,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};
