const pool = require('./database');
const bcrypt = require('bcryptjs');

class User {
  // Create users table if it doesn't exist
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        avatar VARCHAR(500),
        email_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `;
    
    try {
      await pool.query(query);
      // Users table created/verified successfully
    } catch (error) {
      console.error('❌ Error creating users table:', error);
      throw error;
    }
  }

  // Create a new user
  static async create({ name, email, password }) {
    try {
      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const query = `
        INSERT INTO users (name, email, password)
        VALUES ($1, $2, $3)
        RETURNING id, name, email, avatar, email_verified, created_at
      `;
      
      const values = [name, email, hashedPassword];
      const result = await pool.query(query, values);
      
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      const result = await pool.query(query, [email]);
      
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const query = `
        SELECT id, name, email, avatar, email_verified, created_at, updated_at
        FROM users WHERE id = $1
      `;
      const result = await pool.query(query, [id]);
      
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw error;
    }
  }

  // Update user
  static async update(id, updates) {
    try {
      const allowedUpdates = ['name', 'email', 'avatar', 'email_verified'];
      const updateFields = [];
      const values = [];
      let paramCount = 1;

      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          updateFields.push(`${key} = $${paramCount}`);
          values.push(updates[key]);
          paramCount++;
        }
      });

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const query = `
        UPDATE users 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING id, name, email, avatar, email_verified, created_at, updated_at
      `;

      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Check if user exists by email (for invitations)
  static async existsByEmail(email) {
    try {
      const query = 'SELECT id, name, email FROM users WHERE email = $1';
      const result = await pool.query(query, [email]);
      
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;