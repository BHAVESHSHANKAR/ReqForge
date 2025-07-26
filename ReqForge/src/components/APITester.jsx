import React, { useState, useEffect } from 'react'
import { Send, Plus, X, Copy, Trash2, Save, Users, Check, AlertCircle, Loader } from 'lucide-react'

function APITester({ workspace, onDeleteWorkspace }) {
  const [request, setRequest] = useState({
    method: 'GET',
    url: '',
    headers: [{ key: '', value: '', enabled: true }],
    params: [{ key: '', value: '', enabled: true }],
    body: '',
    bodyType: 'none'
  })
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('headers')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showCollaborationModal, setShowCollaborationModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [collaborators, setCollaborators] = useState([])
  const [pendingInvites, setPendingInvites] = useState([])
  const [emailVerification, setEmailVerification] = useState({
    status: 'idle', // 'idle', 'checking', 'verified', 'not-found', 'error'
    user: null
  })
  const [verificationTimeout, setVerificationTimeout] = useState(null)

  // Load collaborators when modal opens
  useEffect(() => {
    if (showCollaborationModal) {
      loadCollaborators()
    }
  }, [showCollaborationModal])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (verificationTimeout) {
        clearTimeout(verificationTimeout)
      }
    }
  }, [verificationTimeout])

  const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
  const bodyTypes = ['none', 'json', 'form-data', 'x-www-form-urlencoded', 'raw']

  const handleMethodChange = (method) => {
    setRequest({ ...request, method })
  }

  const handleUrlChange = (url) => {
    setRequest({ ...request, url })
  }

  const addHeader = () => {
    setRequest({
      ...request,
      headers: [...request.headers, { key: '', value: '', enabled: true }]
    })
  }

  const updateHeader = (index, field, value) => {
    const newHeaders = [...request.headers]
    newHeaders[index][field] = value
    setRequest({ ...request, headers: newHeaders })
  }

  const removeHeader = (index) => {
    const newHeaders = request.headers.filter((_, i) => i !== index)
    setRequest({ ...request, headers: newHeaders })
  }

  const addParam = () => {
    setRequest({
      ...request,
      params: [...request.params, { key: '', value: '', enabled: true }]
    })
  }

  const updateParam = (index, field, value) => {
    const newParams = [...request.params]
    newParams[index][field] = value
    setRequest({ ...request, params: newParams })
  }

  const removeParam = (index) => {
    const newParams = request.params.filter((_, i) => i !== index)
    setRequest({ ...request, params: newParams })
  }

  const sendRequest = async () => {
    setLoading(true)
    try {
      // Simulate API request
      setTimeout(() => {
        setResponse({
          status: 200,
          statusText: 'OK',
          time: '245ms',
          size: '1.2KB',
          headers: {
            'content-type': 'application/json',
            'server': 'nginx/1.18.0',
            'date': new Date().toISOString()
          },
          data: {
            message: 'Success',
            data: {
              id: 1,
              name: 'Sample Response',
              timestamp: new Date().toISOString()
            }
          }
        })
        setLoading(false)
      }, 1000)
    } catch (error) {
      setLoading(false)
    }
  }

  const handleDeleteWorkspace = async () => {
    setDeleteLoading(true)
    try {
      await onDeleteWorkspace(workspace.id)
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error('Failed to delete workspace:', error)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) return

    setInviteLoading(true)
    try {
      // Import collaborationAPI here to avoid circular dependency
      const { collaborationAPI } = await import('../services/api')
      
      const result = await collaborationAPI.invite({
        email: inviteEmail,
        workspaceId: workspace.id
      })

      if (result.success) {
        setInviteEmail('')
        // Add to pending invites list
        setPendingInvites(prev => [...prev, {
          id: Date.now(),
          invitee_email: inviteEmail,
          status: 'pending',
          invited_at: new Date().toISOString()
        }])
        
        // Show success notification
        const notification = document.createElement('div')
        notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg transform transition-all duration-500 ease-in-out z-50'
        notification.textContent = `Invitation sent to ${inviteEmail}!`
        document.body.appendChild(notification)
        
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove()
          }
        }, 3000)
      } else {
        // Show error notification
        const notification = document.createElement('div')
        notification.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg transform transition-all duration-500 ease-in-out z-50'
        notification.textContent = result.message || 'Failed to send invitation'
        document.body.appendChild(notification)
        
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove()
          }
        }, 3000)
      }
    } catch (error) {
      console.error('Failed to send invitation:', error)
    } finally {
      setInviteLoading(false)
    }
  }

  const loadCollaborators = async () => {
    try {
      const { collaborationAPI } = await import('../services/api')
      const result = await collaborationAPI.getWorkspaceCollaborators(workspace.id)
      
      if (result.success) {
        setCollaborators(result.data.collaborators || [])
        setPendingInvites(result.data.pendingInvitations || [])
      }
    } catch (error) {
      console.error('Failed to load collaborators:', error)
    }
  }

  // Email verification function
  const verifyEmail = async (email) => {
    if (!email || !email.includes('@')) {
      setEmailVerification({ status: 'idle', user: null })
      return
    }

    setEmailVerification({ status: 'checking', user: null })

    try {
      const { collaborationAPI } = await import('../services/api')
      const result = await collaborationAPI.verifyEmail(email)

      if (result.success) {
        if (result.data.exists) {
          setEmailVerification({ 
            status: 'verified', 
            user: result.data.user 
          })
        } else {
          setEmailVerification({ 
            status: 'not-found', 
            user: null 
          })
        }
      } else {
        setEmailVerification({ status: 'error', user: null })
      }
    } catch (error) {
      console.error('Email verification error:', error)
      setEmailVerification({ status: 'error', user: null })
    }
  }

  // Handle email input change with debounced verification
  const handleEmailChange = (email) => {
    setInviteEmail(email)
    
    // Clear previous timeout
    if (verificationTimeout) {
      clearTimeout(verificationTimeout)
    }

    // Reset verification status for empty email
    if (!email.trim()) {
      setEmailVerification({ status: 'idle', user: null })
      return
    }

    // Set new timeout for verification
    const timeout = setTimeout(() => {
      verifyEmail(email)
    }, 500) // 500ms delay

    setVerificationTimeout(timeout)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-black">{workspace.name}</h2>
            <p className="text-sm text-gray-600">{workspace.description || 'API Testing Workspace'}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-black transition-colors duration-200">
              <Save className="w-4 h-4" />
              Save
            </button>
            <button 
              onClick={() => setShowCollaborationModal(true)}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-black transition-colors duration-200"
            >
              <Users className="w-4 h-4" />
              API Knight
            </button>
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Request URL Bar */}
        <div className="flex items-center space-x-2">
          <select
            value={request.method}
            onChange={(e) => handleMethodChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-medium"
          >
            {httpMethods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
          <input
            type="text"
            value={request.url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="Enter request URL"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
          <button
            onClick={sendRequest}
            disabled={!request.url || loading}
            className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Request Panel */}
        <div className="w-1/2 border-r border-gray-200 flex flex-col">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
            <h3 className="font-semibold text-black">Request</h3>
          </div>

          {/* Request Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              {['headers', 'params', 'body'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium capitalize transition-colors duration-200 ${
                    activeTab === tab
                      ? 'text-black border-b-2 border-black'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Request Content */}
          <div className="flex-1 p-4 overflow-y-auto">
            {activeTab === 'headers' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-black">Headers</h4>
                  <button
                    onClick={addHeader}
                    className="flex items-center gap-1 text-sm text-black hover:bg-gray-100 px-2 py-1 rounded"
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </button>
                </div>
                {request.headers.map((header, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={header.enabled}
                      onChange={(e) => updateHeader(index, 'enabled', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <input
                      type="text"
                      value={header.key}
                      onChange={(e) => updateHeader(index, 'key', e.target.value)}
                      placeholder="Key"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                    />
                    <input
                      type="text"
                      value={header.value}
                      onChange={(e) => updateHeader(index, 'value', e.target.value)}
                      placeholder="Value"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                    />
                    <button
                      onClick={() => removeHeader(index)}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'params' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-black">Query Parameters</h4>
                  <button
                    onClick={addParam}
                    className="flex items-center gap-1 text-sm text-black hover:bg-gray-100 px-2 py-1 rounded"
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </button>
                </div>
                {request.params.map((param, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={param.enabled}
                      onChange={(e) => updateParam(index, 'enabled', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <input
                      type="text"
                      value={param.key}
                      onChange={(e) => updateParam(index, 'key', e.target.value)}
                      placeholder="Key"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                    />
                    <input
                      type="text"
                      value={param.value}
                      onChange={(e) => updateParam(index, 'value', e.target.value)}
                      placeholder="Value"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                    />
                    <button
                      onClick={() => removeParam(index)}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'body' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-black">Request Body</h4>
                  <select
                    value={request.bodyType}
                    onChange={(e) => setRequest({ ...request, bodyType: e.target.value })}
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    {bodyTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                {request.bodyType !== 'none' && (
                  <textarea
                    value={request.body}
                    onChange={(e) => setRequest({ ...request, body: e.target.value })}
                    placeholder="Enter request body"
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black font-mono text-sm"
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Response Panel */}
        <div className="w-1/2 flex flex-col">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
            <h3 className="font-semibold text-black">Response</h3>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            {response ? (
              <div className="space-y-4">
                {/* Response Status */}
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="text-green-700 font-semibold">{response.status} {response.statusText}</span>
                    <span className="text-sm text-gray-600">{response.time}</span>
                    <span className="text-sm text-gray-600">{response.size}</span>
                  </div>
                  <button className="text-gray-600 hover:text-black">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                {/* Response Body */}
                <div>
                  <h4 className="font-medium text-black mb-2">Response Body</h4>
                  <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm font-mono overflow-x-auto">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>

                {/* Response Headers */}
                <div>
                  <h4 className="font-medium text-black mb-2">Response Headers</h4>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    {Object.entries(response.headers).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-1 text-sm">
                        <span className="font-medium text-gray-700">{key}:</span>
                        <span className="text-gray-600">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Send className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Send a request to see the response</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-white/20 max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black">Delete Workspace</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete "<strong>{workspace.name}</strong>"? 
                This will permanently remove the workspace and all associated data.
              </p>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteLoading}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteWorkspace}
                  disabled={deleteLoading}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Workspace
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Knight Collaboration Modal */}
      {showCollaborationModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-black">API Knight - Collaboration</h2>
                    <p className="text-sm text-gray-600">Manage workspace collaborators</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowCollaborationModal(false)
                    setInviteEmail('')
                    setEmailVerification({ status: 'idle', user: null })
                    if (verificationTimeout) {
                      clearTimeout(verificationTimeout)
                      setVerificationTimeout(null)
                    }
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Invite Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-black mb-4">Invite Collaborator</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="relative flex-1">
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        placeholder="Enter email address to invite"
                        className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 ${
                          emailVerification.status === 'verified' 
                            ? 'border-green-300 bg-green-50' 
                            : emailVerification.status === 'not-found' 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-gray-300'
                        }`}
                        disabled={inviteLoading}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {emailVerification.status === 'checking' && (
                          <Loader className="w-5 h-5 text-blue-500 animate-spin" />
                        )}
                        {emailVerification.status === 'verified' && (
                          <div className="flex items-center">
                            <Check className="w-5 h-5 text-green-500" />
                          </div>
                        )}
                        {emailVerification.status === 'not-found' && (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                        {emailVerification.status === 'error' && (
                          <AlertCircle className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handleSendInvite}
                      disabled={!inviteEmail.trim() || emailVerification.status !== 'verified' || inviteLoading}
                      className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                        emailVerification.status === 'verified' && !inviteLoading
                          ? 'bg-black hover:bg-gray-800 text-white shadow-md'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {inviteLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Invite
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Email verification status messages */}
                  {emailVerification.status === 'verified' && emailVerification.user && (
                    <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mr-3">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-800">User verified!</p>
                        <p className="text-sm text-green-600">
                          {emailVerification.user.name} ({emailVerification.user.email})
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {emailVerification.status === 'not-found' && inviteEmail.trim() && (
                    <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full mr-3">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-red-800">User not found</p>
                        <p className="text-sm text-red-600">
                          This email is not registered. They need to create an account first.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {emailVerification.status === 'checking' && (
                    <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mr-3">
                        <Loader className="w-4 h-4 text-blue-600 animate-spin" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-800">Verifying email...</p>
                        <p className="text-sm text-blue-600">Checking if user exists in our database</p>
                      </div>
                    </div>
                  )}
                  
                  {emailVerification.status === 'error' && inviteEmail.trim() && (
                    <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full mr-3">
                        <AlertCircle className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">Verification failed</p>
                        <p className="text-sm text-gray-600">Unable to verify email. Please check the format.</p>
                      </div>
                    </div>
                  )}
                  
                  {emailVerification.status === 'idle' && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-600">
                        💡 Enter an email address to verify if the user exists in ReqForge
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Current Collaborators */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-black mb-4">Current Collaborators</h3>
                {collaborators.length > 0 ? (
                  <div className="space-y-3">
                    {collaborators.map((collaborator, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              {(collaborator.invitee_name || collaborator.invitee_email).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-black">
                              {collaborator.invitee_name || collaborator.invitee_email}
                            </p>
                            <p className="text-sm text-gray-600">{collaborator.invitee_email}</p>
                          </div>
                        </div>
                        <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                          Active
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No collaborators yet</p>
                  </div>
                )}
              </div>

              {/* Pending Invitations */}
              {pendingInvites.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-black mb-4">Pending Invitations</h3>
                  <div className="space-y-3">
                    {pendingInvites.map((invite, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              {invite.invitee_email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-black">{invite.invitee_email}</p>
                            <p className="text-sm text-gray-600">
                              Invited {new Date(invite.invited_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                          Pending
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Workspace Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-black mb-2">Workspace: {workspace.name}</h4>
                <p className="text-sm text-gray-600">
                  {workspace.description || 'No description provided'}
                </p>
                <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                  <span>Total Collaborators: {collaborators.length}</span>
                  <span>Pending Invites: {pendingInvites.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default APITester