const pool = require('./database');

class Collaboration {
  // Create collaborations table if it doesn't exist
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS collaborations (
        id SERIAL PRIMARY KEY,
        workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
        inviter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        invitee_email VARCHAR(255) NOT NULL,
        invitee_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
        invitation_token VARCHAR(255) UNIQUE,
        invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        responded_at TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_collaborations_workspace_id ON collaborations(workspace_id);
      CREATE INDEX IF NOT EXISTS idx_collaborations_invitee_email ON collaborations(invitee_email);
      CREATE INDEX IF NOT EXISTS idx_collaborations_token ON collaborations(invitation_token);
    `;
    
    try {
      await pool.query(query);
      // Collaborations table created/verified successfully
    } catch (error) {
      console.error('❌ Error creating collaborations table:', error);
      throw error;
    }
  }

  // Create a new collaboration invitation
  static async create({ workspaceId, inviterId, inviteeEmail, invitationToken }) {
    try {
      const query = `
        INSERT INTO collaborations (workspace_id, inviter_id, invitee_email, invitation_token)
        VALUES ($1, $2, $3, $4)
        RETURNING id, workspace_id, inviter_id, invitee_email, status, invitation_token, invited_at
      `;
      
      const values = [workspaceId, inviterId, inviteeEmail, invitationToken];
      const result = await pool.query(query, values);
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Find collaboration by token
  static async findByToken(token) {
    try {
      const query = `
        SELECT c.*, w.name as workspace_name, u.name as inviter_name
        FROM collaborations c
        JOIN workspaces w ON c.workspace_id = w.id
        JOIN users u ON c.inviter_id = u.id
        WHERE c.invitation_token = $1
      `;
      const result = await pool.query(query, [token]);
      
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Accept collaboration invitation
  static async acceptInvitation(token, inviteeId) {
    try {
      const query = `
        UPDATE collaborations 
        SET status = 'accepted', invitee_id = $2, responded_at = CURRENT_TIMESTAMP
        WHERE invitation_token = $1 AND status = 'pending'
        RETURNING id, workspace_id, inviter_id, invitee_email, status
      `;
      
      const result = await pool.query(query, [token, inviteeId]);
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Get workspace collaborators
  static async getWorkspaceCollaborators(workspaceId) {
    try {
      const query = `
        SELECT c.*, u.name as invitee_name, u.email as invitee_email_confirmed
        FROM collaborations c
        LEFT JOIN users u ON c.invitee_id = u.id
        WHERE c.workspace_id = $1 AND c.status = 'accepted'
        ORDER BY c.responded_at DESC
      `;
      const result = await pool.query(query, [workspaceId]);
      
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get pending invitations for workspace
  static async getPendingInvitations(workspaceId) {
    try {
      const query = `
        SELECT c.*, u.name as inviter_name
        FROM collaborations c
        JOIN users u ON c.inviter_id = u.id
        WHERE c.workspace_id = $1 AND c.status = 'pending'
        ORDER BY c.invited_at DESC
      `;
      const result = await pool.query(query, [workspaceId]);
      
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Check if user has access to workspace
  static async hasWorkspaceAccess(userId, workspaceId) {
    try {
      // Check if user is owner
      const ownerQuery = 'SELECT id FROM workspaces WHERE id = $1 AND user_id = $2';
      const ownerResult = await pool.query(ownerQuery, [workspaceId, userId]);
      
      if (ownerResult.rows.length > 0) {
        return { hasAccess: true, role: 'owner' };
      }

      // Check if user is collaborator
      const collaboratorQuery = `
        SELECT id FROM collaborations 
        WHERE workspace_id = $1 AND invitee_id = $2 AND status = 'accepted'
      `;
      const collaboratorResult = await pool.query(collaboratorQuery, [workspaceId, userId]);
      
      if (collaboratorResult.rows.length > 0) {
        return { hasAccess: true, role: 'collaborator' };
      }

      return { hasAccess: false, role: null };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Collaboration;