import Docker from 'dockerode'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import { v4 as uuidv4 } from 'uuid'

const docker = new Docker()

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

const LANGUAGES: Record<string, LanguageConfig> = {
    javascript: {
        image: 'dsa-node-executor',
        filename: 'solution.js',
        runCmd: 'node solution.js'
    },
    python: {
        image: 'dsa-python-executor',
        filename: 'solution.py',
        runCmd: 'python3 solution.py'
    },
    cpp: {
        image: 'dsa-cpp-executor',
        filename: 'solution.cpp',
        compileCmd: 'g++ -o solution solution.cpp',
        runCmd: './solution'
    },
    java: {
        image: 'dsa-java-executor',
        filename: 'Solution.java',
        compileCmd: 'javac Solution.java',
        runCmd: 'java Solution'
    }
}

const EXECUTION_TIMEOUT = parseInt(process.env.EXECUTION_TIMEOUT || '5000', 10)
const MEMORY_LIMIT = parseInt(process.env.EXECUTION_MEMORY_LIMIT || '256', 10) * 1024 * 1024
const CPU_QUOTA = parseInt(process.env.EXECUTION_CPU_QUOTA || '50000', 10)

class ExecutionService {
    private async createTempDir(): Promise<string> {
        const tempDir = path.join(os.tmpdir(), 'dsa-execution', uuidv4())
        await fs.mkdir(tempDir, { recursive: true })
        return tempDir
    }

    private async cleanupTempDir(dir: string): Promise<void> {
        try {
            await fs.rm(dir, { recursive: true, force: true })
        } catch (error) {
            console.error(`Failed to cleanup temp dir ${dir}:`, error)
        }
    }

    async executeCode(
        code: string,
        language: string,
        input: string
    ): Promise<ExecutionResult> {
        const config = LANGUAGES[language.toLowerCase()]
        if (!config) {
            throw new Error(`Unsupported language: ${language}`)
        }

        const tempDir = await this.createTempDir()
        const startTime = Date.now()

        try {
            // Write code to file
            await fs.writeFile(path.join(tempDir, config.filename), code)

            // Create container
            const container = await docker.createContainer({
                Image: config.image,
                Cmd: ['sh', '-c', 'sleep 3600'], // Keep container running
                HostConfig: {
                    Memory: MEMORY_LIMIT,
                    CpuQuota: CPU_QUOTA,
                    NetworkMode: 'none',
                    Binds: [`${tempDir}:/code:rw`], // Read-write for compilation
                    ReadonlyRootfs: true
                },
                WorkingDir: '/code',
                Tty: false,
                OpenStdin: true
            })

            await container.start()

            try {
                // Compile if needed
                if (config.compileCmd) {
                    const compileExec = await container.exec({
                        Cmd: ['sh', '-c', config.compileCmd],
                        AttachStdout: true,
                        AttachStderr: true
                    })

                    const compileStream = await compileExec.start({})
                    let compileStderr = ''

                    compileStream.on('data', (chunk) => {
                        compileStderr += chunk.toString()
                    })

                    // Wait for compilation to finish
                    await new Promise<void>((resolve, reject) => {
                        compileStream.on('end', resolve)
                        compileStream.on('error', reject)
                    })

                    const compileInspect = await compileExec.inspect()
                    if (compileInspect.ExitCode !== 0) {
                        return {
                            stdout: '',
                            stderr: compileStderr || 'Compilation failed',
                            exitCode: compileInspect.ExitCode || 1,
                            executionTime: 0,
                            memoryUsage: 0
                        }
                    }
                }

                // Execute code
                const runExec = await container.exec({
                    Cmd: ['sh', '-c', config.runCmd],
                    AttachStdin: true,
                    AttachStdout: true,
                    AttachStderr: true
                })

                const runStream = await runExec.start({ hijack: true, stdin: true })

                let stdout = ''
                let stderr = ''

                // Handle output streams
                runStream.on('data', (chunk) => {
                    // Docker multiplexes stdout/stderr, simple parsing here
                    // In production, use docker-modem's demuxStream
                    const str = chunk.toString()
                    // Very basic heuristic to separate stdout/stderr if possible
                    // For now, just capturing everything
                    stdout += str
                })

                // Write input
                if (input) {
                    runStream.write(input)
                }
                runStream.end()

                // Wait for execution with timeout
                const executionPromise = new Promise<number>((resolve) => {
                    runStream.on('end', async () => {
                        const inspect = await runExec.inspect()
                        resolve(inspect.ExitCode || 0)
                    })
                })

                const timeoutPromise = new Promise<number>((_, reject) => {
                    setTimeout(() => reject(new Error('Time Limit Exceeded')), EXECUTION_TIMEOUT)
                })

                const exitCode = await Promise.race([executionPromise, timeoutPromise])
                const executionTime = Date.now() - startTime

                // Get memory usage (approximate from container stats)
                // For accurate per-process memory, we'd need more complex monitoring
                const stats = await container.stats({ stream: false })
                const memoryUsage = stats.memory_stats.usage || 0

                return {
                    stdout: stdout.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim(), // Clean control chars
                    stderr: stderr.trim(),
                    exitCode,
                    executionTime,
                    memoryUsage
                }

            } catch (error) {
                if (error instanceof Error && error.message === 'Time Limit Exceeded') {
                    return {
                        stdout: '',
                        stderr: 'Time Limit Exceeded',
                        exitCode: 124, // Standard timeout exit code
                        executionTime: EXECUTION_TIMEOUT,
                        memoryUsage: 0
                    }
                }
                throw error
            } finally {
                await container.stop().catch(() => { })
                await container.remove().catch(() => { })
            }

        } catch (error) {
            console.error('Execution error:', error)
            return {
                stdout: '',
                stderr: error instanceof Error ? error.message : 'Internal Execution Error',
                exitCode: 1,
                executionTime: 0,
                memoryUsage: 0,
                error: error instanceof Error ? error.message : 'Unknown error'
            }
        } finally {
            await this.cleanupTempDir(tempDir)
        }
    }
}

export const executionService = new ExecutionService()
