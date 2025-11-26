import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import '../styles/header.css'

export const Header: React.FC = () => {
  const { isLoggedIn, user, logout } = useAuth()
  const navigate = useNavigate()
  const { addToast } = useToast()

  const handleLogout = (): void => {
    try {
      logout()
      addToast('Successfully logged out', 'success')
      navigate('/')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed'
      addToast(message, 'error')
    }
  }

  const handleLogoClick = (): void => {
    navigate('/')
  }

  const handleLoginClick = (): void => {
    navigate('/auth')
  }

  const handleLessonsClick = (): void => {
    navigate('/lessons')
  }

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-logo" onClick={handleLogoClick} role="button" tabIndex={0}>
          <h1>📚 DSA Platform</h1>
        </div>

        <nav className="header-nav">
          {isLoggedIn ? (
            <div className="user-menu">
              <span className="user-name">👤 {user?.username}</span>
              <button
                className="btn-secondary"
                onClick={handleLessonsClick}
                aria-label="Go to lessons"
              >
                Lessons
              </button>
              <button
                className="btn-secondary"
                onClick={handleLogout}
                aria-label="Logout"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button
                className="btn-secondary"
                onClick={handleLoginClick}
                aria-label="Login"
              >
                Login
              </button>
              <button
                className="btn-primary"
                onClick={handleLoginClick}
                aria-label="Sign up"
              >
                Sign Up
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
