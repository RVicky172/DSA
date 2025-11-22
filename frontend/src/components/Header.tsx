import React from 'react'
import { useAuth } from '../context/AuthContext.js'
import '../styles/header.css'

interface HeaderProps {
  onLoginClick?: () => void
  onSignupClick?: () => void
}

export const Header: React.FC<HeaderProps> = ({ onLoginClick, onSignupClick }) => {
  const { isLoggedIn, user, logout } = useAuth()

  const handleLogout = (): void => {
    logout()
  }

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-logo">
          <h1>📚 DSA Learning Platform</h1>
        </div>

        <nav className="header-nav">
          {isLoggedIn ? (
            <div className="user-menu">
              <span className="user-name">Welcome, {user?.username}!</span>
              <button className="btn-secondary" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="btn-secondary" onClick={onLoginClick}>
                Login
              </button>
              <button className="btn-primary" onClick={onSignupClick}>
                Sign Up
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
