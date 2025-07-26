import React from 'react'
import { useDeviceDetection } from '../hooks/useDeviceDetection'
import { Monitor, Info } from 'lucide-react'

function MobileNotice() {
  const { shouldRestrictAccess } = useDeviceDetection()

  if (!shouldRestrictAccess()) {
    return null
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Info className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center">
            <Monitor className="h-4 w-4 text-yellow-600 mr-2" />
            <h3 className="text-sm font-medium text-yellow-800">
              Desktop Required
            </h3>
          </div>
          <p className="mt-1 text-sm text-yellow-700">
            ReqForge dashboard requires a desktop or laptop computer. You can browse this page on mobile, but the main application features are desktop-only.
          </p>
        </div>
      </div>
    </div>
  )
}

export default MobileNotice