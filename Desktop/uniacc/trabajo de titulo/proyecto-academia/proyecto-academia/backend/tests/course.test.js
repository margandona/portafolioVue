const request = require('supertest');
const app = require('../src/app'); // Ruta a la aplicación
const { sequelize, User, Course } = require('../src/models'); // Modelos necesarios
const jwt = require('jsonwebtoken');

describe('Pruebas de rutas de cursos', () => {
  let token; // Token de autenticación
  let teacherId; // ID del profesor
  let courseId; // ID del curso de prueba

  // Función utilitaria para crear un usuario de prueba
  const createTestUser = async () => {
    return User.create({
      id: 'teacher1',
      name: 'Profesor de Prueba',
      email: 'teacher@example.com',
      role: 'teacher',
      password: 'securepassword',
    });
  };

  // Función utilitaria para crear un curso de prueba
  const createTestCourse = async (teacher) => {
    const course = await Course.create({
      title: 'Curso de Prueba',
      description: 'Descripción de prueba',
      category: 'Tecnología',
      modality: 'synchronized',
      start_date: new Date(),
      end_date: new Date(),
      teacher_id: teacher.id,
    });
    return course.id;
  };

  beforeAll(async () => {
    // Sincroniza la base de datos y fuerza el reinicio
    await sequelize.sync({ force: true });

    // Crear usuario y curso de prueba
    const teacher = await createTestUser();
    teacherId = teacher.id;
    courseId = await createTestCourse(teacher);

    // Generar token de autenticación
    token = jwt.sign({ id: teacher.id, role: teacher.role }, process.env.JWT_SECRET || 'testsecret', { expiresIn: '1h' });
  });

  afterAll(async () => {
    await sequelize.close(); // Cierra la conexión a la base de datos
  });

  describe('GET /courses', () => {
    it('Debería devolver un array de cursos con estado 200', async () => {
      const response = await request(app)
        .get('/api/courses') // Ajuste de la ruta si es necesario
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /courses/:id', () => {
    it('Debería devolver un curso con estado 200 si el ID existe', async () => {
      const response = await request(app)
        .get(`/api/courses/${courseId}`) // Ajuste de la ruta si es necesario
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', courseId);
      expect(response.body).toHaveProperty('title', 'Curso de Prueba');
    });

    it('Debería devolver un estado 404 si el curso no existe', async () => {
      const response = await request(app)
        .get('/api/courses/99999') // ID no existente
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Curso no encontrado.');
    });
  });
});
