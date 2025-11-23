import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/home-page.css'

export const HomePage: React.FC = () => {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()

  const handleGetStarted = (): void => {
    if (isLoggedIn) {
      navigate('/lessons')
    } else {
      navigate('/auth')
    }
  }

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Master Data Structures & Algorithms</h1>
          <p>Learn DSA with interactive lessons, real-time code execution, and instant feedback</p>
          <button className="btn-primary btn-large" onClick={handleGetStarted}>
            {isLoggedIn ? 'Continue Learning' : 'Get Started'}
          </button>
        </div>
      </section>

      <section className="features">
        <h2>Why Choose Our Platform?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Comprehensive Lessons</h3>
            <p>Structured curriculum covering all major DSA topics from basics to advanced</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💻</div>
            <h3>Live Code Editor</h3>
            <p>Write and test your code in real-time with syntax highlighting</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Instant Feedback</h3>
            <p>Get immediate feedback on your solutions with detailed test results</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Track Progress</h3>
            <p>Monitor your learning journey with detailed progress statistics</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Ready to Master DSA?</h2>
        <button className="btn-primary btn-large" onClick={handleGetStarted}>
          {isLoggedIn ? 'Browse Lessons' : 'Sign Up Free'}
        </button>
      </section>
    </div>
  )
}
