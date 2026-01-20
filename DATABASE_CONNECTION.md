# Database Connection Management

## Problem

PostgreSQL connections can timeout after periods of inactivity, especially with serverless databases like Neon. This causes errors when trying to query the database after the connection has been idle.

## Solution

We've implemented several strategies to handle connection timeouts:

### 1. Connection Pooling

The `DATABASE_URL` includes connection pooling parameters:

```env
DATABASE_URL="postgresql://...?connection_limit=10&pool_timeout=10&connect_timeout=5"
```

**Parameters:**
- `connection_limit=10`: Maximum number of connections in the pool
- `pool_timeout=10`: Time (seconds) to wait for an available connection
- `connect_timeout=5`: Connection timeout (seconds)

### 2. Prisma Client Configuration

The Prisma client in `lib/prisma.ts` is configured with:

- **Singleton pattern**: Reuses the same client instance across requests
- **Auto-connect**: Automatically connects on first use
- **Graceful shutdown**: Properly disconnects on process exit
- **Error handling**: Logs connection errors

### 3. Health Check System

The `lib/db-health.ts` module provides:

#### `checkDatabaseHealth()`
Performs periodic health checks (every 5 minutes) to keep the connection alive:

```typescript
import { checkDatabaseHealth } from '@/lib/db-health'

// In your API routes or server components
await checkDatabaseHealth()
```

#### `withDatabaseConnection()`
Wrapper function that automatically handles reconnection on connection errors:

```typescript
import { withDatabaseConnection } from '@/lib/db-health'

// Wrap your database operations
const result = await withDatabaseConnection(async () => {
  return await prisma.user.findMany()
})
```

## Usage Examples

### In API Routes

```typescript
import { prisma } from '@/lib/prisma'
import { withDatabaseConnection } from '@/lib/db-health'

export async function GET() {
  try {
    const users = await withDatabaseConnection(async () => {
      return await prisma.user.findMany()
    })
    
    return Response.json(users)
  } catch (error) {
    return Response.json({ error: 'Database error' }, { status: 500 })
  }
}
```

### In Server Components

```typescript
import { prisma } from '@/lib/prisma'
import { checkDatabaseHealth } from '@/lib/db-health'

export default async function Page() {
  // Optional: Check connection health
  await checkDatabaseHealth()
  
  const data = await prisma.user.findMany()
  
  return <div>{/* render data */}</div>
}
```

## Best Practices

1. **Use the pooler endpoint**: Always use Neon's `-pooler` endpoint for connection pooling
2. **Keep connections alive**: The health check runs automatically every 5 minutes
3. **Handle errors gracefully**: Use try-catch blocks and the `withDatabaseConnection` wrapper
4. **Monitor logs**: Check for connection errors in development and production
5. **Optimize queries**: Use `select` to fetch only needed fields
6. **Use transactions**: For multiple related operations, use Prisma transactions

## Neon-Specific Configuration

Neon provides two types of connection strings:

1. **Pooled connection** (recommended for serverless):
   ```
   postgresql://...@...-pooler.neon.tech/...
   ```
   - Uses PgBouncer for connection pooling
   - Better for serverless environments
   - Handles connection limits automatically

2. **Direct connection**:
   ```
   postgresql://...@....neon.tech/...
   ```
   - Direct connection to database
   - Use for migrations and admin tasks
   - Not recommended for application queries

We're using the **pooled connection** which is optimal for Next.js applications.

## Troubleshooting

### Connection Timeout Errors

If you see errors like:
- `P1001: Can't reach database server`
- `P1002: The database server was reached but timed out`
- `P1017: Server has closed the connection`

**Solutions:**
1. Check if your database is running
2. Verify the `DATABASE_URL` is correct
3. Ensure you're using the pooler endpoint
4. Check Neon dashboard for connection limits
5. Use `withDatabaseConnection` wrapper for automatic retry

### Too Many Connections

If you hit connection limits:
1. Reduce `connection_limit` in DATABASE_URL
2. Check for connection leaks (always use `prisma.$disconnect()` when done)
3. Use Neon's connection pooling (pooler endpoint)
4. Monitor active connections in Neon dashboard

### Slow Queries

If queries are slow after idle periods:
1. The health check will help keep connections warm
2. Consider using Neon's "Always Ready" feature (paid plans)
3. Optimize your queries with proper indexes
4. Use `select` to fetch only needed fields

## Monitoring

To monitor database connections:

1. **Neon Dashboard**: Check active connections and query performance
2. **Application Logs**: Monitor Prisma query logs in development
3. **Error Tracking**: Set up error tracking (Sentry, etc.) for production

## Additional Resources

- [Prisma Connection Management](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Neon Connection Pooling](https://neon.tech/docs/connect/connection-pooling)
- [Next.js Database Best Practices](https://nextjs.org/docs/app/building-your-application/data-fetching/patterns)
