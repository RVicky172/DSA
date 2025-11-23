import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/not-found-page.css'

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()

  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1>404</h1>
        <p>Page Not Found</p>
        <p className="description">The page you're looking for doesn't exist or has been moved.</p>
        <button 
          className="btn-primary"
          onClick={() => navigate(isLoggedIn ? '/lessons' : '/')}
        >
          {isLoggedIn ? 'Back to Lessons' : 'Back to Home'}
        </button>
      </div>
    </div>
  )
}
