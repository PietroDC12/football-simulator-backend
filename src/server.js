const express = require('express');
const cors = require('cors');
require('dotenv').config();

const matchRoutes = require('./routes/match');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', matchRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Simulator de gutebol API rodando!' });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});