"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import NotificationManager from "@/components/NotificationManager"
import { isValidEthereumAddress, isValidAmount } from "@/lib/validation"

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
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [connectAddressError, setConnectAddressError] = useState("")
  const [showMintModal, setShowMintModal] = useState(false)
  const [mintAmount, setMintAmount] = useState("")
  const [mintAmountError, setMintAmountError] = useState("")
  const [isMintLoading, setIsMintLoading] = useState(false)
  const [isTransferLoading, setIsTransferLoading] = useState(false)
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)
  const [isDecrypting, setIsDecrypting] = useState(false)
  const [displayedBalance, setDisplayedBalance] = useState("")
  const [randomBalance, setRandomBalance] = useState("")


  const generateRandomBalance = (length: number) => {
    const randomChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += randomChars[Math.floor(Math.random() * randomChars.length)];
    }
    return result;
  };

  // Generate random balance when wallet is connected
  useEffect(() => {
    if (isConnected && !isBalanceVisible) {
      // Generate random balance with typical length (6-8 characters)
      const randomLength = Math.floor(Math.random() * 3) + 6; // 6-8 characters
      setRandomBalance(generateRandomBalance(randomLength));
    }
  }, [isConnected, isBalanceVisible]);

  const animateDecryption = (targetBalance: string) => {
    setIsDecrypting(true);
    
    // Start with random characters that keep changing
    let decryptionStep = 0;
    const maxSteps = 15; // Number of random changes before revealing
    
    const decryptionInterval = setInterval(() => {
      if (decryptionStep < maxSteps) {
        // Show random characters that keep changing
        const randomDisplay = generateRandomBalance(targetBalance.length);
        setDisplayedBalance(randomDisplay);
        decryptionStep++;
      } else {
        clearInterval(decryptionInterval);
        
        // Random reveal - characters reveal in random positions
        const revealedPositions = new Set<number>();
        const totalPositions = targetBalance.length;
        
        const revealInterval = setInterval(() => {
          if (revealedPositions.size < totalPositions) {
            // Pick a random position that hasn't been revealed yet
            let randomPos;
            do {
              randomPos = Math.floor(Math.random() * totalPositions);
            } while (revealedPositions.has(randomPos));
            
            revealedPositions.add(randomPos);
            
            // Build the display with revealed and random characters
            let display = "";
            for (let i = 0; i < totalPositions; i++) {
              if (revealedPositions.has(i)) {
                display += targetBalance[i];
              } else {
                display += generateRandomBalance(1);
              }
            }
            setDisplayedBalance(display);
          } else {
            clearInterval(revealInterval);
            setDisplayedBalance(targetBalance);
            setIsDecrypting(false);
          }
        }, 20); // Reveal random characters every 80ms
      }
    }, 50); // Change random characters every 120ms
  };

  const toggleBalanceVisibility = async () => {
    if (!isBalanceVisible) {
      try {
        // Use the new getPrivateKey utility function
        const privateKeyResult = await getPrivateKey(address);
        
        if (!privateKeyResult.success) {
          throw new Error(privateKeyResult.error || 'Failed to get private key');
        }
        
        const genPrivKey = privateKeyResult.genPrivKey;
        const secret = privateKeyResult.privateKey;
        // 2️⃣ Decrypt the user's balance
        const balanceResponse = await fetch('http://localhost:8000/decrypt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userAddress: address, genPrivKey, secret}),
        });
  
        if (!balanceResponse.ok) {
          throw new Error('Failed to decrypt balance');
        }
  
        const balanceData = await balanceResponse.json();
  
        // 3️⃣ Update state and start decryption animation
        if (balanceData.decryptedBalance !== undefined) {
          const actualBalance = balanceData.decryptedBalance.toString();
          setBalance(actualBalance);
          setIsBalanceVisible(true);
          
          // Start the decryption animation
          animateDecryption(actualBalance);
        }
  
        // 4️⃣ Show success notification
        if (typeof window !== 'undefined' && (window as any).showNotification) {
          (window as any).showNotification(
            'success',
            'Balance Revealed',
            'Your encrypted balance is now visible.',
            2000
          );
        }
      } catch (error) {
        console.error('Error revealing balance:', error);
        if (typeof window !== 'undefined' && (window as any).showNotification) {
          (window as any).showNotification(
            'error',
            'Error',
            'Failed to reveal balance. Please try again.',
            3000
          );
        }
      }
    } else {
      // Hide balance
      setIsBalanceVisible(false);
      setDisplayedBalance("");
      setIsDecrypting(false);
      
      // Generate new random balance for next reveal
      const randomLength = Math.floor(Math.random() * 3) + 6; // 6-8 characters
      setRandomBalance(generateRandomBalance(randomLength));
  
      if (typeof window !== 'undefined' && (window as any).showNotification) {
        (window as any).showNotification(
          'info',
          'Balance Hidden',
          'Your balance is now hidden for privacy.',
          2000
        );
      }
    }
  };
  

  const openConnectModal = () => {
    setShowConnectModal(true)
    setAddress("")
    setConnectAddressError("")
  }

  const closeConnectModal = () => {
    setShowConnectModal(false)
    setConnectAddressError("")
  }

  const validateConnectAddress = () => {
    if (!address.trim()) {
      setConnectAddressError("Wallet address is required")
      return false
    } else if (!isValidEthereumAddress(address.trim())) {
      setConnectAddressError("Please enter a valid Ethereum address (0x...)")
      return false
    } else {
      setConnectAddressError("")
      return true
    }
  }

  const getPrivateKey = async (userAddress: string) => {
    try {
      const response = await fetch('http://localhost:8000/genPrivKey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ useraddress: userAddress }),
      });

      if (!response.ok) {
        throw new Error('Failed to get private key');
      }

      const data = await response.json();
      return {
        success: true,
        genPrivKey: data.genPriv,
        privateKey: data.privateKey,
        data: data
      };
    } catch (error) {
      console.error('Error getting private key:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get private key'
      };
    }
  };

  const checkUserRegistration = async (userAddress: string) => {
    try {
      // Call the backend /genPrivKey endpoint directly to check registration and get private key
      const response = await fetch('http://localhost:8000/genPrivKey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ useraddress: userAddress }),
      });

      const data = await response.json();

      if (!data.privateKey) {
        // If genPrivKey fails, the address is not registered
        return { 
          isRegistered: false, 
          error: 'Address is not registered in the system' 
        };
      }

      
      // If we successfully get a private key, the address is registered
      return {
        isRegistered: true,
        message: 'Address is registered',
        address: userAddress,
        genPrivKey: data.genPriv,
        privateKey: data.privateKey,
        data: data
      };
    } catch (error) {
      console.error('Error checking user registration:', error);
      return { 
        isRegistered: false, 
        error: 'Failed to check registration' 
      };
    }
  };

  const fetchRecentTransactions = async (userAddress: string) => {
    setIsLoadingTransactions(true);
    try {
      console.log('Fetching transactions for address:', userAddress);
      console.log('API URL:', 'http://localhost:8000/getRecentTransactions');
      
      // Call the real API endpoint
      const response = await fetch('http://localhost:8000/getRecentTransactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: userAddress }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`Failed to fetch transactions: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (data.success === 'OK' && data.recentTransactionsLogs) {
        console.log('Processing transactions:', data.recentTransactionsLogs.length);
        console.log('All transactions from API:', data.recentTransactionsLogs);
        
        // Transform the API data to match our UI format
        const transformedTransactions = data.recentTransactionsLogs.map((tx: any, index: number) => {
          console.log(`Processing transaction ${index + 1}:`, {
            txHash: tx.txHash,
            type: tx.type,
            functionName: tx.functionName,
            from: tx.from,
            to: tx.to
          });
          
          // Use the type provided by the backend API
          let transactionType = tx.type;
          
          // Map backend types to frontend types
          if (transactionType === 'mint') {
            transactionType = 'mint/buy';
          } else if (transactionType === 'register') {
            transactionType = 'registration';
          } else if (transactionType === 'send') {
            transactionType = 'send';
          } else if (transactionType === 'receive') {
            transactionType = 'receive';
          } else {
            // Fallback: determine type based on addresses if backend doesn't provide type
            const isReceive = tx.to && tx.to.toLowerCase() === userAddress.toLowerCase();
            const isRegistration = tx.to && tx.to.toLowerCase() === '0x2B9DF1BdAE1f636aAf0c12D8Ad373B5FA74D6719'.toLowerCase();
            const isMint = tx.functionName === 'privateMint' || (tx.to && tx.to.toLowerCase() === '0xd4D0B2b129487D92D05bf304e45718Fc820d39A3'.toLowerCase());
            const isSend = tx.from && tx.from.toLowerCase() === userAddress.toLowerCase() && !isMint && !isRegistration;
            
            transactionType = isReceive ? 'receive' : isRegistration ? 'registration' : isMint ? 'mint/buy' : isSend ? 'send' : 'unknown';
          }
          
          // Convert timestamp to readable format
          const date = new Date(tx.timestamp * 1000); // Convert from seconds to milliseconds
          const now = new Date();
          const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
          
          let timeAgo = '';
          if (diffInHours < 1) {
            timeAgo = 'Just now';
          } else if (diffInHours < 24) {
            timeAgo = `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
          } else {
            const diffInDays = Math.floor(diffInHours / 24);
            timeAgo = `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
          }

          const transformedTx = {
            id: index + 1,
            type: transactionType,
            amount: tx.value ? (parseFloat(tx.value) / Math.pow(10, 18)).toFixed(4) : '0.0000', // Convert wei to ETH
            to: transactionType === 'send' ? tx.to : undefined,
            from: transactionType === 'receive' ? tx.from : undefined,
            status: 'completed', // Assuming all historical transactions are completed
            timestamp: timeAgo,
            txHash: tx.txHash,
            blockNumber: tx.blockNumber,
            functionName: tx.functionName || undefined,
            recipient: tx.recipient || undefined
          };
          
          console.log('Transformed transaction:', transformedTx);
          return transformedTx;
        });

        // Reverse the order to show newest transactions first
        setRecentTransactions(transformedTransactions.reverse());
        console.log('Transactions loaded successfully:', transformedTransactions.length);
        
        if (typeof window !== 'undefined' && (window as any).showNotification) {
          (window as any).showNotification('success', 'Transactions Loaded', `Loaded ${transformedTransactions.length} transactions`, 2000);
        }
      } else {
        console.log('No transactions found or invalid response format');
        setRecentTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Set empty array instead of sample data
      setRecentTransactions([]);
      
      if (typeof window !== 'undefined' && (window as any).showNotification) {
        (window as any).showNotification('error', 'Transaction Error', `Failed to load transactions: ${error instanceof Error ? error.message : 'Unknown error'}`, 4000);
      }
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const handleConnectWallet = async () => {
    if (!validateConnectAddress()) {
      return
    }
    
    const trimmedAddress = address.trim();
    
    // Check if user is registered and get private key
    const registrationCheck = await checkUserRegistration(trimmedAddress);
    
    if (!registrationCheck.isRegistered) {
      setConnectAddressError("This address is not registered in the system");
      if (typeof window !== 'undefined' && (window as any).showNotification) {
        (window as any).showNotification('error', 'Registration Required', 'This wallet address is not registered. Please register first.', 4000)
      }
      return;
    }
    
    // Private key is now available in registrationCheck.privateKey and registrationCheck.genPrivKey
    console.log('User registered! Private key available:', registrationCheck.privateKey);
    
    setIsConnected(true)
    setAddress(trimmedAddress)
    setBalance("1.2345")
    closeConnectModal()
    
    // Fetch recent transactions for the connected wallet
    await fetchRecentTransactions(trimmedAddress);
    
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
    setRecentTransactions([]) // Clear transactions when disconnecting
    
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

  const openMintModal = () => {
    setShowMintModal(true)
    setMintAmount("")
    setMintAmountError("")
  }

  const closeMintModal = () => {
    setShowMintModal(false)
    setMintAmount("")
    setMintAmountError("")
    setIsMintLoading(false)
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

  const validateMintAmount = () => {
    if (!mintAmount.trim()) {
      setMintAmountError("Amount is required")
      return false
    } else if (!isValidAmount(mintAmount.trim())) {
      setMintAmountError("Please enter a valid positive amount")
      return false
    } else {
      setMintAmountError("")
      return true
    }
  }

  const handleSendTransaction = async () => {
    if (!validateForm()) {
      return
    }
    
    setIsTransferLoading(true)
    
    try {
      // Get private key for the sender (current address)
      const senderPrivateKeyResult = await getPrivateKey(address);
      
      if (!senderPrivateKeyResult.success) {
        throw new Error(senderPrivateKeyResult.error || 'Failed to get sender private key');
      }
      
      const { genPrivKey: senderGenPrivKey, privateKey: senderPrivateKey } = senderPrivateKeyResult;
      
      // Get private key for the receiver (recipient address)
      const receiverPrivateKeyResult = await getPrivateKey(sendToAddress);
      
      if (!receiverPrivateKeyResult.success) {
        throw new Error(receiverPrivateKeyResult.error || 'Failed to get receiver private key');
      }
      
      const { genPrivKey: receiverGenPrivKey, privateKey: receiverPrivateKey } = receiverPrivateKeyResult;
      
      // Call the transferToken API with both sender and receiver keypairs
      const response = await fetch('http://localhost:8000/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: address, // sender address
          privateKey: senderPrivateKey, // sender private key
          genPrivKey: senderGenPrivKey, // sender genPrivKey
          
          receiverAddress: sendToAddress, // receiver address
          receiverPrivateKey: receiverPrivateKey, // receiver private key
          receiverGenPrivKey: receiverGenPrivKey, // receiver genPrivKey
          
          amount: sendAmount
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to transfer tokens');
      }

      const result = await response.json();
      console.log('Transfer result:', result);
      
      // Check if the transfer was successful
      if (result.status === 'OK') {
        // Add the new transaction to the list immediately
        const newTransaction = {
          id: Date.now(), // Use timestamp as unique ID
          type: 'send',
          amount: sendAmount,
          to: sendToAddress,
          status: 'completed',
          timestamp: 'Just now',
          txHash: result.txHash || 'Pending...',
          blockNumber: result.blockNumber || 'Pending...'
        };
        
        // Add to the beginning of the transactions list
        setRecentTransactions(prev => [newTransaction, ...prev]);
        
        // Refresh transaction list in the background (don't await)
        fetchRecentTransactions(address);
        
        // Show success notification
        if (typeof window !== 'undefined' && (window as any).showNotification) {
          (window as any).showNotification('success', 'Transfer Successful', `Successfully sent ${sendAmount} TAKAS to ${sendToAddress}`, 4000)
        }
        closeSendModal()
      } else {
        throw new Error(result.message || 'Transfer failed');
      }
    } catch (error) {
      console.error('Error transferring tokens:', error);
      if (typeof window !== 'undefined' && (window as any).showNotification) {
        (window as any).showNotification('error', 'Transfer Failed', 'Failed to transfer tokens. Please try again.', 4000)
      }
    } finally {
      setIsTransferLoading(false)
    }
  }

  const handleMintTransaction = async () => {
    if (!validateMintAmount()) {
      return
    }
    
    setIsMintLoading(true)
    
    try {
      // Get private key for the current address
      const privateKeyResult = await getPrivateKey(address);
      
      if (!privateKeyResult.success) {
        throw new Error(privateKeyResult.error || 'Failed to get private key');
      }
      
      const { genPrivKey, privateKey } = privateKeyResult;
      // Call the mintToken API
      const response = await fetch('http://localhost:8000/mintToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: mintAmount,
          address: address,
          privateKey: privateKey,
          genPrivKey: genPrivKey
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mint tokens');
      }

      const result = await response.json();
      console.log('Mint result:', result);
      
      // Add the new transaction to the list immediately
      const newTransaction = {
        id: Date.now(), // Use timestamp as unique ID
        type: 'mint/buy',
        amount: mintAmount,
        status: 'completed',
        timestamp: 'Just now',
        txHash: result.txHash || 'Pending...',
        blockNumber: result.blockNumber || 'Pending...'
      };
      
      // Add to the beginning of the transactions list
      setRecentTransactions(prev => [newTransaction, ...prev]);
      
      // Refresh transaction list in the background (don't await)
      fetchRecentTransactions(address);
      
      // Show success notification
      if (typeof window !== 'undefined' && (window as any).showNotification) {
        (window as any).showNotification('success', 'Tokens Minted', `Successfully minted ${mintAmount} TAKAS tokens`, 4000)
      }
      
      closeMintModal()
    } catch (error) {
      console.error('Error minting tokens:', error);
      if (typeof window !== 'undefined' && (window as any).showNotification) {
        (window as any).showNotification('error', 'Mint Failed', 'Failed to mint tokens. Please try again.', 4000)
      }
    } finally {
      setIsMintLoading(false)
    }
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
      case 'registration':
        return (
          <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                    <div className="flex items-center space-x-2">
                      {!isConnected && (
                        <div className="flex items-center space-x-1 animate-fade-in">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Disconnected</span>
                        </div>
                      )}
                      {isConnected && (
                        <div className="flex items-center space-x-1 animate-fade-in">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">Connected</span>
                        </div>
                      )}
                      <div className={`w-3 h-3 rounded-full transition-all duration-500 ${isConnected ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50' : 'bg-red-500'}`}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">Address:</span>
                      <div className="flex items-center gap-2">
                        {!isConnected ? (
                          <div className="flex items-center space-x-2">
                            <div className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 bg-[length:200%_100%] animate-pulse h-6 w-32 rounded font-mono"></div>
                            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 animate-fade-in-up">
                             <span className="font-mono text-base font-semibold text-gray-800 dark:text-white bg-gradient-to-r from-[#0133a0] to-[#012a8a] bg-clip-text text-transparent">{address}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(address);
                                if (typeof window !== 'undefined' && (window as any).showNotification) {
                                  (window as any).showNotification('success', 'Address Copied', 'Wallet address copied to clipboard!', 2000);
                                }
                              }}
                              className="cursor-pointer p-1 text-gray-500 hover:text-[#0133a0] dark:text-gray-400 dark:hover:text-yellow-500 transition-all duration-300 hover:scale-110 group"
                              title="Copy address to clipboard"
                            >
                              <svg className="w-4 h-4 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {!isConnected ? (
                      <div className="space-y-3">
                        <button
                          onClick={openConnectModal}
                          className="w-full bg-gradient-to-r from-[#0133a0] to-[#012a8a] text-white px-6 py-3 rounded-lg hover:from-[#012a8a] hover:to-[#0133a0] hover:scale-105 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl cursor-pointer flex items-center justify-center space-x-2 relative overflow-hidden group"
                        >
                          {/* Button shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                          <svg className="w-5 h-5 relative z-10 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span className="relative z-10">Connect Wallet</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={disconnectWallet}
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-red-800 hover:scale-105 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl cursor-pointer flex items-center justify-center space-x-2 relative overflow-hidden group animate-fade-in-up"
                      >
                        {/* Button shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <svg className="w-5 h-5 relative z-10 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="relative z-10">Disconnect Wallet</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Encrypted Balance Container */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    Encrypted Balance
                  </h3>
                  
                  <div className="text-center pt-8">
                    {!isConnected ? (
                      // Wallet not connected state - compact
                      <div className="space-y-4">
                        {/* Lock icon with animation - smaller */}
                        <div className="flex justify-center">
                          <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                              <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                            {/* Floating dots animation - smaller */}
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
                            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
                          </div>
                        </div>
                        
                        {/* Placeholder balance with shimmer effect - smaller */}
                        <div className="space-y-1">
                          <div className="text-3xl font-bold text-gray-300 dark:text-gray-600 mb-1 relative overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 bg-[length:200%_100%] animate-pulse h-10 w-40 mx-auto rounded"></div>
                          </div>
                          <div className="text-gray-400 dark:text-gray-500 text-sm">
                            TAKAS Tokens
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Wallet connected state - with animations
                      <div className="animate-fade-in-up">
                        {/* Animated balance display */}
                        <div className="relative">
                          <div className="text-4xl font-bold text-[#0133a0] dark:text-yellow-500 mb-2 relative flex items-end justify-center">
                            {isBalanceVisible ? (
                              <div className="relative">
                                {/* Decrypting animation overlay */}
                                {isDecrypting && (
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                                )}
                                
                                {/* Display the balance with random characters or actual balance */}
                                <span className="font-mono">
                                  {isDecrypting ? displayedBalance : balance}
                                  <span className={`animate-pulse text-[#0133a0] dark:text-yellow-500 ${isDecrypting ? 'opacity-100' : 'opacity-0'}`}>|</span>
                                </span>
                                
                                {/* Decryption particles */}
                                {isDecrypting && (
                                  <>
                                    <div className="absolute -top-1 -right-1 w-1 h-1 bg-green-400 rounded-full animate-ping"></div>
                                    <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{animationDelay: '0.3s'}}></div>
                                    <div className="absolute top-1/2 -right-2 w-1 h-1 bg-yellow-400 rounded-full animate-ping" style={{animationDelay: '0.6s'}}></div>
                                  </>
                                )}
                              </div>
                            ) : (
                              <span className="font-mono text-gray-400 dark:text-gray-500">
                                {randomBalance || "****"}
                              </span>
                            )}
                          </div>
                          
                          {/* Floating particles around balance */}
                          {!isDecrypting && (
                            <>
                              <div className="absolute -top-2 -right-2 w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                              <div className="absolute -bottom-2 -left-2 w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
                              <div className="absolute top-1/2 -left-3 w-1 h-1 bg-green-400 rounded-full animate-ping"></div>
                            </>
                          )}
                        </div>
                        
                        <div className="text-gray-600 dark:text-gray-300 mb-4 animate-fade-in" style={{animationDelay: '0.2s'}}>
                          TAKAS Tokens
                        </div>
                        
                        <button
                          onClick={toggleBalanceVisibility}
                          disabled={isDecrypting}
                          className={`px-6 py-3 rounded-lg font-semibold shadow-md transition-all duration-300 relative overflow-hidden group animate-fade-in-up ${
                            isDecrypting 
                              ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-gray-200 cursor-not-allowed' 
                              : 'bg-gradient-to-r from-[#f6b908] to-[#e6a800] text-[#0133a0] hover:from-[#e6a800] hover:to-[#f6b908] hover:scale-105 hover:shadow-lg cursor-pointer'
                          }`}
                          style={{animationDelay: '0.4s'}}
                        >
                          {/* Button shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                          
                          {/* Decrypting spinner */}
                          {isDecrypting && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            </div>
                          )}
                          
                          <span className={`relative z-10 ${isDecrypting ? 'opacity-0' : 'opacity-100'}`}>
                            {isBalanceVisible ? "Hide Balance" : "Reveal Balance"}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="mt-4 flex-1 flex flex-col justify-end pb-6">
                    {!isConnected ? (
                      // Wallet not connected - show styled placeholder actions - compact
                      <div className="space-y-3">
                        {/* Connect wallet CTA - compact */}
                        <div className="bg-gradient-to-r from-[#0133a0]/10 to-[#f6b908]/10 border border-[#0133a0]/20 dark:border-[#f6b908]/20 rounded-lg p-3 text-center">
                          <div className="flex items-center justify-center space-x-2 text-[#0133a0] dark:text-[#f6b908] mb-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span className="text-xs font-semibold">Unlock Features</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300">Connect wallet to access all features</p>
                        </div>
                      </div>
                    ) : (
                      // Wallet connected - show actual action buttons - animated
                      <div className="grid grid-cols-2 gap-3 w-full">
                        <button
                          onClick={openSendModal}
                          className="w-full h-16 p-3 rounded-lg font-medium text-sm shadow-sm hover:shadow-lg transition-all duration-300 flex flex-row items-center justify-center gap-2 bg-gradient-to-r from-[#0133a0] to-[#012a8a] text-white hover:from-[#012a8a] hover:to-[#0133a0] hover:scale-105 cursor-pointer animate-fade-in-up relative overflow-hidden group"
                          style={{animationDelay: '0.6s'}}
                        >
                          {/* Button shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                          <svg className="w-6 h-6 relative z-10 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          <span className="relative z-10">Send</span>
                        </button>
                        
                        <button
                          onClick={openMintModal}
                          className="w-full h-16 p-3 rounded-lg font-medium text-sm shadow-sm hover:shadow-lg transition-all duration-300 flex flex-row items-center justify-center gap-2 bg-gradient-to-r from-[#0133a0] to-[#012a8a] text-white hover:from-[#012a8a] hover:to-[#0133a0] hover:scale-105 cursor-pointer animate-fade-in-up relative overflow-hidden group"
                          style={{animationDelay: '0.7s'}}
                        >
                          {/* Button shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                          <svg className="w-6 h-6 relative z-10 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M21 9.5C21 11.9853 16.9706 14 12 14M21 9.5C21 7.01472 16.9706 5 12 5C7.02944 5 3 7.01472 3 9.5M21 9.5V15C21 17.2091 16.9706 19 12 19M12 14C7.02944 14 3 11.9853 3 9.5M12 14V19M3 9.5V15C3 17.2091 7.02944 19 12 19M7 18.3264V13.2422M17 18.3264V13.2422" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span className="relative z-10">Mint</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            if (typeof window !== 'undefined' && (window as any).showNotification) {
                              (window as any).showNotification('warning', 'Receive', 'Receive functionality will be implemented soon!', 3000)
                            }
                          }}
                          className="w-full h-16 p-3 rounded-lg font-medium text-sm shadow-sm hover:shadow-lg transition-all duration-300 flex flex-row items-center justify-center gap-2 bg-gradient-to-r from-[#0133a0] to-[#012a8a] text-white hover:from-[#012a8a] hover:to-[#0133a0] hover:scale-105 cursor-pointer animate-fade-in-up relative overflow-hidden group"
                          style={{animationDelay: '0.8s'}}
                        >
                          {/* Button shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                          <svg className="w-6 h-6 relative z-10 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                          </svg>
                          <span className="relative z-10">Receive</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            if (typeof window !== 'undefined' && (window as any).showNotification) {
                              (window as any).showNotification('warning', 'Swap', 'Swap functionality will be implemented soon!', 3000)
                            }
                          }}
                          className="w-full h-16 p-3 rounded-lg font-medium text-sm shadow-sm hover:shadow-lg transition-all duration-300 flex flex-row items-center justify-center gap-2 bg-gradient-to-r from-[#0133a0] to-[#012a8a] text-white hover:from-[#012a8a] hover:to-[#0133a0] hover:scale-105 cursor-pointer animate-fade-in-up relative overflow-hidden group"
                          style={{animationDelay: '0.9s'}}
                        >
                          {/* Button shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                          <svg className="w-6 h-6 relative z-10 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                          <span className="relative z-10">Swap</span>
                        </button>
                      </div>
                    )}
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
                    {(() => {
                      console.log('Transaction display logic - isLoadingTransactions:', isLoadingTransactions, 'recentTransactions.length:', recentTransactions.length, 'isConnected:', isConnected);
                      console.log('recentTransactions array:', recentTransactions);
                      return null;
                    })()}
                    {isLoadingTransactions ? (
                      // Loading state
                      <div className="flex items-center justify-center py-8">
                        <div className="flex flex-col items-center space-y-3">
                          <svg className="animate-spin h-8 w-8 text-[#0133a0] dark:text-yellow-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Loading transactions...</p>
                        </div>
                      </div>
                    ) : recentTransactions.length > 0 ? (
                      // Show transactions
                      recentTransactions.map((tx) => {
                        console.log('Displaying transaction:', tx);
                        return (
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
                              {tx.type === 'send' ? `To: ${tx.to ? `${tx.to.slice(0, 6)}...${tx.to.slice(-4)}` : 'Unknown'}` : 
                               tx.type === 'receive' ? `From: ${tx.from ? `${tx.from.slice(0, 6)}...${tx.from.slice(-4)}` : 'Unknown'}` : 
                               tx.type === 'registration' ? 'Registrar.sol' :
                               tx.type === 'mint/buy' ? 'EncryptedERC.sol' :
                               'Unknown'}
                            </p>
                            <p className="text-sm font-medium text-gray-800 dark:text-white">
                              {generateRandomBalance(6)} TAKAS
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {tx.timestamp}
                            </p>
                            <div className="flex items-center space-x-2">
                              {tx.blockNumber && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                                  Block: {tx.blockNumber}
                                </p>
                              )}
                              {tx.txHash && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                                  {`${tx.txHash.slice(0, 8)}...${tx.txHash.slice(-6)}`}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                        );
                      })
                    ) : !isConnected ? (
                      // Wallet not connected state
                      <div className="flex items-center justify-center py-8">
                        <div className="flex flex-col items-center space-y-4">
                          {/* Animated wallet icon */}
                          <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center shadow-lg">
                              <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                            </div>
                            {/* Floating particles */}
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>
                            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                          </div>
                          
                          {/* Styled content */}
                          <div className="text-center space-y-2">
                            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Transaction History</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Your transaction history will appear here</p>
                          </div>
                          
                          {/* Feature preview */}
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 w-full">
                            <div className="flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400 mb-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-sm font-medium">Connect to View History</span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300 text-center">Connect your wallet to see all your send, receive, mint, and swap transactions</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Empty state when connected but no transactions
                      <div className="flex items-center justify-center py-8">
                        <div className="flex flex-col items-center space-y-3">
                          <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <p className="text-sm text-gray-600 dark:text-gray-300">No transactions found</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Your transaction history will appear here</p>
                        </div>
                      </div>
                    )}
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
                  disabled={isTransferLoading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0133a0] focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-200 ${
                    amountError 
                      ? 'border-red-500 dark:border-red-400' 
                      : 'border-gray-300 dark:border-gray-600'
                  } ${isTransferLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                  disabled={isTransferLoading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0133a0] focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-200 font-mono text-sm ${
                    addressError 
                      ? 'border-red-500 dark:border-red-400' 
                      : 'border-gray-300 dark:border-gray-600'
                  } ${isTransferLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                  disabled={isTransferLoading}
                  className={`flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors duration-200 font-medium ${
                    isTransferLoading
                      ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendTransaction}
                  disabled={!sendAmount || !sendToAddress || isTransferLoading}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${
                    sendAmount && sendToAddress && !isTransferLoading
                      ? 'bg-[#0133a0] text-white hover:bg-[#012a8a] cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isTransferLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Transferring...
                    </>
                  ) : (
                    'Send'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connect Wallet Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with blur */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={closeConnectModal}
          />
          
          {/* Modal content */}
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200/50 dark:border-gray-700/50 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                Connect Wallet
              </h3>
              <button
                onClick={closeConnectModal}
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
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value)
                    if (connectAddressError) setConnectAddressError("")
                  }}
                  placeholder="0x..."
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0133a0] focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-200 font-mono text-sm ${
                    connectAddressError 
                      ? 'border-red-500 dark:border-red-400' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {connectAddressError && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {connectAddressError}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                      Enter your wallet address
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                      Make sure to enter a valid Ethereum address starting with 0x
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={closeConnectModal}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConnectWallet}
                  disabled={!address}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                    address
                      ? 'bg-[#0133a0] text-white hover:bg-[#012a8a] cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mint Token Modal */}
      {showMintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with blur */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={closeMintModal}
          />
          
          {/* Modal content */}
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200/50 dark:border-gray-700/50 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                Mint Tokens
              </h3>
              <button
                onClick={closeMintModal}
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
                  Amount to Mint (TAKAS)
                </label>
                <input
                  type="number"
                  value={mintAmount}
                  onChange={(e) => {
                    setMintAmount(e.target.value)
                    if (mintAmountError) setMintAmountError("")
                  }}
                  placeholder="0.0000"
                  step="0.0001"
                  min="0"
                  disabled={isMintLoading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0133a0] focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-200 ${
                    mintAmountError 
                      ? 'border-red-500 dark:border-red-400' 
                      : 'border-gray-300 dark:border-gray-600'
                  } ${isMintLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                {mintAmountError && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {mintAmountError}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                      Mint New Tokens
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                      Enter the amount of TAKAS tokens you want to mint to your wallet
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={closeMintModal}
                  disabled={isMintLoading}
                  className={`flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors duration-200 font-medium ${
                    isMintLoading
                      ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleMintTransaction}
                  disabled={!mintAmount || isMintLoading}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${
                    mintAmount && !isMintLoading
                      ? 'bg-[#0133a0] text-white hover:bg-[#012a8a] cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isMintLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Minting...
                    </>
                  ) : (
                    'Mint Tokens'
                  )}
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
