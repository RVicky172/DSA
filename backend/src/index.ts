import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { ApiResponse } from './types'
import authRoutes from './routes/authRoutes'
import lessonRoutes from './routes/lessonRoutes'
import problemRoutes from './routes/problemRoutes'

dotenv.config()

const app: Express = express()
const PORT = process.env.PORT || 4000

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
}

// Middleware
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static frontend in production
const publicPath = path.join(__dirname, '..', 'public')
app.use(express.static(publicPath))

// API documentation available at /api/docs (Swagger UI - configured separately)
// Note: Swagger UI setup moved to production build

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  const response: ApiResponse<{ ok: boolean }> = {
    success: true,
    data: { ok: true },
    message: 'Server is running',
  }
  res.json(response)
})

// Mount API routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/lessons', lessonRoutes)
app.use('/api/v1/problems', problemRoutes)

// Sample data (will be replaced with database)
// Note: This data is no longer used - lessons are now served from the database via /api/v1/lessons
// const lessonsData = {
//   lessons: [
//     {
//       id: 1,
//       title: 'Arrays',
//       difficulty: 'Easy' as const,
//       category: 'Data Structures',
//       description: 'Learn about arrays and their operations',
//       content: 'Arrays are fundamental data structures...',
//     },
//     {
//       id: 2,
//       title: 'Linked Lists',
//       difficulty: 'Medium' as const,
//       category: 'Data Structures',
//       description: 'Master linked list concepts',
//       content: 'Linked lists provide dynamic memory allocation...',
//     },
//     {
//       id: 3,
//       title: 'Trees',
//       difficulty: 'Hard' as const,
//       category: 'Data Structures',
//       description: 'Deep dive into tree structures',
//       content: 'Trees are hierarchical data structures...',
//     },
//   ],
// }

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
