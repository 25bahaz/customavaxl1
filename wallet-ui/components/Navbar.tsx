"use client"

import Link from "next/link"
import ThemeToggle from "@/components/ThemeToggle"

export default function Navbar() {
  return (
    <div className="w-full px-4 py-6">
      <nav className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl shadow-lg mx-auto max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Wallet name with icon */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0133a0] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white transform -rotate-90" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h9c.55 0 1 .45 1 1v1c0 .55-.45 1-1 1h-9c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h9z"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[#0133a0] dark:text-[#0133a0]">Takwallet</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Navigation links */}
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-700 dark:text-gray-200 hover:text-[#0133a0] dark:hover:text-[#0133a0] transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                Home
              </Link>
              <Link
                href="/wallet"
                className="text-gray-700 dark:text-gray-200 hover:text-[#0133a0] dark:hover:text-[#0133a0] transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                Wallet
              </Link>
            </div>

            {/* Theme toggle */}
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </div>
  )
}
