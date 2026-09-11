import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import app from './src/app.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[Servidor] Corriendo en el puerto ${PORT} en modo ${process.env.NODE_ENV || 'development'}`);
  });
}).catch((error) => {
  console.error('Error al conectar a la base de datos:', error);
  process.exit(1);
});