import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getLessons, deleteLesson } from '../services/api'
import { Lesson } from '../types'
import '../styles/admin.css'

export default function ManageLessonsPage() {
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadLessons()
    }, [])

    async function loadLessons() {
        try {
            setLoading(true)
            const data = await getLessons()
            setLessons(data.lessons)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load lessons')
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(lessonId: string) {
        if (!confirm('Are you sure you want to delete this lesson? This will also delete all associated problems.')) {
            return
        }

        try {
            await deleteLesson(lessonId)
            await loadLessons()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete lesson')
        }
    }

    if (loading) {
        return <div className="admin-container"><p>Loading lessons...</p></div>
    }

    if (error) {
        return <div className="admin-container"><p className="error">Error: {error}</p></div>
    }

    return (
        <div className="admin-container">
            <div className="page-header">
                <h1>Manage Lessons</h1>
                <Link to="/admin/lessons/new" className="btn btn-primary">Create New Lesson</Link>
            </div>

            {lessons.length === 0 ? (
                <p>No lessons yet. Create your first lesson!</p>
            ) : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Difficulty</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lessons.map((lesson) => (
                            <tr key={lesson.id}>
                                <td><strong>{lesson.title}</strong></td>
                                <td>{lesson.category}</td>
                                <td>
                                    <span className={`difficulty-badge difficulty-${lesson.difficulty.toLowerCase()}`}>
                                        {lesson.difficulty}
                                    </span>
                                </td>
                                <td>{lesson.createdAt ? new Date(lesson.createdAt).toLocaleDateString() : 'N/A'}</td>
                                <td>
                                    <div className="action-buttons-inline">
                                        <Link to={`/lessons/${lesson.id}`} className="btn btn-sm btn-secondary">View</Link>
                                        <Link to={`/admin/lessons/${lesson.id}/edit`} className="btn btn-sm btn-primary">Edit</Link>
                                        <button onClick={() => handleDelete(lesson.id)} className="btn btn-sm btn-danger">Delete</button>
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
