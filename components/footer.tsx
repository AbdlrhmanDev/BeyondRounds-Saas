import React from 'react'
import Link from 'next/link'
import { Heart } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-50 py-16 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12">
          <div className="lg:col-span-1 md:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">BR</span>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">BEYOND ROUNDS</div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-emerald-600 bg-clip-text text-transparent">BeyondRounds</span>
              </div>
            </div>
            <p className="text-gray-600 text-base mb-8">Where doctors become friends.</p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6 text-lg">Product</h4>
            <ul className="space-y-3">
              <li>
                <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-base">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-base">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/join" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-base">
                  Join
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6 text-lg">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/help" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-base">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-base">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-base">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6 text-lg">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-base">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-base">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-base">
                  Careers
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 text-center">
          <p className="text-gray-600 text-base">
            &copy; 2024 <span className="font-semibold">BeyondRounds</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer