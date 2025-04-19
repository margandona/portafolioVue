module.exports = {
    testEnvironment: 'node', // Configura el entorno de pruebas para Node.js
    verbose: true,           // Muestra detalles al ejecutar las pruebas
    collectCoverage: true,   // Habilita la recolección de cobertura de código
    coverageDirectory: 'coverage', // Carpeta para guardar el reporte de cobertura
    collectCoverageFrom: [
      'src/**/*.js',          // Especifica los archivos para el análisis de cobertura
      '!src/config/**',       // Excluye archivos de configuración
      '!src/server.js'        // Excluye el archivo de arranque del servidor
    ],
    testMatch: [
      '**/tests/**/*.test.js' // Encuentra archivos de prueba con esta estructura
    ],
    transform: {},            // Desactiva transformadores como Babel para Node.js
  };
  