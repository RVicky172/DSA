import { useEffect, useState } from 'react'
import { getAdminStats } from '../services/api'
import { Link } from 'react-router-dom'
import '../styles/admin.css'

interface AdminStats {
    users: number
    lessons: number
    problems: number
    submissions: number
    recentActivity: Array<{
        id: string
        username: string
        problemTitle: string
        status: string
        score: number
        createdAt: string
    }>
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadStats()
    }, [])

    async function loadStats() {
        try {
            setLoading(true)
            const data = await getAdminStats()
            setStats(data)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load statistics')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="admin-container"><p>Loading dashboard...</p></div>
    }

    if (error) {
        return <div className="admin-container"><p className="error">Error: {error}</p></div>
    }

    if (!stats) {
        return <div className="admin-container"><p>No data available</p></div>
    }

    return (
        <div className="admin-container">
            <h1>Admin Dashboard</h1>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Users</h3>
                    <p className="stat-number">{stats.users}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Lessons</h3>
                    <p className="stat-number">{stats.lessons}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Problems</h3>
                    <p className="stat-number">{stats.problems}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Submissions</h3>
                    <p className="stat-number">{stats.submissions}</p>
                </div>
            </div>

            <div className="admin-actions">
                <h2>Quick Actions</h2>
                <div className="action-buttons">
                    <Link to="/admin/lessons" className="btn btn-primary">Manage Lessons</Link>
                    <Link to="/admin/problems" className="btn btn-primary">Manage Problems</Link>
                </div>
            </div>

            <div className="recent-activity">
                <h2>Recent Activity</h2>
                {stats.recentActivity && stats.recentActivity.length > 0 ? (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Problem</th>
                                <th>Status</th>
                                <th>Score</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentActivity.map((activity) => (
                                <tr key={activity.id}>
                                    <td>{activity.username}</td>
                                    <td>{activity.problemTitle}</td>
                                    <td>
                                        <span className={`status-badge status-${activity.status.toLowerCase()}`}>
                                            {activity.status}
                                        </span>
                                    </td>
                                    <td>{activity.score}%</td>
                                    <td>{new Date(activity.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No recent activity</p>
                )}
            </div>
        </div>
    )
}
