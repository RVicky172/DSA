import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { Problem } from '../types'
import '../styles/problems-list.css'

export const ProblemsListPage: React.FC = () => {
    const [problems, setProblems] = useState<Problem[]>([])
    const [loading, setLoading] = useState(true)
    const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD' | ''>('')

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                setLoading(true)
                const data = await api.getProblems({
                    difficulty: difficulty || undefined
                })
                setProblems(data.problems)
            } catch (err) {
                console.error('Failed to fetch problems:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchProblems()
    }, [difficulty])

    return (
        <div className="problems-list-page">
            <div className="problems-header">
                <h1>Problems</h1>
                <div className="filters">
                    <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as any)}
                        className="difficulty-select"
                    >
                        <option value="">All Difficulties</option>
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loading">Loading problems...</div>
            ) : (
                <div className="problems-grid">
                    {problems.map(problem => (
                        <Link to={`/problems/${problem.id}`} key={problem.id} className="problem-card">
                            <div className="problem-info">
                                <h3>{problem.title}</h3>
                                <span className={`difficulty-tag ${problem.difficulty.toLowerCase()}`}>
                                    {problem.difficulty}
                                </span>
                            </div>
                            <div className="problem-meta">
                                <span className="language-tag">{problem.language}</span>
                            </div>
                        </Link>
                    ))}

                    {problems.length === 0 && (
                        <div className="no-problems">
                            No problems found. Try adjusting filters.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
