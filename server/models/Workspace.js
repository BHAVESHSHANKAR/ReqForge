const pool = require('./database');

class Workspace {
  // Create workspaces table if it doesn't exist
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS workspaces (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_workspaces_user_id ON workspaces(user_id);
    `;
    
    try {
      await pool.query(query);
      // Workspaces table created/verified successfully
    } catch (error) {
      console.error('❌ Error creating workspaces table:', error);
      throw error;
    }
  }

  // Create a new workspace
  static async create({ name, description, userId }) {
    try {
      const query = `
        INSERT INTO workspaces (name, description, user_id)
        VALUES ($1, $2, $3)
        RETURNING id, name, description, user_id, created_at, updated_at
      `;
      
      const values = [name, description || null, userId];
      const result = await pool.query(query, values);
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Find workspaces by user ID
  static async findByUserId(userId) {
    try {
      const query = `
        SELECT id, name, description, user_id, created_at, updated_at
        FROM workspaces 
        WHERE user_id = $1
        ORDER BY created_at DESC
      `;
      const result = await pool.query(query, [userId]);
      
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Find workspace by ID
  static async findById(id) {
    try {
      const query = `
        SELECT id, name, description, user_id, created_at, updated_at
        FROM workspaces WHERE id = $1
      `;
      const result = await pool.query(query, [id]);
      
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Update workspace
  static async update(id, updates) {
    try {
      const allowedUpdates = ['name', 'description'];
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
        UPDATE workspaces 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING id, name, description, user_id, created_at, updated_at
      `;

      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Delete workspace
  static async delete(id) {
    try {
      const query = 'DELETE FROM workspaces WHERE id = $1 RETURNING id';
      const result = await pool.query(query, [id]);
      
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Workspace;