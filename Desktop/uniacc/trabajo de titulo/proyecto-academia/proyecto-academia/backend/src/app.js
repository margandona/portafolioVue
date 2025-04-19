const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user');
const courseRoutes = require('./routes/course');
const authRoutes = require('./routes/auth');
const enrollmentRoutes = require('./routes/enrollment'); // Nueva ruta para inscripciones
const evaluationRoutes = require('./routes/evaluation'); // Nueva ruta para evaluaciones
const responseRoutes = require('./routes/response'); // Nueva ruta para respuestas
const firebase = require('./config/firebase');
const sequelize = require('./config/db');
const { User, Course } = require('./models');

const app = express();

// Middleware de configuración global
app.use(cors());
app.use(express.json());

// Función para garantizar que el tipo ENUM exista
const ensureEnumTypeExists = async () => {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_courses_modality') THEN
        CREATE TYPE "enum_courses_modality" AS ENUM ('synchronized', 'asynchronized');
      END IF;
    END $$;
  `);
};

// Inicialización y sincronización de base de datos
sequelize.sync({ alter: false })
  .then(async () => {
    console.log('Base de datos sincronizada correctamente.');

    await ensureEnumTypeExists();

    const roles = [
      { id: 'adminUID', name: 'Admin', email: 'admin@example.com', password: 'securepassword', role: 'admin' },
      { id: 'teacherUID', name: 'Profesor', email: 'teacher@example.com', password: 'securepassword', role: 'teacher' },
    ];

    for (const role of roles) {
      const existingUser = await User.findOne({ where: { id: role.id } });
      if (!existingUser) {
        await User.create(role);
        console.log(`Usuario predeterminado creado: ${role.name} (${role.role}).`);
      }
    }

    const coursesExist = await Course.findAll();
    console.log(coursesExist.length === 0
      ? 'No hay cursos registrados. Puedes comenzar a añadir cursos.'
      : `${coursesExist.length} curso(s) encontrado(s) en la base de datos.`);
  })
  .catch((error) => {
    console.error('Error al sincronizar la base de datos:', error);
  });

// Rutas principales
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/enrollments', enrollmentRoutes); // Ruta para inscripciones
app.use('/api/evaluations', evaluationRoutes); // Ruta para evaluaciones
app.use('/api/responses', responseRoutes); // Ruta para respuestas

// Verificación de estado del servidor
app.get('/', (req, res) => {
  res.status(200).send('Servidor funcionando correctamente.');
});

// Verificación de conexión con Firebase
app.get('/api/firebase/check', async (req, res) => {
  try {
    const message = firebase.app().name;
    res.status(200).json({ message: `Firebase conectado: ${message}` });
  } catch (error) {
    res.status(500).json({ error: 'Error de conexión con Firebase', details: error.message });
  }
});

// Middleware para manejar rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada.' });
});

// Middleware global de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error interno del servidor:', err);
  res.status(500).json({ message: 'Error interno del servidor', details: err.message });
});

module.exports = app;
