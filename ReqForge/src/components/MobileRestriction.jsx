import React from 'react'
import { Monitor, Smartphone } from 'lucide-react'

function MobileRestriction() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Icon */}
        <div className="relative mb-6">
          <Monitor className="w-16 h-16 text-black mx-auto mb-2" />
          <div className="absolute -bottom-2 -right-2">
            <div className="bg-red-500 rounded-full p-1">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-black mb-4">
          Desktop Only
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          ReqForge dashboard is optimized for desktop use only. Please access this application from a desktop or laptop computer for the best experience.
        </p>

        {/* Features that require desktop */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-black mb-2">Desktop Features:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Advanced API testing interface</li>
            <li>• Code editor and syntax highlighting</li>
            <li>• Multi-panel workspace</li>
            <li>• Keyboard shortcuts</li>
          </ul>
        </div>

        {/* Back to home button */}
        <button 
          onClick={() => window.location.href = '/'}
          className="w-full bg-black hover:bg-gray-800 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
        >
          Back to Home
        </button>

        {/* Footer note */}
        <p className="text-xs text-gray-500 mt-4">
          Mobile support coming soon
        </p>
      </div>
    </div>
  )
}

export default MobileRestriction