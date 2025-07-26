const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const Collaboration = require('../models/Collaboration');
const Workspace = require('../models/Workspace');
const User = require('../models/User');
const EmailService = require('../services/emailService');

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Validation middleware
const validateInvitation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('workspaceId')
    .isInt({ min: 1 })
    .withMessage('Valid workspace ID is required')
];

// @route   GET /api/collaboration/verify-email/:email
// @desc    Verify if user exists by email
// @access  Private
router.get('/verify-email/:email', authenticateToken, async (req, res) => {
  try {
    const { email } = req.params;
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    const user = await User.existsByEmail(email);
    
    res.json({
      success: true,
      data: {
        exists: !!user,
        user: user ? {
          name: user.name,
          email: user.email
        } : null
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/collaboration/invite
// @desc    Send workspace invitation
// @access  Private
router.post('/invite', authenticateToken, validateInvitation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, workspaceId } = req.body;

    // Check if workspace exists and user is owner
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      });
    }

    if (workspace.user_id !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only workspace owner can send invitations'
      });
    }

    // Check if invitation already exists - we'll add this method to the Collaboration model
    // For now, we'll skip this check and let the database handle duplicates

    // Get inviter details
    const inviter = await User.findById(req.userId);
    
    // Generate invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');
    
    // Create collaboration record
    const collaboration = await Collaboration.create({
      workspaceId,
      inviterId: req.userId,
      inviteeEmail: email,
      invitationToken
    });

    // Create invitation link
    const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/invite/${invitationToken}`;

    // Send invitation email
    const emailResult = await EmailService.sendWorkspaceInvitation({
      recipientEmail: email,
      recipientName: email.split('@')[0], // Use email prefix as name
      inviterName: inviter.name,
      workspaceName: workspace.name,
      invitationLink
    });

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send invitation email'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Invitation sent successfully',
      data: {
        collaboration: {
          id: collaboration.id,
          workspaceId: collaboration.workspace_id,
          inviteeEmail: collaboration.invitee_email,
          status: collaboration.status,
          invitedAt: collaboration.invited_at
        }
      }
    });

  } catch (error) {
    console.error('Invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/collaboration/invitation/:token
// @desc    Get invitation details
// @access  Public
router.get('/invitation/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const collaboration = await Collaboration.findByToken(token);
    
    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired invitation'
      });
    }

    if (collaboration.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Invitation has already been responded to'
      });
    }

    res.json({
      success: true,
      data: {
        workspaceName: collaboration.workspace_name,
        inviterName: collaboration.inviter_name,
        inviteeEmail: collaboration.invitee_email,
        invitedAt: collaboration.invited_at
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/collaboration/accept/:token
// @desc    Accept workspace invitation
// @access  Private
router.post('/accept/:token', authenticateToken, async (req, res) => {
  try {
    const { token } = req.params;
    
    const collaboration = await Collaboration.findByToken(token);
    
    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired invitation'
      });
    }

    if (collaboration.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Invitation has already been responded to'
      });
    }

    // Accept the invitation
    const acceptedCollaboration = await Collaboration.acceptInvitation(token, req.userId);
    
    if (!acceptedCollaboration) {
      return res.status(400).json({
        success: false,
        message: 'Failed to accept invitation'
      });
    }

    res.json({
      success: true,
      message: 'Invitation accepted successfully',
      data: {
        workspaceId: acceptedCollaboration.workspace_id
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/collaboration/workspace/:id
// @desc    Get workspace collaborators
// @access  Private
router.get('/workspace/:id', authenticateToken, async (req, res) => {
  try {
    const workspaceId = req.params.id;
    
    // Check if user has access to workspace
    const access = await Collaboration.hasWorkspaceAccess(req.userId, workspaceId);
    
    if (!access.hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get collaborators and pending invitations
    const collaborators = await Collaboration.getWorkspaceCollaborators(workspaceId);
    const pendingInvitations = await Collaboration.getPendingInvitations(workspaceId);

    res.json({
      success: true,
      data: {
        collaborators,
        pendingInvitations,
        userRole: access.role
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;