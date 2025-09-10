'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import Link from 'next/link'

interface CookieConsentBannerProps {
  className?: string
}

export function CookieConsentBanner({ className = '' }: CookieConsentBannerProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already made a choice
    const hasConsented = localStorage.getItem('cookie-consent')
    if (!hasConsented) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setIsVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined')
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg ${className}`}
      role="banner"
      aria-label="Cookie consent banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
          {/* Message */}
          <div className="flex-1 text-sm text-gray-700 leading-relaxed">
            <p>
              We use cookies to improve your experience. By using our site, you agree to our{' '}
              <Link
                href="/cookie-policy"
                className="text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                aria-label="View our cookie policy"
              >
                cookie policy
              </Link>
              .
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
              aria-label="Decline cookies"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
              aria-label="Accept cookies"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CookieConsentBanner
