import { PrismaClient } from '@prisma/client'
import { executionService } from './executionService'

const prisma = new PrismaClient()

export interface SubmissionResult {
    submissionId: string
    status: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILATION_ERROR'
    score: number
    testResults: {
        input: string
        expectedOutput: string
        actualOutput: string
        status: 'PASSED' | 'FAILED' | 'ERROR'
        executionTime: number
    }[]
}

class SubmissionService {
    async submitSolution(
        userId: string,
        problemId: string,
        code: string,
        language: string
    ): Promise<SubmissionResult> {
        // 1. Create submission record
        const submission = await prisma.submission.create({
            data: {
                userId,
                problemId,
                code,
                language,
                status: 'PENDING'
            }
        })

        try {
            // 2. Fetch problem and test cases
            const problem = await prisma.problem.findUnique({
                where: { id: problemId },
                include: { testCases: true }
            })

            if (!problem) {
                throw new Error('Problem not found')
            }

            const testResults = []
            let passedCount = 0
            let finalStatus: SubmissionResult['status'] = 'ACCEPTED'

            // 3. Execute against each test case
            for (const testCase of problem.testCases) {
                const result = await executionService.executeCode(code, language, testCase.input)

                const isPassed = result.exitCode === 0 && result.stdout.trim() === testCase.output.trim()

                if (isPassed) {
                    passedCount++
                } else {
                    // Determine failure reason
                    if (result.stderr.includes('Time Limit Exceeded')) {
                        finalStatus = 'TIME_LIMIT_EXCEEDED'
                    } else if (result.exitCode !== 0) {
                        finalStatus = result.stderr.includes('Compilation failed') ? 'COMPILATION_ERROR' : 'RUNTIME_ERROR'
                    } else {
                        finalStatus = 'WRONG_ANSWER'
                    }
                }

                testResults.push({
                    input: testCase.input,
                    expectedOutput: testCase.output,
                    actualOutput: result.stdout,
                    status: isPassed ? 'PASSED' : 'FAILED',
                    executionTime: result.executionTime
                })

                // Optimization: Stop on first failure if we want strict evaluation
                // For now, running all to show full feedback
            }

            // 4. Calculate score
            const score = Math.round((passedCount / problem.testCases.length) * 100)
            if (score < 100 && finalStatus === 'ACCEPTED') {
                finalStatus = 'WRONG_ANSWER'
            }

            // 5. Update submission record
            await prisma.submission.update({
                where: { id: submission.id },
                data: {
                    status: finalStatus,
                    score,
                    result: JSON.stringify(testResults)
                }
            })

            // 6. Update user progress if accepted
            if (finalStatus === 'ACCEPTED') {
                await this.updateUserProgress(userId, problemId)
            }

            return {
                submissionId: submission.id,
                status: finalStatus,
                score,
                testResults: testResults as any
            }

        } catch (error) {
            console.error('Submission error:', error)
            await prisma.submission.update({
                where: { id: submission.id },
                data: { status: 'RUNTIME_ERROR' }
            })
            throw error
        }
    }

    async runCode(
        code: string,
        language: string,
        problemId: string
    ) {
        // Run against visible test cases only (no database record)
        const problem = await prisma.problem.findUnique({
            where: { id: problemId },
            include: {
                testCases: {
                    where: { isHidden: false }
                }
            }
        })

        if (!problem) throw new Error('Problem not found')

        const results = []
        for (const testCase of problem.testCases) {
            const result = await executionService.executeCode(code, language, testCase.input)
            results.push({
                input: testCase.input,
                expectedOutput: testCase.output,
                actualOutput: result.stdout,
                stderr: result.stderr,
                status: result.exitCode === 0 && result.stdout.trim() === testCase.output.trim() ? 'PASSED' : 'FAILED',
                executionTime: result.executionTime
            })
        }

        return results
    }

    private async updateUserProgress(userId: string, problemId: string) {
        // Check if already solved
        const existingProgress = await prisma.userProgress.findUnique({
            where: { userId }
        })

        // Logic to update progress counts...
        // This is a simplified version
        if (existingProgress) {
            await prisma.userProgress.update({
                where: { userId },
                data: {
                    problemsSolved: { increment: 1 },
                    totalScore: { increment: 10 } // 10 points per problem
                }
            })
        } else {
            await prisma.userProgress.create({
                data: {
                    userId,
                    problemsSolved: 1,
                    totalScore: 10
                }
            })
        }
    }

    async getUserSubmissions(userId: string, problemId: string) {
        return prisma.submission.findMany({
            where: { userId, problemId },
            orderBy: { createdAt: 'desc' }
        })
    }
}

export const submissionService = new SubmissionService()
