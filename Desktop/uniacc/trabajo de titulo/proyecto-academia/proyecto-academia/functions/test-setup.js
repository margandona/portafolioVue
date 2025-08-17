// Test setup file
require('dotenv').config({ path: '.env.test' });

// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn()
  },
  firestore: jest.fn(() => ({
    collection: jest.fn(),
    doc: jest.fn(),
    batch: jest.fn()
  })),
  auth: jest.fn(() => ({
    createUser: jest.fn(),
    getUser: jest.fn(),
    verifyIdToken: jest.fn()
  }))
}));

// Global test variables
global.testConfig = {
  courseId: 'test-course-123',
  userId: 'test-user-456',
  saleId: 'test-sale-789'
};
