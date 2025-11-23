import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import '../styles/auth.css'

interface SignupProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

export const Signup: React.FC<SignupProps> = ({ onSuccess, onSwitchToLogin }) => {
  const { signup } = useAuth()
  const [email, setEmail] = useState<string>('')
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validation
      if (!email || !username || !password || !confirmPassword) {
        throw new Error('All fields are required')
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match')
      }

      console.log('📝 Attempting signup with email:', email, 'username:', username)
      
      await signup(email, username, password)
      
      console.log('✅ Signup successful!')
      
      // Reset form
      setEmail('')
      setUsername('')
      setPassword('')
      setConfirmPassword('')
      
      // Call success callback
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed'
      console.error('❌ Signup error:', errorMessage, err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container signup-container">
      <div className="auth-card">
        <h2>Create Your Account</h2>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
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
              placeholder="Enter a password (min 6 characters)"
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
              placeholder="Confirm your password"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
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
            Login here
          </button>
        </p>
      </div>
    </div>
  )
}
