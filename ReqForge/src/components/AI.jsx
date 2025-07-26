import React, { useState } from 'react'
import { Send, FileText, Folder, FolderOpen, X, Copy, Download, Settings } from 'lucide-react'

function AI({ selectedFramework, selectedDatabase, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'system',
      content: `Project setup initialized with ${selectedFramework?.name} and ${selectedDatabase?.name}. I'm ready to help you build your API!`,
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState('server.js')
  const [expandedFolders, setExpandedFolders] = useState(['src', 'routes'])

  // Mock file structure based on selected framework
  const getFileStructure = () => {
    const baseStructure = {
      'package.json': { type: 'file', content: getPackageJson() },
      '.env': { type: 'file', content: getEnvFile() },
      'README.md': { type: 'file', content: getReadmeContent() },
      'src': {
        type: 'folder',
        children: {
          'server.js': { type: 'file', content: getServerContent() },
          'routes': {
            type: 'folder',
            children: {
              'auth.js': { type: 'file', content: getAuthRoutes() },
              'users.js': { type: 'file', content: getUserRoutes() }
            }
          },
          'models': {
            type: 'folder',
            children: {
              'User.js': { type: 'file', content: getUserModel() },
              'database.js': { type: 'file', content: getDatabaseConfig() }
            }
          },
          'middleware': {
            type: 'folder',
            children: {
              'auth.js': { type: 'file', content: getAuthMiddleware() }
            }
          }
        }
      }
    }
    return baseStructure
  }

  const fileStructure = getFileStructure()

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const newMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages([...messages, newMessage])
    setInputMessage('')

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: 'ai',
        content: getAIResponse(inputMessage),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1000)
  }

  const getAIResponse = (userMessage) => {
    const responses = [
      `I can help you with that! Let me generate the code for your ${selectedFramework?.name} application.`,
      `Great question! Here's how you can implement that feature in your ${selectedDatabase?.name} database.`,
      `I'll create the necessary files and configurations for your API. Check the file structure on the left.`,
      `That's a good approach! Let me show you the best practices for ${selectedFramework?.name} development.`
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const toggleFolder = (path) => {
    setExpandedFolders(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path)
        : [...prev, path]
    )
  }

  const renderFileTree = (structure, path = '') => {
    return Object.entries(structure).map(([name, item]) => {
      const fullPath = path ? `${path}/${name}` : name
      
      if (item.type === 'folder') {
        const isExpanded = expandedFolders.includes(fullPath)
        return (
          <div key={fullPath}>
            <div
              onClick={() => toggleFolder(fullPath)}
              className="flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer text-sm"
            >
              {isExpanded ? (
                <FolderOpen className="w-4 h-4 text-blue-500 mr-2" />
              ) : (
                <Folder className="w-4 h-4 text-blue-500 mr-2" />
              )}
              <span className="text-gray-700">{name}</span>
            </div>
            {isExpanded && (
              <div className="ml-4">
                {renderFileTree(item.children, fullPath)}
              </div>
            )}
          </div>
        )
      } else {
        return (
          <div
            key={fullPath}
            onClick={() => setSelectedFile(fullPath)}
            className={`flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer text-sm ${
              selectedFile === fullPath ? 'bg-blue-50 border-r-2 border-blue-500' : ''
            }`}
          >
            <FileText className="w-4 h-4 text-gray-500 mr-2" />
            <span className="text-gray-700">{name}</span>
          </div>
        )
      }
    })
  }

  const getFileContent = (filePath) => {
    const pathParts = filePath.split('/')
    let current = fileStructure
    
    for (const part of pathParts) {
      if (current[part]) {
        current = current[part]
        if (current.children) {
          current = current.children
        }
      }
    }
    
    return current?.content || '// File content will be generated here'
  }

  // Content generators
  function getPackageJson() {
    return `{
  "name": "${selectedFramework?.id}-api",
  "version": "1.0.0",
  "description": "API built with ${selectedFramework?.name}",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "${selectedFramework?.id === 'express' ? 'express' : selectedFramework?.id}": "^4.18.0",
    "${selectedDatabase?.id === 'mongodb' ? 'mongoose' : 'pg'}": "^6.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0"
  }
}`
  }

  function getEnvFile() {
    return `# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
${selectedDatabase?.id === 'mongodb' 
  ? 'MONGODB_URI=mongodb://localhost:27017/myapp' 
  : 'DATABASE_URL=postgresql://username:password@localhost:5432/myapp'
}

# JWT Secret
JWT_SECRET=your-secret-key-here`
  }

  function getServerContent() {
    if (selectedFramework?.id === 'express') {
      return `const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/users', require('./routes/users'))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`)
})`
    }
    return `// ${selectedFramework?.name} server configuration will be generated here`
  }

  function getAuthRoutes() {
    return `const express = require('express')
const router = express.Router()

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    // Authentication logic here
    res.json({ 
      success: true, 
      message: 'Login successful',
      token: 'jwt-token-here'
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    
    // Registration logic here
    res.json({ 
      success: true, 
      message: 'User registered successfully' 
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

module.exports = router`
  }

  function getUserRoutes() {
    return `const express = require('express')
const router = express.Router()

// @route   GET /api/users
// @desc    Get all users
// @access  Private
router.get('/', async (req, res) => {
  try {
    // Get users logic here
    res.json({ 
      success: true, 
      data: { users: [] } 
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // Get user by ID logic here
    res.json({ 
      success: true, 
      data: { user: {} } 
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

module.exports = router`
  }

  function getUserModel() {
    if (selectedDatabase?.id === 'mongodb') {
      return `const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('User', userSchema)`
    }
    return `// ${selectedDatabase?.name} User model will be generated here`
  }

  function getDatabaseConfig() {
    if (selectedDatabase?.id === 'mongodb') {
      return `const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    
    console.log(\`MongoDB Connected: \${conn.connection.host}\`)
  } catch (error) {
    console.error('Database connection error:', error)
    process.exit(1)
  }
}

module.exports = connectDB`
    } else {
      return `const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
}`
    }
  }

  function getAuthMiddleware() {
    return `const jwt = require('jsonwebtoken')

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    })
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid token' 
      })
    }
    
    req.user = user
    next()
  })
}

module.exports = { authenticateToken }`
  }

  function getReadmeContent() {
    return `# ${selectedFramework?.name} API

A RESTful API built with ${selectedFramework?.name} and ${selectedDatabase?.name}.

## Features

- User authentication
- RESTful API endpoints
- ${selectedDatabase?.name} database integration
- Environment configuration
- Error handling

## Installation

1. Clone the repository
2. Install dependencies: \`npm install\`
3. Configure environment variables in \`.env\`
4. Start the server: \`npm run dev\`

## API Endpoints

### Authentication
- POST /api/auth/login - User login
- POST /api/auth/register - User registration

### Users
- GET /api/users - Get all users
- GET /api/users/:id - Get user by ID

## Environment Variables

- PORT - Server port (default: 5000)
- ${selectedDatabase?.id === 'mongodb' ? 'MONGODB_URI' : 'DATABASE_URL'} - Database connection string
- JWT_SECRET - JWT signing secret

## License

MIT`
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-black">AI Code Generator</h2>
              <p className="text-sm text-gray-600">
                {selectedFramework?.name} + {selectedDatabase?.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* File Structure - Left Side */}
          <div className="w-1/4 border-r border-gray-200 bg-gray-50">
            <div className="p-3 border-b border-gray-200 bg-white">
              <h3 className="font-semibold text-black text-sm">Project Files</h3>
            </div>
            <div className="p-2 overflow-y-auto h-full">
              {renderFileTree(fileStructure)}
            </div>
          </div>

          {/* Editor - Right Side */}
          <div className="flex-1 flex flex-col">
            {/* Editor Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-black">{selectedFile}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1 text-gray-500 hover:text-black transition-colors duration-200">
                  <Copy className="w-4 h-4" />
                </button>
                <button className="p-1 text-gray-500 hover:text-black transition-colors duration-200">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Code Editor */}
            <div className="flex-1 overflow-hidden">
              <pre className="h-full overflow-auto p-4 bg-gray-900 text-green-400 font-mono text-sm leading-relaxed">
                <code>{getFileContent(selectedFile)}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Chat Interface - Bottom */}
        <div className="border-t border-gray-200 bg-white">
          {/* Messages */}
          <div className="h-32 overflow-y-auto p-4 space-y-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    message.type === 'user'
                      ? 'bg-black text-white'
                      : message.type === 'system'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask AI to generate code, explain concepts, or modify files..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  inputMessage.trim()
                    ? 'bg-black hover:bg-gray-800 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AI