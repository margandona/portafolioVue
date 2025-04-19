const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Course = require('./course');

const Evaluation = sequelize.define(
  'Evaluation',
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
        notEmpty: { msg: 'El título no puede estar vacío.' },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    questions: {
      type: DataTypes.JSONB,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Las preguntas no pueden estar vacías.' },
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Las preguntas deben ser un array válido.');
          }
        },
      },
    },
    course_id: {
      type: DataTypes.INTEGER,
      field: 'course_id',
      references: {
        model: Course,
        key: 'id',
      },
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El ID del curso es obligatorio.' },
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'evaluations',
    timestamps: false,
    hooks: {
      beforeValidate(evaluation) {
        if (Array.isArray(evaluation.questions) && evaluation.questions.length === 0) {
          throw new Error('El array de preguntas no puede estar vacío.');
        }
      },
    },
  }
);

// Establecer asociaciones
Evaluation.associate = (models) => {
  Evaluation.belongsTo(models.Course, {
    foreignKey: 'course_id',
    as: 'Course',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
};

module.exports = Evaluation;
