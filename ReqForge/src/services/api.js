import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('reqforge_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401) {
            // Clear invalid token
            localStorage.removeItem('reqforge_token')
            localStorage.removeItem('reqforge_user')

            // Redirect to login if not already there
            if (window.location.pathname !== '/login') {
                window.location.href = '/login'
            }
        }

        return Promise.reject(error)
    }
)

// Auth API endpoints
export const authAPI = {
    // User signup
    signup: async (userData) => {
        try {
            const response = await api.post('/auth/signup', userData)
            return {
                success: true,
                data: response.data.data,
                message: response.data.message
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Signup failed',
                errors: error.response?.data?.errors || []
            }
        }
    },

    // User login
    login: async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials)
            return {
                success: true,
                data: response.data.data,
                message: response.data.message
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed',
                errors: error.response?.data?.errors || []
            }
        }
    },

    // Get current user
    getMe: async () => {
        try {
            const response = await api.get('/auth/me')
            return {
                success: true,
                data: response.data.data,
                message: response.data.message
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to get user data'
            }
        }
    },

    // Update user profile
    updateProfile: async (profileData) => {
        try {
            const response = await api.put('/auth/profile', profileData)
            return {
                success: true,
                data: response.data.data,
                message: response.data.message
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Profile update failed'
            }
        }
    }
}

// Workspace API endpoints
export const workspaceAPI = {
    // Create workspace
    create: async (workspaceData) => {
        try {
            const response = await api.post('/workspaces', workspaceData)
            return {
                success: true,
                data: response.data.data,
                message: response.data.message
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to create workspace',
                errors: error.response?.data?.errors || []
            }
        }
    },

    // Get user's workspaces
    getAll: async () => {
        try {
            const response = await api.get('/workspaces')
            return {
                success: true,
                data: response.data.data,
                message: response.data.message
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch workspaces'
            }
        }
    },

    // Get workspace by ID
    getById: async (id) => {
        try {
            const response = await api.get(`/workspaces/${id}`)
            return {
                success: true,
                data: response.data.data,
                message: response.data.message
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch workspace'
            }
        }
    },

    // Update workspace
    update: async (id, workspaceData) => {
        try {
            const response = await api.put(`/workspaces/${id}`, workspaceData)
            return {
                success: true,
                data: response.data.data,
                message: response.data.message
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update workspace',
                errors: error.response?.data?.errors || []
            }
        }
    },

    // Delete workspace
    delete: async (id) => {
        try {
            const response = await api.delete(`/workspaces/${id}`)
            return {
                success: true,
                message: response.data.message
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to delete workspace'
            }
        }
    }
}

// Collaboration API endpoints
export const collaborationAPI = {
    // Send workspace invitation
    invite: async (invitationData) => {
        try {
            const response = await api.post('/collaboration/invite', invitationData)
            return {
                success: true,
                data: response.data.data,
                message: response.data.message
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to send invitation',
                errors: error.response?.data?.errors || []
            }
        }
    },

    // Get invitation details
    getInvitation: async (token) => {
        try {
            const response = await api.get(`/collaboration/invitation/${token}`)
            return {
                success: true,
                data: response.data.data,
                message: response.data.message
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to get invitation details'
            }
        }
    },

    // Accept invitation
    acceptInvitation: async (token) => {
        try {
            const response = await api.post(`/collaboration/accept/${token}`)
            return {
                success: true,
                data: response.data.data,
                message: response.data.message
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to accept invitation'
            }
        }
    },

    // Get workspace collaborators
    getWorkspaceCollaborators: async (workspaceId) => {
        try {
            const response = await api.get(`/collaboration/workspace/${workspaceId}`)
            return {
                success: true,
                data: response.data.data,
                message: response.data.message
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to get collaborators'
            }
        }
    },

    // Verify if user exists by email
    verifyEmail: async (email) => {
        try {
            const response = await api.get(`/collaboration/verify-email/${encodeURIComponent(email)}`)
            return {
                success: true,
                data: response.data.data,
                message: response.data.message
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to verify email'
            }
        }
    }
}

// Health check - use direct axios call to avoid /api prefix
export const healthCheck = async () => {
    try {
        const baseURL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
        const response = await axios.get(`${baseURL}/health`)
        return response.data
    } catch (error) {
        throw new Error('Server is not responding')
    }
}

export default api