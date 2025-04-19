const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Enrollment = require('./enrollment');
const Course = require('./Course');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.STRING, // UID de Firebase
      primaryKey: true,
      validate: {
        notEmpty: { msg: 'El ID no puede estar vacío' },
      },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El nombre no puede estar vacío' },
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: 'El correo debe ser un email válido' },
        notEmpty: { msg: 'El correo no puede estar vacío' },
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'La contraseña no puede estar vacía' },
        len: {
          args: [6, 255],
          msg: 'La contraseña debe tener entre 6 y 255 caracteres',
        },
      },
    },
    role: {
      type: DataTypes.ENUM('student', 'teacher', 'admin'),
      defaultValue: 'student',
      validate: {
        isIn: {
          args: [['student', 'teacher', 'admin']],
          msg: 'El rol debe ser student, teacher o admin',
        },
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: (user) => {
        if (!user.role) {
          user.role = 'student'; // Asegurar rol por defecto
        }
      },
      beforeUpdate: (user) => {
        user.updatedAt = new Date(); // Actualizar la fecha de modificación
      },
    },
  }
);

// Métodos personalizados para verificar roles
User.prototype.isStudent = function () {
  return this.role === 'student';
};

User.prototype.isTeacher = function () {
  return this.role === 'teacher';
};

User.prototype.isAdmin = function () {
  return this.role === 'admin';
};

// Validar rol antes de cualquier creación o actualización
User.validateRole = (role) => {
  const validRoles = ['student', 'teacher', 'admin'];
  if (!validRoles.includes(role)) {
    throw new Error(
      `El rol ${role} no es válido. Los roles permitidos son: ${validRoles.join(', ')}`
    );
  }
};

// Métodos personalizados para búsqueda y validación
User.findByEmailOrId = async (email, id) => {
  const whereClause = {};
  if (email) whereClause.email = email;
  if (id) whereClause.id = id;

  return await User.findOne({ where: whereClause });
};

User.prototype.isRelatedToCourse = async function (courseId) {
  // Verifica si el usuario tiene relación con un curso como profesor o estudiante
  if (this.isTeacher()) {
    const course = await Course.findOne({
      where: { id: courseId, teacher_id: this.id },
    });
    return !!course;
  }
  if (this.isStudent()) {
    const enrollment = await Enrollment.findOne({
      where: { course_id: courseId, user_id: this.id },
    });
    return !!enrollment;
  }
  return false;
};

// Asociaciones
User.associate = (models) => {
  User.hasMany(models.Enrollment, { foreignKey: 'user_id', as: 'enrollments' });
  User.hasMany(models.Course, { foreignKey: 'teacher_id', as: 'courses' });
};

module.exports = User;
