const router = require('express').Router();
const pool = require('../config/db');
const { requireAdmin } = require('../middleware/auth');

// GET contatti con paginazione e ricerca
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder === 'asc' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    // Colonne consentite per evitare SQL injection
    const allowedSortColumns = ['first_name', 'last_name', 'email', 'phone', 'role', 'company_name', 'created_at'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';

    // Condizione di ricerca
    let whereClause = '';
    let queryParams = [];

    if (search) {
      whereClause = `WHERE contacts.first_name ILIKE $1 
        OR contacts.last_name ILIKE $1 
        OR contacts.email ILIKE $1 
        OR companies.name ILIKE $1`;
      queryParams = [`%${search}%`];
    }

    // Query per il totale
    const countQuery = `
      SELECT COUNT(*) FROM contacts 
      LEFT JOIN companies ON contacts.company_id = companies.id 
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Query per i dati paginati
    const dataQuery = `
      SELECT contacts.*, companies.name AS company_name
      FROM contacts
      LEFT JOIN companies ON contacts.company_id = companies.id
      ${whereClause}
      ORDER BY ${safeSortBy === 'company_name' ? 'companies.name' : 'contacts.' + safeSortBy} ${sortOrder}
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;
    const dataResult = await pool.query(dataQuery, [...queryParams, limit, offset]);

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

// GET singolo contatto per id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT contacts.*, companies.name AS company_name
       FROM contacts
       LEFT JOIN companies ON contacts.company_id = companies.id
       WHERE contacts.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Contatto non trovato' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST crea nuovo contatto
router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, role, company_id } = req.body;
    const result = await pool.query(
      'INSERT INTO contacts (first_name, last_name, email, phone, role, company_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [first_name, last_name, email, phone, role, company_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT modifica contatto
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, role, company_id } = req.body;
    const result = await pool.query(
      'UPDATE contacts SET first_name = $1, last_name = $2, email = $3, phone = $4, role = $5, company_id = $6 WHERE id = $7 RETURNING *',
      [first_name, last_name, email, phone, role, company_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Contatto non trovato' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE elimina contatto
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM contacts WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Contatto non trovato' });
    }

    res.json({ message: 'Contatto eliminato con successo' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;