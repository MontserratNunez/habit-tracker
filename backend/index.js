const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const app = require('./src/app');

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[Servidor] Corriendo en el puerto ${PORT} en modo ${process.env.NODE_ENV || 'development'}`);
  });
});