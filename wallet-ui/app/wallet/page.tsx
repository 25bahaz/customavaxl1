"use client"

import { useState } from "react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import NotificationManager from "@/components/NotificationManager"
import { isValidEthereumAddress, isValidAmount } from "@/lib/validation"
import Link from "next/link"

export default function WalletPage() {
  const [balance, setBalance] = useState("0.0000")
  const [isBalanceVisible, setIsBalanceVisible] = useState(false)
  const [address, setAddress] = useState("0x1234...5678")
  const [isConnected, setIsConnected] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [sendAmount, setSendAmount] = useState("")
  const [sendToAddress, setSendToAddress] = useState("")
  const [addressError, setAddressError] = useState("")
  const [amountError, setAmountError] = useState("")

  // Sample transaction data
  const recentTransactions = [
    { id: 1, type: 'send', amount: '0.5', to: '0x742d...8b6', status: 'completed', timestamp: '2 hours ago' },
    { id: 2, type: 'receive', amount: '102.2', from: '0x1234...5678', status: 'completed', timestamp: '1 day ago' },
    { id: 3, type: 'receive', amount: '10.8', from: '0x1234...5678', status: 'pending', timestamp: '3 days ago' },
    { id: 4, type: 'mint/buy', amount: '1.8', status: 'pending', timestamp: '2 days ago' },
    { id: 5, type: 'send', amount: '200.8', to: '0x742d...8b6',status: 'pending', timestamp: '3 min ago' },
    { id: 6, type: 'send', amount: '1000.8',to: '0x742d...8b6', status: 'pending', timestamp: '10 hour ago' },
    { id: 7, type: 'swap', amount: '10000.8', to: '0x742d...8b6', status: 'pending', timestamp: '3 days ago' },
    { id: 8, type: 'receive', amount: '50.0', from: '0x9876...4321', status: 'completed', timestamp: '4 days ago' },
    { id: 9, type: 'send', amount: '75.5', to: '0xabcd...efgh', status: 'failed', timestamp: '5 days ago' },
    { id: 10, type: 'swap', amount: '500.0', to: '0x1111...2222', status: 'completed', timestamp: '1 week ago' },
    { id: 11, type: 'receive', amount: '25.3', from: '0x3333...4444', status: 'pending', timestamp: '1 week ago' },
    { id: 12, type: 'send', amount: '150.7', to: '0x5555...6666', status: 'completed', timestamp: '2 weeks ago' },
  ]

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible)
    
    // Show notification based on action
    if (typeof window !== 'undefined' && (window as any).showNotification) {
      if (!isBalanceVisible) {
        (window as any).showNotification('info', 'Balance Revealed', 'Your encrypted balance is now visible.', 2000)
      } else {
        (window as any).showNotification('info', 'Balance Hidden', 'Your balance is now hidden for privacy.', 2000)
      }
    }
  }

  const connectWallet = () => {
    setIsConnected(true)
    setAddress("0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6")
    setBalance("1.2345")
    
    // Show success notification
    if (typeof window !== 'undefined' && (window as any).showNotification) {
      (window as any).showNotification('success', 'Wallet Connected', 'Your wallet has been successfully connected!', 3000)
    }
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setAddress("0x1234...5678")
    setBalance("0.0000")
    setIsBalanceVisible(false)
    
    // Show info notification
    if (typeof window !== 'undefined' && (window as any).showNotification) {
      (window as any).showNotification('info', 'Wallet Disconnected', 'Your wallet has been disconnected.', 3000)
    }
  }

  const openSendModal = () => {
    setShowSendModal(true)
  }

  const closeSendModal = () => {
    setShowSendModal(false)
    setSendAmount("")
    setSendToAddress("")
    setAddressError("")
    setAmountError("")
  }

  const validateForm = () => {
    let isValid = true
    
    // Validate address
    if (!sendToAddress.trim()) {
      setAddressError("Recipient address is required")
      isValid = false
    } else if (!isValidEthereumAddress(sendToAddress.trim())) {
      setAddressError("Please enter a valid Ethereum address (0x...)")
      isValid = false
    } else {
      setAddressError("")
    }
    
    // Validate amount
    if (!sendAmount.trim()) {
      setAmountError("Amount is required")
      isValid = false
    } else if (!isValidAmount(sendAmount.trim())) {
      setAmountError("Please enter a valid positive amount")
      isValid = false
    } else {
      setAmountError("")
    }
    
    return isValid
  }

  const handleSendTransaction = () => {
    if (!validateForm()) {
      return
    }
    
    // Here you would implement the actual transaction logic
    console.log(`Sending ${sendAmount} tokens to ${sendToAddress}`)
    
    // Show success notification
    if (typeof window !== 'undefined' && (window as any).showNotification) {
      (window as any).showNotification('success', 'Transaction Sent', `Successfully sent ${sendAmount} TAKAS to ${sendToAddress}`, 4000)
    }
    
    closeSendModal()
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        )
      case 'receive':
        return (
          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
          </svg>
        )
      case 'swap':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        )
      case 'mint/buy':
        return (
          <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M21 9.5C21 11.9853 16.9706 14 12 14M21 9.5C21 7.01472 16.9706 5 12 5C7.02944 5 3 7.01472 3 9.5M21 9.5V15C21 17.2091 16.9706 19 12 19M12 14C7.02944 14 3 11.9853 3 9.5M12 14V19M3 9.5V15C3 17.2091 7.02944 19 12 19M7 18.3264V13.2422M17 18.3264V13.2422" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500'
      case 'pending':
        return 'text-yellow-500'
      case 'failed':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="relative z-10 flex flex-col flex-1">
        <Navbar />
        
        <main className="flex-1 pt-2 px-4">
          {/* Main Container */}
          <div className="w-full max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
              
              {/* Left Side Container */}
              <div className="flex-1 flex flex-col" style={{ height: '650px' }}>
                
                {/* Connect Wallet Address */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                      Wallet Connection
                    </h3>
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">Address:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-semibold text-gray-800 dark:text-white">{address}</span>
                        {isConnected && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(address);
                              if (typeof window !== 'undefined' && (window as any).showNotification) {
                                (window as any).showNotification('success', 'Address Copied', 'Wallet address copied to clipboard!', 2000);
                              }
                            }}
                            className="cursor-pointer p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
                            title="Copy address to clipboard"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {!isConnected ? (
                      <button
                        onClick={connectWallet}
                        className="w-full bg-[#0133a0] text-white px-6 py-3 rounded-lg hover:bg-[#012a8a] hover:scale-105 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl cursor-pointer"
                      >
                        Connect Wallet
                      </button>
                    ) : (
                      <button
                        onClick={disconnectWallet}
                        className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 hover:scale-105 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl cursor-pointer"
                      >
                        Disconnect Wallet
                      </button>
                    )}
                  </div>
                </div>

                {/* Encrypted Balance Container */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    Encrypted Balance
                  </h3>
                  
                  <div className="text-center pt-12">
                    <div className="text-4xl font-bold text-[#0133a0] dark:text-[#0133a0] mb-2">
                      {isBalanceVisible ? balance : "****"}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300 mb-4">
                      TAKAS Tokens
                    </div>
                    
                    <button
                      onClick={toggleBalanceVisibility}
                      disabled={!isConnected}
                      className={`px-6 py-3 rounded-lg font-semibold shadow-md transition-all duration-300 ${
                        isConnected
                          ? 'bg-[#f6b908] text-[#0133a0] hover:bg-[#e6a800] hover:scale-105 hover:shadow-lg cursor-pointer'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isBalanceVisible ? "Hide Balance" : "Reveal Balance"}
                    </button>
                  </div>
                  
                  {/* Actions */}
                  <div className="mt-6 flex-1 flex flex-col justify-end pb-8">
                    <div className="flex flex-row items-center justify-center gap-3">
                      <button
                        onClick={openSendModal}
                        disabled={!isConnected}
                        className={`w-24 h-24 p-2 rounded-lg font-medium text-sm shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center gap-1 ${
                          isConnected 
                            ? 'bg-[#0133a0] text-white hover:bg-[#012a8a] hover:scale-105 cursor-pointer' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <span>Send</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          if (isConnected) {
                            if (typeof window !== 'undefined' && (window as any).showNotification) {
                              (window as any).showNotification('warning', 'Mint Function', 'Mint functionality will be implemented soon!', 3000)
                            }
                          }
                        }}
                        disabled={!isConnected}
                        className={`w-24 h-24 p-2 rounded-lg font-medium text-sm shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center gap-1 ${
                          isConnected 
                            ? 'bg-[#0133a0] text-white hover:bg-[#012a8a] hover:scale-105 cursor-pointer' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M21 9.5C21 11.9853 16.9706 14 12 14M21 9.5C21 7.01472 16.9706 5 12 5C7.02944 5 3 7.01472 3 9.5M21 9.5V15C21 17.2091 16.9706 19 12 19M12 14C7.02944 14 3 11.9853 3 9.5M12 14V19M3 9.5V15C3 17.2091 7.02944 19 12 19M7 18.3264V13.2422M17 18.3264V13.2422" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>

                        <span>Mint/Buy</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          if (isConnected) {
                            if (typeof window !== 'undefined' && (window as any).showNotification) {
                              (window as any).showNotification('warning', 'Receive', 'Receive functionality will be implemented soon!', 3000)
                            }
                          }
                        }}
                        disabled={!isConnected}
                        className={`w-24 h-24 p-2 rounded-lg font-medium text-sm shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center gap-1 ${
                          isConnected 
                            ? 'bg-[#0133a0] text-white hover:bg-[#012a8a] hover:scale-105 cursor-pointer' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                        </svg>
                        <span>Receive</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          if (isConnected) {
                            if (typeof window !== 'undefined' && (window as any).showNotification) {
                              (window as any).showNotification('warning', 'Swap', 'Swap functionality will be implemented soon!', 3000)
                            }
                          }
                        }}
                        disabled={!isConnected}
                        className={`w-24 h-24 p-2 rounded-lg font-medium text-sm shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center gap-1 ${
                          isConnected 
                            ? 'bg-[#0133a0] text-white hover:bg-[#012a8a] hover:scale-105 cursor-pointer' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        <span>Swap</span>
                      </button>
                    </div>
                  </div>
                </div>


              </div>

              {/* Right Side Container */}
              <div className="lg:w-[28rem]" style={{ height: '650px' }}>
                {/* Middle Container for Height Alignment */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 h-full">
                  {/* Recent Transaction History */}
                  <div className="h-full flex flex-col">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex-shrink-0">
                      Recent Transactions
                    </h3>
                    
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {recentTransactions.map((tx) => (
                      <div key={tx.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex-shrink-0">
                          {getTransactionIcon(tx.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-800 dark:text-white capitalize">
                              {tx.type}
                            </p>
                            <span className={`text-xs font-medium ${getStatusColor(tx.status)}`}>
                              {tx.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {tx.type === 'send' ? `To: ${tx.to}` : tx.type === 'receive' ? `From: ${tx.from}` : 'Swap'}
                            </p>
                            <p className="text-sm font-medium text-gray-800 dark:text-white">
                              {tx.amount} TAKAS
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {tx.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </main>
      </div>

      {/* Send Transaction Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with blur */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={closeSendModal}
          />
          
          {/* Modal content */}
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200/50 dark:border-gray-700/50 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                Send Transaction
              </h3>
              <button
                onClick={closeSendModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount to Send (TAKAS)
                </label>
                <input
                  type="number"
                  value={sendAmount}
                  onChange={(e) => {
                    setSendAmount(e.target.value)
                    if (amountError) setAmountError("")
                  }}
                  placeholder="0.0000"
                  step="0.0001"
                  min="0"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0133a0] focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-200 ${
                    amountError 
                      ? 'border-red-500 dark:border-red-400' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {amountError && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {amountError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recipient Address
                </label>
                <input
                  type="text"
                  value={sendToAddress}
                  onChange={(e) => {
                    setSendToAddress(e.target.value)
                    if (addressError) setAddressError("")
                  }}
                  placeholder="0x..."
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0133a0] focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-200 font-mono text-sm ${
                    addressError 
                      ? 'border-red-500 dark:border-red-400' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {addressError && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {addressError}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={closeSendModal}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendTransaction}
                  disabled={!sendAmount || !sendToAddress}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                    sendAmount && sendToAddress
                      ? 'bg-[#0133a0] text-white hover:bg-[#012a8a] cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
      
      {/* Notification Manager */}
      <NotificationManager />
    </div>
  )
}
