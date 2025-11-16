import React, { useState } from 'react'

export default function App() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    console.log('Login attempt:', { email, password })
    // API call will go here
    setShowLoginModal(false)
  }

  const handleSignup = (e) => {
    e.preventDefault()
    console.log('Signup attempt:', { firstName, lastName, email, password })
    // API call will go here
    setShowSignupModal(false)
  }

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="container flex flex-between">
          <div className="navbar-brand">
            <h1 className="gradient-text" style={{ fontSize: '1.5rem', marginBottom: 0 }}>
              DSA Learning
            </h1>
          </div>
          <div className="navbar-menu">
            <a href="#features">Features</a>
            <a href="#testimonials">Testimonials</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div className="navbar-auth">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowLoginModal(true)}
            >
              Login
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowSignupModal(true)}
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="gradient-text animate-in">
              Master Data Structures & Algorithms
            </h1>
            <p className="hero-subtitle animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Learn from interactive lessons, solve challenging problems, and join thousands of developers
              advancing their coding skills
            </p>
            <div className="hero-buttons animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => setShowSignupModal(true)}
              >
                Get Started Free
              </button>
              <button className="btn btn-secondary btn-lg">
                Explore Lessons
              </button>
            </div>
          </div>
          <div className="hero-graphic">
            <div className="floating-card animate-float">
              <div className="card-icon">📊</div>
            </div>
            <div className="floating-card animate-float" style={{ animationDelay: '0.5s' }}>
              <div className="card-icon">⚡</div>
            </div>
            <div className="floating-card animate-float" style={{ animationDelay: '1s' }}>
              <div className="card-icon">🚀</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section features">
        <div className="container">
          <div className="section-title">
            <h2>Why Choose DSA Learning?</h2>
            <p>Everything you need to master data structures and algorithms</p>
          </div>
          <div className="grid grid-3">
            {[
              {
                icon: '📚',
                title: 'Comprehensive Lessons',
                desc: 'Learn from beginner to advanced topics with detailed explanations'
              },
              {
                icon: '💻',
                title: 'Interactive Problems',
                desc: 'Solve real-world problems with instant feedback and solutions'
              },
              {
                icon: '📈',
                title: 'Progress Tracking',
                desc: 'Monitor your learning journey with detailed analytics'
              },
              {
                icon: '🏆',
                title: 'Achievements',
                desc: 'Unlock badges and certificates as you complete milestones'
              },
              {
                icon: '👥',
                title: 'Community',
                desc: 'Connect with other learners and share your progress'
              },
              {
                icon: '⚡',
                title: 'Real-time Execution',
                desc: 'Run and test your code instantly in multiple languages'
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="card animate-slide-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="section testimonials">
        <div className="container">
          <div className="section-title">
            <h2>What Our Users Say</h2>
            <p>Join thousands of developers who've transformed their skills</p>
          </div>
          <div className="grid grid-2">
            {[
              {
                name: 'Sarah Chen',
                role: 'Software Engineer at Google',
                image: '👩‍💼',
                rating: 5,
                text: 'DSA Learning helped me prepare for my dream job. The structured approach and real-world problems made all the difference.'
              },
              {
                name: 'Alex Rodriguez',
                role: 'Full Stack Developer',
                image: '👨‍💻',
                rating: 5,
                text: 'Finally understood the concepts I struggled with before. The interactive lessons are incredibly effective.'
              },
              {
                name: 'Priya Sharma',
                role: 'Competitive Programmer',
                image: '👩‍🚀',
                rating: 5,
                text: 'Best platform for algorithm practice. Clear explanations and challenging problems keep me engaged.'
              },
              {
                name: 'Michael Johnson',
                role: 'CS Student',
                image: '👨‍🎓',
                rating: 5,
                text: 'Made my university coursework so much easier. I recommend it to all my classmates.'
              }
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className="card animate-slide-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="testimonial-header flex flex-between">
                  <div className="testimonial-user">
                    <div className="testimonial-avatar">{testimonial.image}</div>
                    <div>
                      <h4>{testimonial.name}</h4>
                      <p className="testimonial-role">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="stars">
                    {'⭐'.repeat(testimonial.rating)}
                  </div>
                </div>
                <p className="testimonial-text">{testimonial.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="section pricing">
        <div className="container">
          <div className="section-title">
            <h2>Simple, Transparent Pricing</h2>
            <p>Choose the plan that fits your learning goals</p>
          </div>
          <div className="grid grid-3" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {[
              {
                name: 'Free',
                price: '$0',
                features: [
                  'Basic DSA lessons',
                  'Limited problem sets',
                  'Community support',
                  'Progress tracking'
                ],
                cta: 'Get Started'
              },
              {
                name: 'Pro',
                price: '$9.99',
                popular: true,
                features: [
                  'All Free features',
                  'Advanced lessons',
                  'Unlimited problems',
                  'Priority support',
                  'Code execution environment',
                  'Certificate of completion'
                ],
                cta: 'Start Free Trial'
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                features: [
                  'All Pro features',
                  'Team management',
                  'Custom curriculum',
                  'Dedicated support',
                  'API access',
                  'Analytics dashboard'
                ],
                cta: 'Contact Sales'
              }
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`card pricing-card animate-slide-up ${
                  plan.popular ? 'popular' : ''
                }`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {plan.popular && (
                  <div className="popular-badge">Most Popular</div>
                )}
                <h3>{plan.name}</h3>
                <div className="price">
                  <span className="amount">{plan.price}</span>
                  {plan.price !== 'Custom' && <span className="period">/month</span>}
                </div>
                <button
                  className={plan.popular ? 'btn btn-primary' : 'btn btn-secondary'}
                  style={{ width: '100%', marginTop: '1.5rem', marginBottom: '1.5rem' }}
                  onClick={() =>
                    plan.name === 'Free'
                      ? null
                      : setShowSignupModal(true)
                  }
                >
                  {plan.cta}
                </button>
                <ul className="features-list">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx}>
                      <span>✓</span> {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta">
        <div className="container text-center">
          <h2 className="gradient-text" style={{ marginBottom: '1rem' }}>
            Ready to Start Learning?
          </h2>
          <p style={{ marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Join our community of learners and start your DSA journey today. No credit card required.
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => setShowSignupModal(true)}
          >
            Sign Up Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>DSA Learning</h4>
              <p>Master data structures and algorithms the right way.</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#testimonials">Testimonials</a></li>
                <li><a href="#pricing">Pricing</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Resources</h4>
              <ul>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Documentation</a></li>
                <li><a href="#">Community</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Privacy</a></li>
                <li><a href="#">Terms</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 DSA Learning Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex flex-between">
              <h2>Login to Your Account</h2>
              <button
                className="close-btn"
                onClick={() => setShowLoginModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleLogin} className="modal-form">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Login
              </button>
              <p className="modal-footer-text">
                Don't have an account?{' '}
                <a
                  href="#signup"
                  onClick={(e) => {
                    e.preventDefault()
                    setShowLoginModal(false)
                    setShowSignupModal(true)
                  }}
                >
                  Sign up here
                </a>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {showSignupModal && (
        <div className="modal-overlay" onClick={() => setShowSignupModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex flex-between">
              <h2>Create Your Account</h2>
              <button
                className="close-btn"
                onClick={() => setShowSignupModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSignup} className="modal-form">
              <div className="flex" style={{ gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>First Name</label>
                  <input
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Last Name</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Create Account
              </button>
              <p className="modal-footer-text">
                Already have an account?{' '}
                <a
                  href="#login"
                  onClick={(e) => {
                    e.preventDefault()
                    setShowSignupModal(false)
                    setShowLoginModal(true)
                  }}
                >
                  Login here
                </a>
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
