const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  logging: false, // Opcional: evita logs en consola
  define: {
    freezeTableName: true, // Usa nombres de tabla exactos sin pluralizar
  },
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a PostgreSQL exitosa.');
  } catch (error) {
    console.error('Error de conexión a PostgreSQL:', error.message);
  }
};

testConnection();

module.exports = sequelize;
