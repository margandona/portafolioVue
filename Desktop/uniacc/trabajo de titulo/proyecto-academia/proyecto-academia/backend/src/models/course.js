const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');
const Enrollment = require('./enrollment');

const Course = sequelize.define(
  'Course',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El título del curso no puede estar vacío.' },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'La categoría no puede estar vacía.' },
      },
    },
    modality: {
      type: DataTypes.ENUM('synchronized', 'asynchronized'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['synchronized', 'asynchronized']],
          msg: 'La modalidad debe ser "synchronized" o "asynchronized".',
        },
      },
    },
    duration_days: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: { msg: 'La duración debe ser un número entero.' },
        min: {
          args: [1],
          msg: 'La duración mínima debe ser de 1 día.',
        },
      },
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: { msg: 'La fecha de inicio debe ser válida.' },
      },
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: { msg: 'La fecha de término debe ser válida.' },
      },
    },
    teacher_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      validate: {
        notEmpty: { msg: 'El ID del profesor es obligatorio.' },
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
    tableName: 'courses',
    timestamps: true,
    hooks: {
      beforeValidate(course) {
        if (course.modality === 'synchronized') {
          if (!course.start_date || !course.end_date) {
            throw new Error(
              'Para cursos sincronizados, las fechas de inicio y término son obligatorias.'
            );
          }
          course.duration_days = null;
        } else if (course.modality === 'asynchronized') {
          if (!course.duration_days) {
            throw new Error('Para cursos asincrónicos, la duración en días es obligatoria.');
          }
          course.start_date = null;
          course.end_date = null;
        }
      },
    },
  }
);

// Asociaciones
Course.associate = (models) => {
  Course.hasMany(models.Enrollment, {
    foreignKey: 'course_id',
    onDelete: 'CASCADE',
    as: 'enrollments',
  });
  Course.belongsTo(models.User, {
    foreignKey: 'teacher_id',
    as: 'teacher',
  });
};

module.exports = Course;
