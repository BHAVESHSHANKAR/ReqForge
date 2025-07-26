import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check for existing session on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('reqforge_token')
        
        if (token) {
          // Verify token with backend
          const result = await authAPI.getMe()
          
          if (result.success) {
            setUser(result.data.user)
            localStorage.setItem('reqforge_user', JSON.stringify(result.data.user))
          } else {
            // Invalid token, clear storage
            localStorage.removeItem('reqforge_user')
            localStorage.removeItem('reqforge_token')
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        // Clear invalid data
        localStorage.removeItem('reqforge_user')
        localStorage.removeItem('reqforge_token')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const result = await authAPI.login({ email, password })
      
      if (result.success) {
        const { user, token } = result.data
        
        // Store in localStorage
        localStorage.setItem('reqforge_user', JSON.stringify(user))
        localStorage.setItem('reqforge_token', token)
        
        setUser(user)
        return { success: true, user }
      } else {
        return { success: false, error: result.message }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Login failed. Please try again.' }
    }
  }

  const signup = async (name, email, password) => {
    try {
      const result = await authAPI.signup({ name, email, password })
      
      if (result.success) {
        const { user, token } = result.data
        
        // Store in localStorage
        localStorage.setItem('reqforge_user', JSON.stringify(user))
        localStorage.setItem('reqforge_token', token)
        
        setUser(user)
        return { success: true, user }
      } else {
        return { success: false, error: result.message }
      }
    } catch (error) {
      console.error('Signup error:', error)
      return { success: false, error: 'Signup failed. Please try again.' }
    }
  }

  const logout = () => {
    localStorage.removeItem('reqforge_user')
    localStorage.removeItem('reqforge_token')
    setUser(null)
  }

  const isAuthenticated = () => {
    return user !== null && localStorage.getItem('reqforge_token') !== null
  }

  const updateProfile = async (profileData) => {
    try {
      const result = await authAPI.updateProfile(profileData)
      
      if (result.success) {
        const updatedUser = result.data.user
        localStorage.setItem('reqforge_user', JSON.stringify(updatedUser))
        setUser(updatedUser)
        return { success: true, user: updatedUser }
      } else {
        return { success: false, error: result.message }
      }
    } catch (error) {
      console.error('Profile update error:', error)
      return { success: false, error: 'Profile update failed. Please try again.' }
    }
  }

  const value = {
    user,
    login,
    signup,
    logout,
    isAuthenticated,
    updateProfile,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}