import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="relative z-10 flex flex-col flex-1">
        <Navbar />
        
        <main className="flex flex-col items-center justify-center flex-1 pt-24 pb-12 px-4">
          <h2 className="text-4xl font-bold text-center mb-6 animate-fade-in-up">
            Welcome to takwallet
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl text-center leading-relaxed mb-4 animate-fade-in-up" style={{animationDelay: '200ms'}}>
            Experience the future of decentralized finance with takwallet. A secure, user-friendly web wallet that gives you complete control over your digital assets. Built with cutting-edge encrypted ERC-20 token support, takwallet ensures your transactions remain private and your funds stay secure.
          </p>
          
          <p className="text-base text-muted-foreground max-w-xl text-center leading-relaxed mb-8 animate-fade-in-up" style={{animationDelay: '400ms'}}>
            No more complicated setups or confusing interfaces. Simply connect your private key and start managing your crypto portfolio with confidence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{animationDelay: '600ms'}}>
            <Link href="/wallet" className="cursor-pointer bg-[#0133a0] text-white px-8 py-3 rounded-lg hover:bg-[#012a8a] hover:scale-105 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl">
              Open Wallet
            </Link>
            <Link href="https://github.com/ava-labs/EncryptedERC/blob/main/README.md" className="cursor-pointer bg-transparent border-2 border-[#f6b908] text-[#f6b908] px-8 py-3 rounded-lg hover:bg-[#f6b908] hover:text-[#0133a0] hover:scale-105 transition-all duration-300 font-semibold text-lg text-center">
              Learn More
            </Link>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  )
}
