"use client"

import { useTheme } from '@/components/ThemeProvider'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="w-14 h-8 rounded-full bg-gray-200 dark:bg-gray-700 relative transition-colors duration-300 cursor-pointer"
    >
      <span
        className={`absolute top-1 left-1 w-6 h-6 rounded-full transition-all duration-300 ${
          theme === "dark" 
            ? "translate-x-6 bg-[#f6b908]" 
            : "bg-[#0133a0]"
        }`}
      />
    </button>
  )
}
