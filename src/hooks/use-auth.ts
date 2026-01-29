'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

export interface User {
  id: string
  email: string
  name?: string
  username?: string
  bio?: string
  image?: string
  role?: string
  coins?: number
  level?: number
  streak?: number
  settingsNotifications?: any
  settingsPrivacy?: any
  settingsAppearance?: any
}

export function useAuth() {
  const { data: session, status, update: updateSession } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch full user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/user/settings')
          if (response.ok) {
            const userData = await response.json()
            setUser(userData)
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      }
      setIsLoading(false)
    }

    fetchUserData()
  }, [session?.user])

  // Update user data
  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null)
  }

  // Refresh from server
  const refreshUser = async () => {
    try {
      const response = await fetch('/api/user/settings')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
    }
  }

  return {
    user: user || {
      id: session?.user?.id || '',
      email: session?.user?.email || '',
      name: session?.user?.name || '',
      image: session?.user?.image || '',
    },
    isAuthenticated: !!session,
    isLoading: isLoading || status === 'loading',
    updateUser,
    refreshUser,
  }
}
