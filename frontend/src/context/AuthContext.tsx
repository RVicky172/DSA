import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import apiService from '../services/api'
import type { AuthContextType, User } from '../types/index'

/**
 * AuthContext provides authentication state and methods
 * Manages user login, signup, logout, and token persistence
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const storedUser = localStorage.getItem('user')

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser))
        setIsLoggedIn(true)
      } catch (error) {
        console.error('Failed to restore user from localStorage:', error)
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await apiService.login(email, password)
      const { token, user: userData } = response

      localStorage.setItem('authToken', token)
      localStorage.setItem('user', JSON.stringify(userData))

      setUser(userData)
      setIsLoggedIn(true)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const signup = async (
    email: string,
    username: string,
    password: string
  ): Promise<void> => {
    try {
      const response = await apiService.signup(email, username, password)
      const { token, user: userData } = response

      localStorage.setItem('authToken', token)
      localStorage.setItem('user', JSON.stringify(userData))

      setUser(userData)
      setIsLoggedIn(true)
    } catch (error) {
      console.error('Signup failed:', error)
      throw error
    }
  }

  const logout = (): void => {
    apiService.logout()
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setUser(null)
    setIsLoggedIn(false)
  }

  if (loading) {
    return <div className="auth-loading">Loading authentication...</div>
  }

  const value: AuthContextType = {
    user,
    isLoggedIn,
    loading,
    login,
    signup,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Custom hook to use AuthContext
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
