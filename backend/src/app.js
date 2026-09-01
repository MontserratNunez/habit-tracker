const express = require('express');
const cors = require('cors');
const helmet = require ('helmet');
const habitRoutes = require('./routes/habit.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/habits', habitRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    mensaje: 'The route does not exist.'
  });
});

app.use(errorHandler);

module.exports = app;