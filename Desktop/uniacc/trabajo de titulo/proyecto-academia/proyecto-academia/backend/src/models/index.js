const sequelize = require('../config/db');
const User = require('./User');
const Course = require('./Course');
const Enrollment = require('./enrollment');

// Registrar asociaciones
const associateModels = () => {
  // Asociaciones de User
  User.hasMany(Enrollment, { foreignKey: 'user_id', as: 'enrollments' });
  User.hasMany(Course, { foreignKey: 'teacher_id', as: 'courses' });

  // Asociaciones de Course
  Course.hasMany(Enrollment, { foreignKey: 'course_id', as: 'enrollments' });
  Course.belongsTo(User, { foreignKey: 'teacher_id', as: 'teacher' });

  // Asociaciones de Enrollment
  Enrollment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Enrollment.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
};

// Ejecutar asociaciones
associateModels();

module.exports = {
  sequelize,
  User,
  Course,
  Enrollment,
};
