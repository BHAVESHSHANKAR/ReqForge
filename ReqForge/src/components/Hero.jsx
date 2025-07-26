import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Play } from 'lucide-react'

function Hero() {
  return (
    <div className="relative overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-black mb-6 animate-fade-in">
            Test APIs. Generate Docs.{' '}
            <span className="text-black">Faster.</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            ReqForge lets backend developers test APIs and auto-generate documentation 
            for frontend teams — all in one tool.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link 
              to="/signup"
              className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2 shadow-lg"
            >
              Get Started
              <ArrowRight size={20} />
            </Link>
            
            <Link 
              to="/login"
              className="border-2 border-black hover:border-gray-800 text-black px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center gap-2"
            >
              <Play size={20} />
              Sign In
            </Link>
          </div>
          
          {/* Mockup Preview */}
          <div className="relative max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform hover:scale-105 transition-transform duration-300">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="ml-4 text-sm text-gray-600">ReqForge - API Testing</div>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Request Panel */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-black">API Request</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-black text-white px-2 py-1 rounded text-sm font-medium">GET</span>
                        <span className="text-gray-600 font-mono text-sm">https://api.example.com/users</span>
                      </div>
                      <div className="text-sm text-gray-500">Headers, Body, Auth...</div>
                    </div>
                  </div>
                  
                  {/* Response Panel */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-black">Response</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-black text-white px-2 py-1 rounded text-sm font-medium">200 OK</span>
                        <span className="text-gray-500 text-sm">245ms</span>
                      </div>
                      <div className="text-sm text-gray-500 font-mono">{"{ \"users\": [...] }"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero