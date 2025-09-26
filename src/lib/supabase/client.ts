import { createBrowserClient } from '@supabase/ssr'

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not configured. Some features may not work.')
}

export const createClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are not configured. Please check your .env.local file.')
  }
  
  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      // Add global options for better error handling
      global: {
        headers: {
          'X-Client-Info': 'beyondrounds-web',
        },
      },
    }
  )
}

// Alternative client with minimal configuration for critical operations
export const createClientWithoutRealtime = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are not configured. Please check your .env.local file.')
  }
  
  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}