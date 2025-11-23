import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import '../styles/auth.css'

interface LoginProps {
  onSwitchToSignup?: () => void
}

export const Login: React.FC<LoginProps> = ({ onSwitchToSignup }) => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!email || !password) {
        addToast('Please fill in all fields', 'warning')
        setLoading(false)
        return
      }

      console.log('🔐 Attempting login with email:', email)
      
      await login(email, password)
      
      console.log('✅ Login successful!')
      addToast('Login successful! Redirecting...', 'success')
      
      // Reset form
      setEmail('')
      setPassword('')
      
      // Navigate to lessons
      setTimeout(() => navigate('/lessons'), 500)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      console.error('❌ Login error:', errorMessage)
      addToast(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container login-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your account</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-primary btn-block" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <button
            type="button"
            className="link-button"
            onClick={onSwitchToSignup}
            disabled={loading}
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  )
}
