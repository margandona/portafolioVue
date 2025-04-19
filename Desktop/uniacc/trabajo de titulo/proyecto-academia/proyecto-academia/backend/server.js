const app = require('./src/app'); // Asegúrate de la ruta correcta al archivo app.js
require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
