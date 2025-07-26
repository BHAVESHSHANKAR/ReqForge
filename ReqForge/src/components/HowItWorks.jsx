import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Link, TestTube, FileCheck } from 'lucide-react'

function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: <Link className="w-8 h-8 text-black" />,
      title: "Enter API URL",
      description: "Simply paste your API endpoint and configure headers, parameters, and authentication."
    },
    {
      number: "02", 
      icon: <TestTube className="w-8 h-8 text-black" />,
      title: "Test & Save",
      description: "Send requests, analyze responses, and save successful tests for future reference."
    },
    {
      number: "03",
      icon: <FileCheck className="w-8 h-8 text-black" />,
      title: "Auto-generate Docs",
      description: "Generate comprehensive documentation automatically and share with your team."
    }
  ]

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
            How it works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get started with ReqForge in three simple steps
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connection line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-gray-300 to-transparent transform translate-x-6"></div>
              )}
              
              <div className="text-center group">
                <div className="relative inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {step.number}
                  </div>
                  {step.icon}
                </div>
                
                <h3 className="text-xl font-semibold text-black mb-4">
                  {step.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <RouterLink 
            to="/signup"
            className="inline-flex bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Start Testing APIs
          </RouterLink>
        </div>
      </div>
    </div>
  )
}

export default HowItWorks