const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Workspace = require('../models/Workspace');

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
const validateWorkspace = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Workspace name is required and must be less than 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters')
];

// @route   POST /api/workspaces
// @desc    Create a new workspace
// @access  Private
router.post('/', authenticateToken, validateWorkspace, async (req, res) => {
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

    const { name, description } = req.body;

    // Create new workspace
    const workspace = await Workspace.create({
      name,
      description,
      userId: req.userId
    });

    res.status(201).json({
      success: true,
      message: 'Workspace created successfully',
      data: {
        workspace: {
          id: workspace.id,
          name: workspace.name,
          description: workspace.description,
          userId: workspace.user_id,
          createdAt: workspace.created_at,
          updatedAt: workspace.updated_at
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/workspaces
// @desc    Get user's workspaces
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const workspaces = await Workspace.findByUserId(req.userId);

    res.json({
      success: true,
      data: {
        workspaces: workspaces.map(workspace => ({
          id: workspace.id,
          name: workspace.name,
          description: workspace.description,
          userId: workspace.user_id,
          createdAt: workspace.created_at,
          updatedAt: workspace.updated_at
        }))
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/workspaces/:id
// @desc    Get workspace by ID
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      });
    }

    // Check if workspace belongs to user
    if (workspace.user_id !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        workspace: {
          id: workspace.id,
          name: workspace.name,
          description: workspace.description,
          userId: workspace.user_id,
          createdAt: workspace.created_at,
          updatedAt: workspace.updated_at
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/workspaces/:id
// @desc    Update workspace
// @access  Private
router.put('/:id', authenticateToken, validateWorkspace, async (req, res) => {
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

    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      });
    }

    // Check if workspace belongs to user
    if (workspace.user_id !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { name, description } = req.body;
    const updatedWorkspace = await Workspace.update(req.params.id, { name, description });

    res.json({
      success: true,
      message: 'Workspace updated successfully',
      data: {
        workspace: {
          id: updatedWorkspace.id,
          name: updatedWorkspace.name,
          description: updatedWorkspace.description,
          userId: updatedWorkspace.user_id,
          createdAt: updatedWorkspace.created_at,
          updatedAt: updatedWorkspace.updated_at
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /api/workspaces/:id
// @desc    Delete workspace
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      });
    }

    // Check if workspace belongs to user
    if (workspace.user_id !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Workspace.delete(req.params.id);

    res.json({
      success: true,
      message: 'Workspace deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;