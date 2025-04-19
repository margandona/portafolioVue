module.exports = {
    env: {
      browser: true,
      es2021: true,
    },
    extends: [
      'plugin:vue/vue3-essential',
      'eslint:recommended',
    ],
    parserOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
      requireConfigFile: false, // Desactiva la necesidad de archivo de configuración explícito
    },
    rules: {
      // Puedes agregar tus reglas aquí
    },
  };

