import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface PrivateRouteProps {
  children: React.ReactNode
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isLoggedIn, loading } = useAuth()

  if (loading) {
    return <div className="loading-page">Loading...</div>
  }

  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}
