import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { User } from '../types'
import '../styles/dashboard.css'

export const DashboardPage: React.FC = () => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await api.getCurrentUser()
                setUser(userData)

                // In a real app, we'd have a dedicated dashboard endpoint
                // For now, we'll just fetch some recent submissions if we had a way
                // But our API currently requires problemId for submissions
                // We'll skip fetching submissions for now or implement a new endpoint later
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) return <div className="loading-page">Loading dashboard...</div>

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h1>Welcome back, {user?.username}!</h1>
                <p className="subtitle">Ready to continue your learning journey?</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📚</div>
                    <div className="stat-info">
                        <h3>Lessons</h3>
                        <p className="stat-value">0</p>
                        <p className="stat-label">Completed</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">🧩</div>
                    <div className="stat-info">
                        <h3>Problems</h3>
                        <p className="stat-value">0</p>
                        <p className="stat-label">Solved</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">🔥</div>
                    <div className="stat-info">
                        <h3>Streak</h3>
                        <p className="stat-value">1</p>
                        <p className="stat-label">Day</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="section-header">
                    <h2>Continue Learning</h2>
                </div>

                <div className="recommendations-grid">
                    <Link to="/lessons" className="recommendation-card">
                        <div className="card-icon">📖</div>
                        <div className="card-content">
                            <h3>Browse Lessons</h3>
                            <p>Explore new topics and concepts</p>
                        </div>
                        <div className="card-arrow">→</div>
                    </Link>

                    <Link to="/problems" className="recommendation-card">
                        <div className="card-icon">💻</div>
                        <div className="card-content">
                            <h3>Solve Problems</h3>
                            <p>Practice your coding skills</p>
                        </div>
                        <div className="card-arrow">→</div>
                    </Link>
                </div>

                <div className="section-header">
                    <h2>Recent Activity</h2>
                </div>

                <div className="activity-list">
                    <div className="empty-state">
                        <p>No recent activity. Start solving problems!</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
