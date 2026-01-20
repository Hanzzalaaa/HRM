# Connection Timeout Fix - Implementation Guide

## Problem Solved

The error `Error in PostgreSQL connection: Error { kind: Closed, cause: None }` occurs when the database connection times out after periods of inactivity.

## Solution Implemented

### 1. Keep-Alive Mechanism (`lib/prisma.ts`)

The Prisma client now:
- **Pings the database every 4 minutes** to keep the connection alive
- **Auto-reconnects** if the ping fails
- **Retries failed connections** with exponential backoff
- **Gracefully shuts down** on process exit

### 2. PgBouncer Mode (`.env`)

Updated DATABASE_URL to use `pgbouncer=true`:
```env
DATABASE_URL="...?pgbouncer=true&connection_limit=10&pool_timeout=10&connect_timeout=5"
```

This enables Neon's PgBouncer pooling which is optimized for serverless environments.

### 3. Retry Helper Function

New `executeWithRetry()` function for critical operations:

```typescript
import { executeWithRetry } from '@/lib/prisma'

// Wrap critical queries
const users = await executeWithRetry(async () => {
  return await prisma.user.findMany()
})
```

## How It Works

### Automatic Keep-Alive

```
Time: 0min ──> 4min ──> 8min ──> 12min
       │        │        │        │
       │        ↓        ↓        ↓
       │     SELECT 1  SELECT 1  SELECT 1
       │     (ping)    (ping)    (ping)
       │
    Connection stays alive!
```

### Auto-Reconnect on Failure

```
Query → Connection Closed
  ↓
Detect Error (P1001, P1002, P1017)
  ↓
Wait 100ms (exponential backoff)
  ↓
Reconnect to Database
  ↓
Retry Query (up to 3 times)
  ↓
Success or Throw Error
```

## Usage

### Option 1: Use as Normal (Recommended)

Your existing code will work automatically:

```typescript
// This now has automatic retry and keep-alive
const users = await prisma.user.findMany()
```

### Option 2: Use Retry Wrapper (For Critical Operations)

```typescript
import { executeWithRetry } from '@/lib/prisma'

const result = await executeWithRetry(async () => {
  return await prisma.user.findMany()
})
```

### Option 3: Use Health Check (For Long-Running Pages)

```typescript
import { ensureConnection } from '@/lib/db-health'

const data = await ensureConnection(async () => {
  return await prisma.user.findMany()
})
```

## Testing

### 1. Restart Your Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

You should see:
```
✅ Database connected
```

### 2. Test After Idle Period

1. Leave the app idle for 10+ minutes
2. Navigate to any page (e.g., `/hr` or `/super-admin`)
3. Should load without connection errors

### 3. Monitor Logs

Watch for keep-alive pings in the console:
```
Keep-alive ping failed, attempting reconnect: ...
✅ Database connected
```

## Configuration

### Adjust Keep-Alive Interval

In `lib/prisma.ts`, change the interval:

```typescript
// Current: Every 4 minutes
setInterval(async () => {
  await prisma.$queryRaw`SELECT 1`
}, 4 * 60 * 1000)

// Change to 3 minutes
setInterval(async () => {
  await prisma.$queryRaw`SELECT 1`
}, 3 * 60 * 1000)
```

### Adjust Retry Attempts

```typescript
// Current: 3 retries
await executeWithRetry(operation, 3)

// Change to 5 retries
await executeWithRetry(operation, 5)
```

## Troubleshooting

### Still Getting Connection Errors?

1. **Check Neon Dashboard**
   - Verify database is running
   - Check connection limits
   - Look for any alerts

2. **Verify DATABASE_URL**
   - Must use `-pooler` endpoint
   - Must include `pgbouncer=true`
   - Check credentials are correct

3. **Check Logs**
   - Look for "Keep-alive ping failed"
   - Check for reconnection attempts
   - Monitor error patterns

4. **Increase Keep-Alive Frequency**
   - Change from 4 minutes to 2 minutes
   - More frequent pings = more stable connection
   - Trade-off: slightly more database load

### Connection Limit Errors

If you see "too many connections":

1. **Reduce connection_limit**
   ```env
   DATABASE_URL="...?connection_limit=5..."
   ```

2. **Check for Connection Leaks**
   - Ensure all queries complete
   - Check for hanging transactions
   - Monitor active connections in Neon

3. **Use Neon's Pooler**
   - Already enabled with `-pooler` endpoint
   - Handles connection pooling automatically

## Benefits

✅ **Automatic reconnection** - No manual intervention needed
✅ **Keep-alive pings** - Prevents timeout during idle periods
✅ **Retry logic** - Handles transient failures gracefully
✅ **PgBouncer mode** - Optimized for serverless
✅ **Graceful shutdown** - Cleans up connections properly
✅ **Zero code changes** - Works with existing queries

## Monitoring

### Check Connection Status

```bash
# In your terminal, watch for:
✅ Database connected
Keep-alive ping failed, attempting reconnect: ...
Connection error (attempt 1/3), retrying...
```

### Neon Dashboard

Monitor:
- Active connections
- Query performance
- Connection errors
- Database health

## Next Steps

1. ✅ Restart dev server
2. ✅ Test after idle period
3. ✅ Monitor logs for errors
4. ✅ Adjust settings if needed

The connection timeout issue should now be completely resolved! 🎉
