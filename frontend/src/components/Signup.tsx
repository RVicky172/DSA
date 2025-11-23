import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import '../styles/auth.css'

interface SignupProps {
  onSwitchToLogin?: () => void
}

export const Signup: React.FC<SignupProps> = ({ onSwitchToLogin }) => {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [email, setEmail] = useState<string>('')
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validation
      if (!email || !username || !password || !confirmPassword) {
        addToast('Please fill in all fields', 'warning')
        setLoading(false)
        return
      }

      if (username.length < 3) {
        addToast('Username must be at least 3 characters', 'warning')
        setLoading(false)
        return
      }

      if (password.length < 6) {
        addToast('Password must be at least 6 characters', 'warning')
        setLoading(false)
        return
      }

      if (password !== confirmPassword) {
        addToast('Passwords do not match', 'warning')
        setLoading(false)
        return
      }

      console.log('📝 Attempting signup with email:', email, 'username:', username)
      
      await signup(email, username, password)
      
      console.log('✅ Signup successful!')
      addToast('Account created successfully! Redirecting...', 'success')
      
      // Reset form
      setEmail('')
      setUsername('')
      setPassword('')
      setConfirmPassword('')
      
      // Navigate to lessons
      setTimeout(() => navigate('/lessons'), 500)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed'
      console.error('❌ Signup error:', errorMessage)
      addToast(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container signup-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join our learning community</p>
        
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
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
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

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <button
            type="button"
            className="link-button"
            onClick={onSwitchToLogin}
            disabled={loading}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}
