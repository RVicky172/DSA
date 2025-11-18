import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { ApiResponse } from './types/index.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app: Express = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static frontend in production
const publicPath = path.join(__dirname, '..', 'public')
app.use(express.static(publicPath))

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  const response: ApiResponse<{ ok: boolean }> = {
    success: true,
    data: { ok: true },
    message: 'Server is running',
  }
  res.json(response)
})

// Lessons endpoint (sample data - will be replaced with database queries)
app.get('/api/lessons', (_req: Request, res: Response) => {
  const response: ApiResponse<typeof lessonsData> = {
    success: true,
    data: lessonsData,
    message: 'Lessons retrieved successfully',
  }
  res.json(response)
})

// Get lesson by ID
app.get('/api/lessons/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const lesson = lessonsData.lessons.find((l) => l.id === parseInt(id))

  if (!lesson) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Lesson not found',
    }
    return res.status(404).json(response)
  }

  const response: ApiResponse<typeof lesson> = {
    success: true,
    data: lesson,
  }
  return res.json(response)
})

// Sample data (will be replaced with database)
const lessonsData = {
  lessons: [
    {
      id: 1,
      title: 'Arrays',
      difficulty: 'Easy' as const,
      category: 'Data Structures',
      description: 'Learn about arrays and their operations',
      content: 'Arrays are fundamental data structures...',
    },
    {
      id: 2,
      title: 'Linked Lists',
      difficulty: 'Medium' as const,
      category: 'Data Structures',
      description: 'Master linked list concepts',
      content: 'Linked lists provide dynamic memory allocation...',
    },
    {
      id: 3,
      title: 'Trees',
      difficulty: 'Hard' as const,
      category: 'Data Structures',
      description: 'Deep dive into tree structures',
      content: 'Trees are hierarchical data structures...',
    },
  ],
}

// Error handling middleware
// eslint-disable-next-line no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack)

  const response: ApiResponse<null> = {
    success: false,
    error: err.message || 'Internal Server Error',
  }

  res.status(500).json(response)
})

// SPA fallback: serve index.html for non-API routes
app.get('*', (req: Request, res: Response) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(publicPath, 'index.html'))
  }
})

// Start server
// eslint-disable-next-line no-console
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Backend server running on http://localhost:${PORT}`)
  // eslint-disable-next-line no-console
  console.log(`📁 Serving static files from ${publicPath}`)
})

export default app
