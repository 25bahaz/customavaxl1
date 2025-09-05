"use client"

export default function BackgroundDesign() {
  return (
    <>
      {/* Main gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-yellow-50 to-white dark:from-gray-900 dark:via-blue-900 dark:to-blue-800 transition-colors duration-500" />
      
      {/* Geometric shapes overlay */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Large circles */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-[#0133a0] dark:bg-[#0133a0] rounded-full opacity-30 dark:opacity-40 blur-xl"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-[#f6b908] dark:bg-[#f6b908] rounded-full opacity-35 dark:opacity-45 blur-xl"></div>
        <div className="absolute bottom-40 left-40 w-56 h-56 bg-[#0133a0] dark:bg-[#0133a0] rounded-full opacity-25 dark:opacity-35 blur-xl"></div>
        
        {/* Squares */}
        <div className="absolute top-60 left-60 w-32 h-32 bg-[#f6b908] dark:bg-[#f6b908] opacity-40 dark:opacity-50 rotate-45"></div>
        <div className="absolute bottom-60 right-60 w-40 h-40 bg-[#f6b908] dark:bg-[#f6b908] opacity-35 dark:opacity-45 rotate-45"></div>
        
        {/* Lines */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#0133a0] dark:via-[#0133a0] to-transparent opacity-50 dark:opacity-60"></div>
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f6b908] dark:via-[#f6b908] to-transparent opacity-50 dark:opacity-60"></div>
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-[#0133a0] dark:via-[#0133a0] to-transparent opacity-50 dark:opacity-60"></div>
        <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-[#f6b908] dark:via-[#f6b908] to-transparent opacity-50 dark:opacity-60"></div>
      </div>
    </>
  )
}
