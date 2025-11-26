import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { CodeEditor } from '../components/CodeEditor'
import api from '../services/api'
import { Problem, ExecutionResult, SubmissionResult } from '../types'
import '../styles/problem-page.css'

export const ProblemPage: React.FC = () => {
    const { id } = useParams<{ id: string }>()

    const [problem, setProblem] = useState<Problem | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [code, setCode] = useState('')
    const [language, setLanguage] = useState('javascript')
    const [isRunning, setIsRunning] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [executionResults, setExecutionResults] = useState<ExecutionResult[] | null>(null)
    const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null)
    const [activeTab, setActiveTab] = useState<'description' | 'submissions'>('description')

    useEffect(() => {
        const fetchProblem = async () => {
            if (!id) return
            try {
                setLoading(true)
                const data = await api.getProblemById(id)
                setProblem(data)
                setCode(data.initialCode || '')
                setLanguage(data.language || 'javascript')
            } catch (err) {
                setError('Failed to load problem')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchProblem()
    }, [id])

    const handleRunCode = async () => {
        if (!id || !code) return

        try {
            setIsRunning(true)
            setExecutionResults(null)
            setSubmissionResult(null)

            const results = await api.runCode(id, code, language)
            setExecutionResults(results)
        } catch (err) {
            console.error('Run code error:', err)
            // Handle error display
        } finally {
            setIsRunning(false)
        }
    }

    const handleSubmit = async () => {
        if (!id || !code) return

        try {
            setIsSubmitting(true)
            setExecutionResults(null)
            setSubmissionResult(null)

            const result = await api.submitSolution(id, code, language)
            setSubmissionResult(result)
        } catch (err) {
            console.error('Submission error:', err)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) return <div className="loading-page">Loading problem...</div>
    if (error || !problem) return <div className="error-page">{error || 'Problem not found'}</div>

    return (
        <div className="problem-page">
            <div className="problem-left-panel">
                <div className="panel-header">
                    <div className="tabs">
                        <button
                            className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                            onClick={() => setActiveTab('description')}
                        >
                            Description
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
                            onClick={() => setActiveTab('submissions')}
                        >
                            Submissions
                        </button>
                    </div>
                </div>

                <div className="panel-content">
                    {activeTab === 'description' ? (
                        <div className="problem-description">
                            <h1>{problem.title}</h1>
                            <div className="difficulty-badge" data-level={problem.difficulty}>
                                {problem.difficulty}
                            </div>

                            <div className="markdown-content">
                                {/* We'll use a markdown renderer later, for now just text */}
                                <p>{problem.description}</p>
                            </div>

                            {problem.testCases && problem.testCases.length > 0 && (
                                <div className="examples-section">
                                    <h3>Examples</h3>
                                    {problem.testCases.filter(tc => !tc.isHidden).map((tc, idx) => (
                                        <div key={tc.id || idx} className="example-card">
                                            <div className="example-input">
                                                <strong>Input:</strong>
                                                <pre>{tc.input}</pre>
                                            </div>
                                            <div className="example-output">
                                                <strong>Output:</strong>
                                                <pre>{tc.output}</pre>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="submissions-list">
                            <p>Submission history coming soon...</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="problem-right-panel">
                <div className="editor-section">
                    <CodeEditor
                        initialCode={code}
                        language={language}
                        onChange={(val) => setCode(val || '')}
                        onRun={handleRunCode}
                        onSubmit={handleSubmit}
                        isRunning={isRunning}
                        isSubmitting={isSubmitting}
                    />
                </div>

                {(executionResults || submissionResult) && (
                    <div className="results-section">
                        <div className="results-header">
                            <h3>Execution Results</h3>
                            <button className="close-results" onClick={() => {
                                setExecutionResults(null)
                                setSubmissionResult(null)
                            }}>×</button>
                        </div>

                        <div className="results-content">
                            {submissionResult ? (
                                <div className={`submission-verdict ${submissionResult.status.toLowerCase()}`}>
                                    <h2>{submissionResult.status.replace(/_/g, ' ')}</h2>
                                    <div className="score-circle">
                                        <span>{submissionResult.score}%</span>
                                    </div>
                                </div>
                            ) : null}

                            {executionResults && (
                                <div className="test-cases-list">
                                    {executionResults.map((res, idx) => (
                                        <div key={idx} className={`test-case-result ${res.exitCode === 0 ? 'passed' : 'failed'}`}>
                                            <div className="tc-header">
                                                <span className="tc-status">{res.exitCode === 0 ? '✅ Passed' : '❌ Failed'}</span>
                                                <span className="tc-time">{res.executionTime}ms</span>
                                            </div>
                                            {res.exitCode !== 0 && (
                                                <div className="tc-error">
                                                    <pre>{res.stderr || res.stdout}</pre>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
