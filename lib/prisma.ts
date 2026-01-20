import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma Client with optimized settings for Neon
const createPrismaClient = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

  return client
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Keep connection alive with periodic pings
let keepAliveInterval: NodeJS.Timeout | null = null
let isConnecting = false

if (typeof window === 'undefined') {
  // Only run on server side
  const startKeepAlive = () => {
    if (keepAliveInterval) return
    
    keepAliveInterval = setInterval(async () => {
      try {
        await prisma.$queryRaw`SELECT 1`
      } catch (error) {
        console.error('Keep-alive ping failed')
      }
    }, 4 * 60 * 1000) // Every 4 minutes (before Neon's 5-minute timeout)
  }
  
  // Start keep-alive after first connection (non-blocking)
  if (!isConnecting) {
    isConnecting = true
    prisma.$connect()
      .then(() => {
        console.log('✅ Database connected')
        startKeepAlive()
        isConnecting = false
      })
      .catch((err: any) => {
        console.error('❌ Failed to connect to database:', err.message)
        isConnecting = false
      })
  }
  
  // Graceful shutdown
  const cleanup = async () => {
    if (keepAliveInterval) {
      clearInterval(keepAliveInterval)
      keepAliveInterval = null
    }
    try {
      await prisma.$disconnect()
    } catch (error) {
      console.error('Error during disconnect:', error)
    }
  }
  
  process.on('beforeExit', cleanup)
  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
}

// Helper function to execute queries with retry logic
export async function executeWithRetry<T>(
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
        error.code === 'P1001' || // Can't reach database
        error.code === 'P1002' || // Timeout
        error.code === 'P1017' || // Server closed connection
        error.message?.includes('Connection') ||
        error.message?.includes('closed') ||
        error.message?.includes('timeout')
      
      if (isConnectionError && attempt < maxRetries) {
        console.log(`Connection error (attempt ${attempt}/${maxRetries}), retrying...`)
        
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 100
        await new Promise(resolve => setTimeout(resolve, delay))
        
        // Try to reconnect
        try {
          await prisma.$connect()
        } catch (reconnectError) {
          console.error('Reconnection attempt failed:', reconnectError)
        }
        
        continue // Retry the query
      }
      
      // If not a connection error or max retries reached, throw
      throw error
    }
  }
  
  throw lastError
}
