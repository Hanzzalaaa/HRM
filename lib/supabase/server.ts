// Compatibility layer - use getCurrentUser from lib/auth instead
import { getCurrentUser } from '@/lib/auth'

export function createClient() {
  return {
    auth: {
      getUser: async () => {
        const user = await getCurrentUser()
        return { data: { user }, error: null }
      },
    },
  }
}
