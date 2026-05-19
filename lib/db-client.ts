// Client-side database operations using API routes
export async function apiCall(endpoint: string, options?: RequestInit) {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Request failed')
  }
  
  return response.json()
}

export const dbClient = {
  auth: {
    signOut: async () => {
      return apiCall('/api/auth/logout', { method: 'POST' })
    },
  },
}
