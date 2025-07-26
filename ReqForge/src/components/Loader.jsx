import React from 'react'

function Loader() {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        {/* Logo/Image placeholder - you can replace this with TriadForge image later */}
        <div className="w-16 h-16 bg-blue-600 rounded-lg mb-6 mx-auto flex items-center justify-center">
          <span className="text-white font-bold text-xl">TF</span>
        </div>
        
        {/* Loading animation */}
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        </div>
        
        {/* Loading text */}
        <p className="text-gray-600 text-lg font-medium mb-2">Loading ReqForge</p>
        <p className="text-gray-400 text-sm">Built by TriadForge</p>
      </div>
    </div>
  )
}

export default Loader