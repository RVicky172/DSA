import React from 'react'
import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
    children: React.ReactNode
    requiredRole?: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const userStr = localStorage.getItem('user')

    if (!userStr) {
        // Not logged in, redirect to auth page
        return <Navigate to="/auth" replace />
    }

    if (requiredRole) {
        try {
            const user = JSON.parse(userStr)
            const userRole = user.role as string

            // Check if user has required role
            if (requiredRole === 'ADMIN' && userRole !== 'ADMIN') {
                return (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <h2>403 - Forbidden</h2>
                        <p>You do not have permission to access this page.</p>
                        <p>Admin access required.</p>
                    </div>
                )
            }

            if (requiredRole === 'INSTRUCTOR' && !['INSTRUCTOR', 'ADMIN'].includes(userRole)) {
                return (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <h2>403 - Forbidden</h2>
                        <p>You do not have permission to access this page.</p>
                        <p>Instructor or Admin access required.</p>
                    </div>
                )
            }
        } catch (error) {
            console.error('Error parsing user data:', error)
            return <Navigate to="/auth" replace />
        }
    }

    return <>{children}</>
}
