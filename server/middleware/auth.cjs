const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const JWT_SECRET = process.env.JWT_SECRET || 'localvibe_jwt_secret_2024';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query(
      'SELECT id, name, email, avatar, is_organizer FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Token is not valid' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Optional auth (for routes that work with or without login)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const result = await pool.query(
        'SELECT id, name, email, avatar, is_organizer FROM users WHERE id = $1',
        [decoded.userId]
      );
      if (result.rows.length > 0) {
        req.user = result.rows[0];
      }
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = { auth, generateToken, optionalAuth };
