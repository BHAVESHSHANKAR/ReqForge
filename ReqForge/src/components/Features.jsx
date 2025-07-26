import React from 'react'
import { Zap, FileText, Code, Clock } from 'lucide-react'

function Features() {
  const features = [
    {
      icon: <Zap className="w-8 h-8 text-black" />,
      title: "API Testing",
      description: "Test REST APIs with an intuitive interface. Support for all HTTP methods, headers, and authentication."
    },
    {
      icon: <FileText className="w-8 h-8 text-black" />,
      title: "Auto-Docs",
      description: "Automatically generate beautiful documentation from your API tests. Share with your frontend team instantly."
    },
    {
      icon: <Code className="w-8 h-8 text-black" />,
      title: "Code Snippets",
      description: "Generate code snippets in multiple languages (JavaScript, Python, cURL) for easy integration."
    },
    {
      icon: <Clock className="w-8 h-8 text-black" />,
      title: "History Tracking",
      description: "Keep track of all your API tests and responses. Never lose important test data again."
    }
  ]

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
            Everything you need to test APIs
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to make API testing and documentation effortless
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-6 rounded-xl border border-gray-200 hover:border-black hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-black mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Features