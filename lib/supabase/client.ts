// Compatibility layer - redirects to new auth system
export function createClient() {
  return {
    auth: {
      signOut: async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        return { error: null }
      },
    },
  }
}
