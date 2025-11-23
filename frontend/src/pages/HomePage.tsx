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

  const features = [
    {
      icon: '📚',
      title: 'Comprehensive Lessons',
      description: 'Structured curriculum covering all major DSA topics from basics to advanced'
    },
    {
      icon: '💻',
      title: 'Live Code Editor',
      description: 'Write and test your code in real-time with syntax highlighting'
    },
    {
      icon: '⚡',
      title: 'Instant Feedback',
      description: 'Get immediate feedback on your solutions with detailed test results'
    },
    {
      icon: '📊',
      title: 'Track Progress',
      description: 'Monitor your learning journey with detailed progress statistics'
    },
    {
      icon: '🎯',
      title: 'Practice Problems',
      description: 'Solve diverse problems to strengthen your understanding'
    },
    {
      icon: '🏆',
      title: 'Earn Badges',
      description: 'Complete challenges and earn achievement badges'
    }
  ]

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Master Data Structures & Algorithms</h1>
          <p>Learn DSA with interactive lessons, real-time code execution, and instant feedback. Perfect for interview prep and competitive programming.</p>
          <button 
            className="btn-primary btn-large"
            onClick={handleGetStarted}
            aria-label="Get started with DSA learning"
          >
            {isLoggedIn ? '→ Continue Learning' : '→ Get Started Free'}
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-container">
          <h2>Why Choose Our Platform?</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stats-container">
          <div className="stat-item">
            <h3>50+</h3>
            <p>DSA Topics</p>
          </div>
          <div className="stat-item">
            <h3>200+</h3>
            <p>Practice Problems</p>
          </div>
          <div className="stat-item">
            <h3>10K+</h3>
            <p>Active Learners</p>
          </div>
          <div className="stat-item">
            <h3>95%</h3>
            <p>Success Rate</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-content">
          <h2>Ready to Master DSA?</h2>
          <p>Start your learning journey today. No credit card required.</p>
          <button 
            className="btn-primary btn-large"
            onClick={handleGetStarted}
            aria-label="Start learning now"
          >
            {isLoggedIn ? 'Browse Lessons' : 'Sign Up Free'}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>&copy; 2025 DSA Learning Platform. All rights reserved.</p>
      </footer>
    </div>
  )
}
