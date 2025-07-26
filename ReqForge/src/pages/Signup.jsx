import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import MobileNotice from '../components/MobileNotice'

function Signup() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    })
    const [showPassword, setShowPassword] = useState(false)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [isEmailVerified, setIsEmailVerified] = useState(false)
    const [emailVerifying, setEmailVerifying] = useState(false)
    
    const { signup } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
        setError('')

        // Reset email verification when email changes
        if (e.target.name === 'email') {
            setIsEmailVerified(false)
        }
    }

    const verifyEmail = async () => {
        if (!formData.email) {
            setError('Please enter an email address first')
            return
        }

        setError('')
        setEmailVerifying(true)

        // Check if VITE_RAPID_KEY exists
        if (!import.meta.env.VITE_RAPID_KEY) {
            setError('API key not configured. Please check your environment variables.')
            setEmailVerifying(false)
            return
        }

        const options = {
            method: 'GET',
            url: 'https://validect-email-verification-v1.p.rapidapi.com/v1/verify',
            params: {
                email: formData.email
            },
            headers: {
                'x-rapidapi-key': import.meta.env.VITE_RAPID_KEY,
                'x-rapidapi-host': 'validect-email-verification-v1.p.rapidapi.com'
            }
        }

        try {
            console.log('Verifying email:', formData.email)
            const response = await axios.request(options)
            console.log('API Response:', response.data)

            if (response.data && response.data.status === 'valid') {
                setIsEmailVerified(true)

                // Show success notification
                const notification = document.createElement('div')
                notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg transform transition-all duration-500 ease-in-out z-50'
                notification.textContent = 'Email verified successfully!'
                document.body.appendChild(notification)

                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove()
                    }
                }, 3000)
            } else if (response.data && response.data.status === 'invalid') {
                setError('Please enter a valid email address')
                setIsEmailVerified(false)
            } else {
                // Handle other response formats
                setError('Unable to verify email format. Please check and try again.')
                setIsEmailVerified(false)
            }
        } catch (error) {
            console.error('Email verification error:', error)

            if (error.response) {
                // API responded with error status
                console.error('API Error Response:', error.response.data)
                setError(`Verification failed: ${error.response.data.message || 'Invalid API response'}`)
            } else if (error.request) {
                // Network error
                setError('Network error. Please check your internet connection and try again.')
            } else {
                // Other error
                setError('Failed to verify email. Please try again.')
            }
            setIsEmailVerified(false)
        } finally {
            setEmailVerifying(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        // Validation
        if (!formData.name || !formData.email || !formData.password) {
            setError('Please fill in all fields')
            setLoading(false)
            return
        }

        if (!isEmailVerified) {
            setError('Please verify your email address first')
            setLoading(false)
            return
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long')
            setLoading(false)
            return
        }

        try {
            const result = await signup(formData.name, formData.email, formData.password)
            
            if (result.success) {
                // Redirect to dashboard on successful signup
                navigate('/dashboard', { replace: true })
            } else {
                setError(result.error || 'Signup failed. Please try again.')
            }
        } catch (error) {
            setError('An unexpected error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const getPasswordStrength = () => {
        const password = formData.password
        if (password.length === 0) return { strength: 0, text: '' }
        if (password.length < 6) return { strength: 1, text: 'Weak', color: 'bg-red-500' }
        if (password.length < 10) return { strength: 2, text: 'Medium', color: 'bg-yellow-500' }
        return { strength: 3, text: 'Strong', color: 'bg-green-500' }
    }

    const passwordStrength = getPasswordStrength()

    return (
        <div className="min-h-screen bg-white flex">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex flex-1 bg-black items-center justify-center p-12">
                <div className="max-w-md text-center">
                    <div className="w-24 h-24 bg-white rounded-2xl mx-auto mb-8 flex items-center justify-center">
                        <div className="w-12 h-12 bg-black rounded-lg"></div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                        Start your API journey
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                        Create your account and join the community of developers building better APIs.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    {/* Header */}
                    <div className="text-center">
                        <Link to="/" className="inline-block">
                            <h1 className="text-3xl font-bold text-black">ReqForge</h1>
                        </Link>
                        <h2 className="mt-6 text-2xl font-bold text-black">Create your account</h2>
                        <p className="mt-2 text-gray-600">Get started with ReqForge today</p>
                        
                        {/* Back to Home Button */}
                        <Link 
                            to="/" 
                            className="inline-flex items-center mt-4 text-sm text-gray-600 hover:text-black transition-colors duration-200"
                        >
                            ← Back to Home
                        </Link>
                    </div>

                    {/* Mobile Notice */}
                    <MobileNotice />

                    {/* Form */}
                    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-3">
                            {/* Name Field */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-black mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                            </div>

                            {/* Email Field with Verification */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                                    Email address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-20 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                                        placeholder="Enter your email"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        {isEmailVerified ? (
                                            <Check className="h-5 w-5 text-green-500" />
                                        ) : formData.email ? (
                                            <button
                                                type="button"
                                                onClick={verifyEmail}
                                                disabled={emailVerifying}
                                                className="text-xs bg-black text-white px-2 py-1 rounded hover:bg-gray-800 disabled:opacity-50"
                                            >
                                                {emailVerifying ? '...' : 'Verify'}
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                                {isEmailVerified && (
                                    <p className="mt-1 text-xs text-green-600 flex items-center">
                                        <Check className="h-3 w-3 mr-1" />
                                        Email verified
                                    </p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                                        placeholder="Create a password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                </div>

                                {/* Password Strength Indicator */}
                                {formData.password && (
                                    <div className="mt-2">
                                        <div className="flex items-center space-x-2">
                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                                                    style={{ width: `${(passwordStrength.strength / 3) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-gray-600">{passwordStrength.text}</span>
                                        </div>
                                    </div>
                                )}
                            </div>


                        </div>



                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                                </>
                            )}
                        </button>

                        {/* Sign in link */}
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link to="/login" className="font-medium text-black hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Signup