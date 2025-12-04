/**
 * Execution Service
 * 
 * NOTE: Docker-based execution requires 'dockerode' package (removed to avoid dependency issues)
 * 
 * For production deployment, integrate with:
 * - Judge0 API (recommended): https://judge0.com
 * - AWS Lambda + custom Docker images
 * - Kubernetes cluster with job runners
 * 
 * This implementation provides mock/stub responses for local development
 */

export interface ExecutionResult {
    stdout: string
    stderr: string
    exitCode: number
    executionTime: number // in ms
    memoryUsage: number // in bytes
    error?: string
}

interface LanguageConfig {
    image: string
    filename: string
    compileCmd?: string
    runCmd: string
}

// Language configurations (for reference when using actual execution)
const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
    python: {
        image: 'python:3.11-slim',
        filename: 'solution.py',
        runCmd: 'python solution.py'
    },
    javascript: {
        image: 'node:18-alpine',
        filename: 'solution.js',
        runCmd: 'node solution.js'
    },
    java: {
        image: 'openjdk:17-slim',
        filename: 'Solution.java',
        compileCmd: 'javac Solution.java',
        runCmd: 'java Solution'
    },
    cpp: {
        image: 'gcc:11',
        filename: 'solution.cpp',
        compileCmd: 'g++ -o solution solution.cpp',
        runCmd: './solution'
    },
    c: {
        image: 'gcc:11',
        filename: 'solution.c',
        compileCmd: 'gcc -o solution solution.c',
        runCmd: './solution'
    },
}

/**
 * Mock execution service
 * Returns simulated execution results for testing/development
 * 
 * For real execution, implement with Docker, Judge0, or similar
 */
export async function executeCode(
    code: string,
    language: string,
    input?: string,
    _timeLimit: number = 5000,
    _memoryLimit: number = 256
): Promise<ExecutionResult> {
    const startTime = Date.now()

    try {
        // Validate language
        if (!LANGUAGE_CONFIGS[language]) {
            return {
                stdout: '',
                stderr: `Unsupported language: ${language}`,
                exitCode: 1,
                executionTime: Date.now() - startTime,
                memoryUsage: 0,
                error: `Language '${language}' is not supported`
            }
        }

        // Mock execution: simulate successful run
        // In production, this would actually execute the code
        const mockOutput = generateMockOutput(code, language, input)

        return {
            stdout: mockOutput,
            stderr: '',
            exitCode: 0,
            executionTime: Math.random() * 1000 + 100, // Simulate 100-1100ms execution
            memoryUsage: Math.random() * 50 * 1024 * 1024, // Simulate 0-50MB
        }
    } catch (error) {
        return {
            stdout: '',
            stderr: error instanceof Error ? error.message : 'Unknown error',
            exitCode: 1,
            executionTime: Date.now() - startTime,
            memoryUsage: 0,
            error: 'Execution failed'
        }
    }
}

/**
 * Generate mock output for development
 * Replace with real execution engine in production
 */
function generateMockOutput(code: string, language: string, input?: string): string {
    // Simple heuristic: if code contains print/console.log, return a mock output
    const hasPrintStatement = /print|console\.log|println|cout|printf/i.test(code)

    if (!hasPrintStatement) {
        // Code doesn't seem to produce output
        return ''
    }

    // Return a mock output
    if (input) {
        return `Echo: ${input}`
    }

    return 'Hello, World!'
}

/**
 * Submit code for execution via Judge0 API (production)
 * Requires JUDGE0_API_KEY and JUDGE0_API_URL env variables
 */
export async function submitToJudge0(
    code: string,
    language: string,
    input?: string
): Promise<ExecutionResult> {
    const judgeApiUrl = process.env.JUDGE0_API_URL
    const judgeApiKey = process.env.JUDGE0_API_KEY

    if (!judgeApiUrl || !judgeApiKey) {
        return {
            stdout: '',
            stderr: 'Judge0 API not configured. Please set JUDGE0_API_URL and JUDGE0_API_KEY',
            exitCode: 1,
            executionTime: 0,
            memoryUsage: 0,
            error: 'Judge0 API not available'
        }
    }

    // Language ID mapping for Judge0
    const languageIds: Record<string, number> = {
        python: 71,
        javascript: 63,
        java: 62,
        cpp: 54,
        c: 50,
    }

    const languageId = languageIds[language]
    if (!languageId) {
        return {
            stdout: '',
            stderr: `Unsupported language: ${language}`,
            exitCode: 1,
            executionTime: 0,
            memoryUsage: 0,
            error: `Language '${language}' is not supported on Judge0`
        }
    }

    try {
        // Submit to Judge0
        const submitResponse = await fetch(`${judgeApiUrl}/submissions?base64_encoded=false`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-Token': judgeApiKey,
            },
            body: JSON.stringify({
                source_code: code,
                language_id: languageId,
                stdin: input || '',
                cpu_time_limit: 5,
                memory_limit: 256000,
            }),
        })

        const submitData = (await submitResponse.json()) as { token: string }

        // Poll for result
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let result: any = null
        let attempts = 0
        while (attempts < 30) {
            const resultResponse = await fetch(
                `${judgeApiUrl}/submissions/${submitData.token}?base64_encoded=false`,
                {
                    headers: {
                        'X-Auth-Token': judgeApiKey,
                    },
                }
            )
            result = await resultResponse.json()

            if (result.status?.id !== 1 && result.status?.id !== 2) {
                break
            }

            await new Promise(resolve => setTimeout(resolve, 200))
            attempts++
        }

        if (!result) {
            throw new Error('No result from Judge0')
        }

        return {
            stdout: result.stdout || '',
            stderr: result.stderr || '',
            exitCode: result.status?.id === 3 ? 0 : 1,
            executionTime: (result.time || 0) * 1000,
            memoryUsage: (result.memory || 0) * 1024,
            error: result.status?.description || undefined,
        }
    } catch (error) {
        return {
            stdout: '',
            stderr: error instanceof Error ? error.message : 'Unknown error',
            exitCode: 1,
            executionTime: 0,
            memoryUsage: 0,
            error: 'Judge0 submission failed'
        }
    }
}
