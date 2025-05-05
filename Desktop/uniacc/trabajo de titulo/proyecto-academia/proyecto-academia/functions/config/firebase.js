const admin = require('firebase-admin');
const serviceAccount = require('./academy.json');

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // Use non-reserved environment variables if you need to access them
    // databaseURL: process.env.CUSTOM_FIREBASE_DATABASE_URL,
    // storageBucket: process.env.CUSTOM_FIREBASE_STORAGE_BUCKET
  });
  console.log('Firebase initialized correctly');
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

module.exports = admin;
