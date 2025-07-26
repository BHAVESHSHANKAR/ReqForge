import React from 'react'
import { Github, Twitter, Mail } from 'lucide-react'

function Footer() {
  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h3 className="text-2xl font-bold text-white mb-2">ReqForge</h3>
            <p className="text-gray-400">Test APIs. Generate Docs. Faster.</p>
          </div>
          
          <div className="flex items-center space-x-6">
            <a 
              href="#" 
              className="text-gray-400 hover:text-white transition-colors duration-200 transform hover:scale-110"
              aria-label="GitHub"
            >
              <Github size={24} />
            </a>
            <a 
              href="#" 
              className="text-gray-400 hover:text-white transition-colors duration-200 transform hover:scale-110"
              aria-label="Twitter"
            >
              <Twitter size={24} />
            </a>
            <a 
              href="#" 
              className="text-gray-400 hover:text-white transition-colors duration-200 transform hover:scale-110"
              aria-label="Email"
            >
              <Mail size={24} />
            </a>
          </div>
        </div>
        
        <div className="border-t border-gray-600 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 ReqForge. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer