import { prisma } from './prisma'

let lastHealthCheck = Date.now()
const HEALTH_CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutes

/**
 * Performs a health check on the database connection
 * This helps prevent connection timeouts by keeping the connection alive
 */
export async function checkDatabaseHealth() {
  const now = Date.now()
  
  // Only check if it's been more than 5 minutes since last check
  if (now - lastHealthCheck < HEALTH_CHECK_INTERVAL) {
    return true
  }

  try {
    // Simple query to keep connection alive
    await prisma.$queryRaw`SELECT 1`
    lastHealthCheck = now
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    
    // Try to reconnect
    try {
      await prisma.$connect()
      lastHealthCheck = now
      return true
    } catch (reconnectError) {
      console.error('Failed to reconnect to database:', reconnectError)
      return false
    }
  }
}

/**
 * Wrapper function to execute queries with automatic reconnection
 * This is now less needed as the Prisma client has built-in retry logic
 */
export async function withDatabaseConnection<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: any
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      lastError = error
      
      // Check if it's a connection error
      const isConnectionError = 
        error.code === 'P1001' || // Can't reach database server
        error.code === 'P1002' || // Database server timeout
        error.code === 'P1017' || // Server closed connection
        error.message?.includes('Connection') ||
        error.message?.includes('closed') ||
        error.message?.includes('timeout')
      
      if (isConnectionError && attempt < maxRetries) {
        console.log(`Connection lost (attempt ${attempt}/${maxRetries}), retrying...`)
        
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 100
        await new Promise(resolve => setTimeout(resolve, delay))
        
        // Try to reconnect
        try {
          await prisma.$connect()
        } catch (reconnectError) {
          console.error('Reconnection attempt failed:', reconnectError)
        }
        
        continue // Retry the operation
      }
      
      // If it's not a connection error or we've exhausted retries, throw
      throw error
    }
  }
  
  throw lastError
}

/**
 * Ensures database connection is alive before executing operation
 * Useful for pages that might be accessed after long idle periods
 */
export async function ensureConnection<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    // Quick health check
    await prisma.$queryRaw`SELECT 1`
  } catch (error) {
    console.log('Connection check failed, reconnecting...')
    await prisma.$connect()
  }
  
  return await operation()
}
