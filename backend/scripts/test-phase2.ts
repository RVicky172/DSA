
import { submissionService } from '../src/services/submissionService'
import { executionService } from '../src/services/executionService'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testExecutionFlow() {
    console.log('🚀 Starting Phase 2 Integration Test...')

    let userId: string | null = null

    try {
        // 1. Test Docker Execution Directly
        console.log('\nTesting ExecutionService directly...')
        const jsCode = `console.log("Hello from Docker!");`
        const result = await executionService.executeCode(jsCode, 'javascript', '')
        console.log('JS Execution Result:', result)

        if (result.stdout.trim() === 'Hello from Docker!' && result.exitCode === 0) {
            console.log('✅ JS Execution Passed')
        } else {
            console.error('❌ JS Execution Failed')
        }

        // 2. Test Python Execution
        const pyCode = `print("Hello from Python!")`
        const pyResult = await executionService.executeCode(pyCode, 'python', '')
        console.log('Python Execution Result:', pyResult)

        if (pyResult.stdout.trim() === 'Hello from Python!' && pyResult.exitCode === 0) {
            console.log('✅ Python Execution Passed')
        } else {
            console.error('❌ Python Execution Failed')
        }

        // 3. Test Submission Flow with Database
        console.log('\nTesting SubmissionService with Database...')

        // Create dummy data
        const timestamp = Date.now()
        const user = await prisma.user.create({
            data: {
                email: `test_${timestamp}@example.com`,
                username: `testuser_${timestamp}`,
                password: 'hashedpassword123',
                role: 'STUDENT'
            }
        })
        userId = user.id
        console.log('Created test user:', user.id)

        const lesson = await prisma.lesson.create({
            data: {
                title: 'Test Lesson',
                description: 'Test Description',
                difficulty: 'EASY',
                category: 'Test',
                content: 'Test Content',
                authorId: user.id
            }
        })
        console.log('Created test lesson:', lesson.id)

        const problem = await prisma.problem.create({
            data: {
                title: 'Test Problem',
                description: 'Write a function that prints "Hello World"',
                difficulty: 'EASY',
                initialCode: 'console.log("Hello World")',
                language: 'javascript',
                lessonId: lesson.id,
                testCases: {
                    create: [
                        { input: '', output: 'Hello World', isHidden: false }
                    ]
                }
            }
        })
        console.log('Created test problem:', problem.id)

        // Test runCode
        console.log('Running code against problem...')
        const runResults = await submissionService.runCode(
            'console.log("Hello World")',
            'javascript',
            problem.id
        )
        console.log('Run Code Results:', runResults)

        if (runResults.length > 0 && runResults[0].status === 'PASSED') {
            console.log('✅ runCode Passed')
        } else {
            console.error('❌ runCode Failed')
        }

        // Test submitSolution
        console.log('Submitting solution...')
        const submissionResult = await submissionService.submitSolution(
            user.id,
            problem.id,
            'console.log("Hello World")',
            'javascript'
        )
        console.log('Submission Result:', submissionResult)

        if (submissionResult.status === 'ACCEPTED') {
            console.log('✅ submitSolution Passed')
        } else {
            console.error('❌ submitSolution Failed')
        }

    } catch (error) {
        console.error('❌ Test Failed:', error)
    } finally {
        // Cleanup
        if (userId) {
            console.log('Cleaning up test data...')
            await prisma.user.delete({ where: { id: userId } })
            console.log('✅ Cleanup complete')
        }
        await prisma.$disconnect()
    }
}

testExecutionFlow()
