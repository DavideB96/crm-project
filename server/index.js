const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/db');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Rotte pubbliche (no token richiesto)
app.use('/api/auth', require('./routes/auth'));

// Rotte protette (token richiesto)
app.use('/api/companies', authMiddleware, require('./routes/companies'));
app.use('/api/contacts', authMiddleware, require('./routes/contacts'));

// Rotta di test
app.get('/api/test', (req, res) => {
  res.json({ message: 'Il backend funziona! 🚀' });
});

// Test connessione database
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      message: 'Database connesso! ✅',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({
      message: 'Errore connessione database ❌',
      error: error.message
    });
  }
});

// Avvia il server
app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
