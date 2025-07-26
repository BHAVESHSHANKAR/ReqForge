import React from 'react'
import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-black">ReqForge</h1>
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-black transition-colors duration-200">
              Home
            </Link>
            <Link to="#features" className="text-gray-600 hover:text-black transition-colors duration-200">
              Features
            </Link>
            <Link to="#how-it-works" className="text-gray-600 hover:text-black transition-colors duration-200">
              How it Works
            </Link>
          </div>
          
          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/login" 
              className="text-gray-600 hover:text-black transition-colors duration-200 font-medium"
            >
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar