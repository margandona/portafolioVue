const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Evaluation = require('./Evaluation');
const User = require('./User');

const Response = sequelize.define('Response', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  evaluation_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Evaluation,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  answers: {
    type: DataTypes.JSONB,
    allowNull: false, // Las respuestas enviadas por el usuario
    validate: {
      notEmpty: { msg: 'Las respuestas no pueden estar vacías.' },
    },
  },
  score: {
    type: DataTypes.FLOAT,
    allowNull: false, // Puntaje obtenido
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'responses',
  timestamps: false,
});

// Relaciones
User.hasMany(Response, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Response.belongsTo(User, { foreignKey: 'user_id' });

Evaluation.hasMany(Response, { foreignKey: 'evaluation_id', onDelete: 'CASCADE' });
Response.belongsTo(Evaluation, { foreignKey: 'evaluation_id' });

module.exports = Response;
