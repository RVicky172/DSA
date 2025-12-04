import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getProblems, deleteProblem } from '../services/api'
import { Problem } from '../types'
import '../styles/admin.css'

export default function ManageProblemsPage() {
    const [problems, setProblems] = useState<Problem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadProblems()
    }, [])

    async function loadProblems() {
        try {
            setLoading(true)
            const data = await getProblems()
            setProblems(data.problems)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load problems')
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(problemId: string) {
        if (!confirm('Are you sure you want to delete this problem?')) {
            return
        }

        try {
            await deleteProblem(problemId)
            await loadProblems()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete problem')
        }
    }

    if (loading) {
        return <div className="admin-container"><p>Loading problems...</p></div>
    }

    if (error) {
        return <div className="admin-container"><p className="error">Error: {error}</p></div>
    }

    return (
        <div className="admin-container">
            <div className="page-header">
                <h1>Manage Problems</h1>
                <Link to="/admin/problems/new" className="btn btn-primary">Create New Problem</Link>
            </div>

            {problems.length === 0 ? (
                <p>No problems yet. Create your first problem!</p>
            ) : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Difficulty</th>
                            <th>Language</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {problems.map((problem) => (
                            <tr key={problem.id}>
                                <td><strong>{problem.title}</strong></td>
                                <td>
                                    <span className={`difficulty-badge difficulty-${problem.difficulty.toLowerCase()}`}>
                                        {problem.difficulty}
                                    </span>
                                </td>
                                <td>{problem.language}</td>
                                <td>{problem.createdAt ? new Date(problem.createdAt).toLocaleDateString() : 'N/A'}</td>
                                <td>
                                    <div className="action-buttons-inline">
                                        <Link to={`/problems/${problem.id}`} className="btn btn-sm btn-secondary">View</Link>
                                        <Link to={`/admin/problems/${problem.id}/edit`} className="btn btn-sm btn-primary">Edit</Link>
                                        <button onClick={() => handleDelete(problem.id)} className="btn btn-sm btn-danger">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}
