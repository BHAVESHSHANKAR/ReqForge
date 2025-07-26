import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useDeviceDetection } from '../hooks/useDeviceDetection'
import MobileRestriction from '../components/MobileRestriction'
import CreateWorkspaceModal from '../components/CreateWorkspaceModal'
import APITester from '../components/APITester'
import AI from '../components/AI'
import { workspaceAPI } from '../services/api'
import { LogOut, User, Plus, FileText, FolderOpen, Settings, ArrowLeft } from 'lucide-react'

function Dashboard() {
  const { user, logout } = useAuth()
  const { shouldRestrictAccess } = useDeviceDetection()
  const [activeTab, setActiveTab] = useState('workspace')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedWorkspace, setSelectedWorkspace] = useState(null)
  const [aiStep, setAiStep] = useState(1) // 1 = framework selection, 2 = database selection
  const [selectedFramework, setSelectedFramework] = useState(null)
  const [selectedDatabase, setSelectedDatabase] = useState(null)
  const [showAIComponent, setShowAIComponent] = useState(false)

  // Load workspaces on component mount
  useEffect(() => {
    loadWorkspaces()
  }, [])

  // Show mobile restriction if accessing from mobile/tablet
  if (shouldRestrictAccess()) {
    return <MobileRestriction />
  }

  const loadWorkspaces = async () => {
    setLoading(true)
    try {
      const result = await workspaceAPI.getAll()
      if (result.success) {
        setWorkspaces(result.data.workspaces)
      }
    } catch (error) {
      console.error('Failed to load workspaces:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWorkspace = async (workspaceData) => {
    const result = await workspaceAPI.create(workspaceData)
    if (result.success) {
      await loadWorkspaces() // Reload workspaces
      setActiveTab('workspaces') // Switch to workspaces tab
      return result
    } else {
      throw new Error(result.message)
    }
  }

  const handleDeleteWorkspace = async (workspaceId) => {
    const result = await workspaceAPI.delete(workspaceId)
    if (result.success) {
      await loadWorkspaces() // Reload workspaces
      setSelectedWorkspace(null) // Close the workspace if it was open
      setActiveTab('workspaces') // Switch to workspaces tab
      return result
    } else {
      throw new Error(result.message)
    }
  }

  const handleOpenWorkspace = (workspace) => {
    setSelectedWorkspace(workspace)
  }

  const handleBackToWorkspaces = () => {
    setSelectedWorkspace(null)
  }

  const handleLogout = () => {
    logout()
  }

  const sidebarItems = [
    {
      id: 'ai',
      icon: <div className="w-6 h-6 bg-black rounded text-white text-xs font-bold flex items-center justify-center">AI</div>,
      label: 'AI',
      tooltip: 'AI Assistant'
    },
    {
      id: 'workspace',
      icon: <FolderOpen className="w-6 h-6" />,
      label: 'Workspace',
      tooltip: 'Create Workspace'
    },
    {
      id: 'workspaces',
      icon: <div className="w-6 h-6 bg-black rounded text-white text-xs font-bold flex items-center justify-center">WP</div>,
      label: 'Workspaces',
      tooltip: 'My Workspaces'
    },
    {
      id: 'documentation',
      icon: <FileText className="w-6 h-6" />,
      label: 'Documentation',
      tooltip: 'Documentation'
    },
    {
      id: 'account',
      icon: <User className="w-6 h-6" />,
      label: 'Account',
      tooltip: 'Account Settings'
    }
  ]

  const renderContent = () => {
    // If a workspace is selected, show the API tester
    if (selectedWorkspace) {
      return (
        <div className="h-full">
          <div className="mb-4">
            <button
              onClick={handleBackToWorkspaces}
              className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Workspaces
            </button>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 h-[calc(100vh-200px)]">
            <APITester
              workspace={selectedWorkspace}
              onDeleteWorkspace={handleDeleteWorkspace}
            />
          </div>
        </div>
      )
    }

    switch (activeTab) {
      case 'ai':
        const frameworks = [
          { id: 'express', name: 'Express.js', desc: 'Fast, minimalist Node.js framework', color: 'bg-black', icon: 'JS' },
          { id: 'node', name: 'Node.js', desc: 'JavaScript runtime environment', color: 'bg-black', icon: 'N' },
          { id: 'flask', name: 'Flask', desc: 'Lightweight Python web framework', color: 'bg-black', icon: 'PY' },
          { id: 'fastapi', name: 'FastAPI', desc: 'Modern Python API framework', color: 'bg-black', icon: 'FA' }
        ]

        const databases = [
          { id: 'mongodb', name: 'MongoDB', desc: 'NoSQL document database', color: 'bg-black', icon: 'M' },
          { id: 'neon', name: 'Neon', desc: 'Serverless PostgreSQL database', color: 'bg-black', icon: 'N' }
        ]

        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">AI Assistant</h1>
              <p className="text-gray-600">AI-powered API testing and development assistance</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-8 overflow-hidden">
              <div className="max-w-4xl mx-auto">
                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-8">
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold ${aiStep >= 1 ? 'bg-black' : 'bg-gray-300'}`}>
                      1
                    </div>
                    <div className={`w-16 h-1 ${aiStep >= 2 ? 'bg-black' : 'bg-gray-300'} transition-colors duration-500`}></div>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold ${aiStep >= 2 ? 'bg-black' : 'bg-gray-300'}`}>
                      2
                    </div>
                  </div>
                </div>

                {/* Animated Container */}
                <div className="relative min-h-96 overflow-hidden">
                  {/* Step 1: Framework Selection */}
                  <div className={`absolute inset-0 transition-transform duration-500 ease-in-out ${aiStep === 1 ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-xl">1</span>
                      </div>
                      <h3 className="text-xl font-semibold text-black mb-2">Choose Your Backend Framework</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                      {frameworks.map((framework) => (
                        <label
                          key={framework.id}
                          className={`group p-4 border-2 rounded-lg transition-all duration-200 cursor-pointer ${selectedFramework?.id === framework.id
                            ? 'border-black bg-gray-50'
                            : 'border-gray-200 hover:border-black hover:bg-gray-50'
                            }`}
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedFramework?.id === framework.id}
                              onChange={() => {
                                setSelectedFramework(framework)
                                setTimeout(() => setAiStep(2), 500)
                              }}
                              className="w-5 h-5 text-black border-2 border-gray-300 rounded focus:ring-black focus:ring-2 mr-4"
                            />
                            <div className={`w-12 h-12 ${framework.color} rounded-lg flex items-center justify-center mr-4`}>
                              <span className="text-white font-bold text-sm">{framework.icon}</span>
                            </div>
                            <div>
                              <h5 className="font-semibold text-black">{framework.name}</h5>
                              <p className="text-sm text-gray-600">{framework.desc}</p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>


                  </div>

                  {/* Step 2: Database Selection */}
                  <div className={`absolute inset-0 transition-transform duration-500 ease-in-out ${aiStep === 2 ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-xl">2</span>
                      </div>
                      <h3 className="text-xl font-semibold text-black mb-2">Choose Your Database</h3>
                      <p className="text-gray-600">
                        Selected: <span className="font-semibold text-black">{selectedFramework?.name}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto mb-8">
                      {databases.map((database) => (
                        <label
                          key={database.id}
                          className={`group p-4 border-2 rounded-lg transition-all duration-200 cursor-pointer ${selectedDatabase?.id === database.id
                            ? 'border-black bg-gray-50'
                            : 'border-gray-200 hover:border-black hover:bg-gray-50'
                            }`}
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedDatabase?.id === database.id}
                              onChange={() => setSelectedDatabase(database)}
                              className="w-5 h-5 text-black border-2 border-gray-300 rounded focus:ring-black focus:ring-2 mr-4"
                            />
                            <div className={`w-12 h-12 ${database.color} rounded-lg flex items-center justify-center mr-4`}>
                              <span className="text-white font-bold text-sm">{database.icon}</span>
                            </div>
                            <div>
                              <h5 className="font-semibold text-black">{database.name}</h5>
                              <p className="text-sm text-gray-600">{database.desc}</p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>

                    <div className="text-center">
                      <button
                        onClick={() => {
                          setAiStep(1)
                          setSelectedFramework(null)
                          setSelectedDatabase(null)
                        }}
                        className="text-gray-600 hover:text-black px-4 py-2 rounded-lg font-medium transition-colors duration-200 mr-4"
                      >
                        ← Back
                      </button>
                      <button
                        onClick={() => setShowAIComponent(true)}
                        disabled={!selectedDatabase}
                        className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${selectedDatabase
                          ? 'bg-black hover:bg-gray-800 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                      >
                        Generate Project 🚀
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'workspace':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">Create Workspace</h1>
              <p className="text-gray-600">Create and manage your API testing workspaces</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>

                {workspaces.length === 0 ? (
                  <>
                    <h3 className="text-lg font-semibold text-black mb-2">Create Your First Workspace</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Workspaces help you organize your API tests, collections, and documentation in one place.
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-black mb-2">Create New Workspace</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Add another workspace to organize different projects or teams separately.
                    </p>
                  </>
                )}

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  {workspaces.length === 0 ? 'Create Your First Workspace' : 'Create New Workspace'}
                </button>
              </div>
            </div>
          </div>
        )

      case 'workspaces':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-black mb-2">My Workspaces</h1>
                <p className="text-gray-600">View and manage your created workspaces</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Workspace
              </button>
            </div>

            {loading ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading workspaces...</p>
                </div>
              </div>
            ) : workspaces.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 bg-black rounded text-white text-sm font-bold flex items-center justify-center">
                      WP
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-2">No Workspaces Yet</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    You haven't created any workspaces yet. Create your first workspace to get started with API testing.
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Create First Workspace
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workspaces.map((workspace) => (
                  <div key={workspace.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                        <FolderOpen className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(workspace.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-black mb-2">{workspace.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {workspace.description || 'No description provided'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        0 API Tests
                      </div>
                      <button
                        onClick={() => handleOpenWorkspace(workspace)}
                        className="text-black hover:bg-black hover:text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                      >
                        Open
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 'documentation':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">Documentation</h1>
              <p className="text-gray-600">Generate and manage API documentation</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">No Documentation Yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Create API tests first, then generate beautiful documentation automatically.
                </p>
                <button className="border border-black hover:bg-black hover:text-white text-black px-6 py-3 rounded-lg font-medium transition-colors duration-200">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        )

      case 'account':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">Account Settings</h1>
              <p className="text-gray-600">Manage your profile and account preferences</p>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-black">{user?.name}</h2>
                    <p className="text-gray-600">{user?.email}</p>
                    <div className="flex items-center mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-green-600">Active</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Information */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Profile Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={user?.name || ''}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        readOnly
                      />
                      <User className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={user?.email || ''}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        readOnly
                      />
                      <div className="absolute right-3 top-3 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-600">Verified</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Stats */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-black">{workspaces.length}</div>
                    <div className="text-sm text-gray-600">Workspaces</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-black">0</div>
                    <div className="text-sm text-gray-600">API Tests</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-black">0</div>
                    <div className="text-sm text-gray-600">Documents</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Account Actions</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-black">Change Password</h4>
                    <p className="text-sm text-gray-600">Update your account password</p>
                  </div>
                  <button className="px-4 py-2 border border-black text-black hover:bg-black hover:text-white rounded-lg font-medium transition-colors duration-200">
                    Change
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-black">Export Data</h4>
                    <p className="text-sm text-gray-600">Download your account data</p>
                  </div>
                  <button className="px-4 py-2 border border-black text-black hover:bg-black hover:text-white rounded-lg font-medium transition-colors duration-200">
                    Export
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-lg border border-red-200 p-6">
              <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <h4 className="font-medium text-red-600">Sign Out</h4>
                    <p className="text-sm text-red-500">Sign out of your account</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <h4 className="font-medium text-red-600">Delete Account</h4>
                    <p className="text-sm text-red-500">Permanently delete your account and all data</p>
                  </div>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Floating Pill Sidebar */}
      <div className="fixed left-6 top-8 bottom-8 z-50 flex items-center">
        <div className="bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-full shadow-lg py-6 px-3 flex flex-col items-center justify-between h-full min-h-[400px]">
          {/* Top Section */}
          <div className="flex flex-col items-center space-y-4">
            {/* Logo */}
            <div className="mb-4">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-base">RF</span>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="flex flex-col space-y-3">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setSelectedWorkspace(null) // Reset selected workspace when switching tabs
                  }}
                  className={`group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${activeTab === item.id
                    ? 'bg-black text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                    }`}
                >
                  <div className="w-6 h-6">
                    {item.icon}
                  </div>

                  {/* Tooltip */}
                  <div className="absolute left-full ml-4 px-3 py-2 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20 shadow-lg">
                    {item.tooltip}
                    {/* Tooltip arrow */}
                    <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-black rotate-45"></div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col items-center space-y-3">
            {/* Divider */}
            <div className="w-8 h-px bg-gray-200"></div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="group relative w-12 h-12 rounded-full flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            >
              <div className="w-6 h-6">
                <LogOut className="w-6 h-6" />
              </div>

              {/* Tooltip */}
              <div className="absolute left-full ml-4 px-3 py-2 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20 shadow-lg">
                Logout
                {/* Tooltip arrow */}
                <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-black rotate-45"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-28 mr-8 py-8">
        {renderContent()}
      </div>

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateWorkspace={handleCreateWorkspace}
      />

      {/* AI Component */}
      {showAIComponent && (
        <AI
          selectedFramework={selectedFramework}
          selectedDatabase={selectedDatabase}
          onClose={() => setShowAIComponent(false)}
        />
      )}
    </div>
  )
}

export default Dashboard