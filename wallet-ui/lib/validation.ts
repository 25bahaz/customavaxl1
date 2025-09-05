/**
 * Validates if a string is a valid Ethereum address
 * @param address - The address string to validate
 * @returns boolean - True if valid, false otherwise
 */
export function isValidEthereumAddress(address: string): boolean {
  // Check if address is a string and has the right length
  if (typeof address !== 'string' || address.length !== 42) {
    return false
  }

  // Check if address starts with '0x'
  if (!address.startsWith('0x')) {
    return false
  }

  // Check if the remaining characters are valid hex (0-9, a-f, A-F)
  const hexRegex = /^0x[a-fA-F0-9]{40}$/
  return hexRegex.test(address)
}

/**
 * Validates if a string is a valid amount (positive number)
 * @param amount - The amount string to validate
 * @returns boolean - True if valid, false otherwise
 */
export function isValidAmount(amount: string): boolean {
  if (!amount || amount.trim() === '') {
    return false
  }

  const num = parseFloat(amount)
  return !isNaN(num) && num > 0 && isFinite(num)
}
