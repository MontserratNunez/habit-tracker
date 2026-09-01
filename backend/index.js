const dotenv = require('dotenv');
const conectBD = require('./src/config/db');
const app = require('./src/app');

dotenv.config();

conectBD();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server in port: ${PORT}`);
});