const router = require('express').Router();
const pool = require('../config/db');

// GET aziende con paginazione e ricerca
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let whereClause = '';
    let queryParams = [];

    if (search) {
      whereClause = `WHERE name ILIKE $1 
        OR industry ILIKE $1 
        OR email ILIKE $1`;
      queryParams = [`%${search}%`];
    }

    // Query per il totale
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM companies ${whereClause}`,
      queryParams
    );
    const total = parseInt(countResult.rows[0].count);

    // Query per i dati paginati
    const dataResult = await pool.query(
      `SELECT * FROM companies 
       ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`,
      [...queryParams, limit, offset]
    );

    res.json({
      data: dataResult.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET tutte le aziende (senza paginazione, per dropdown)
router.get('/all', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name FROM companies ORDER BY name ASC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET singola azienda per id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM companies WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Azienda non trovata' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST crea nuova azienda
router.post('/', async (req, res) => {
  try {
    const { name, industry, email, phone, address } = req.body;
    const result = await pool.query(
      'INSERT INTO companies (name, industry, email, phone, address) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, industry, email, phone, address]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT modifica azienda
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, industry, email, phone, address } = req.body;
    const result = await pool.query(
      'UPDATE companies SET name = $1, industry = $2, email = $3, phone = $4, address = $5 WHERE id = $6 RETURNING *',
      [name, industry, email, phone, address, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Azienda non trovata' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE elimina azienda
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM companies WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Azienda non trovata' });
    }

    res.json({ message: 'Azienda eliminata con successo' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;