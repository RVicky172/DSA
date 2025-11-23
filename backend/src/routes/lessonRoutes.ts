import { Router, Request, Response, NextFunction } from 'express'
import { lessonService, CreateLessonInput, UpdateLessonInput } from '../services/lessonService'
import { verifyToken, isInstructor, isAdmin } from '../middleware/authMiddleware'
import type { ApiResponse } from '../types'
import type { AuthRequest } from '../middleware/authMiddleware'

const router = Router()

// GET /api/v1/lessons - Get all lessons with pagination and filtering
router.get('/', async (_req: Request, res: Response, _next: NextFunction) => {
  try {
    const category = typeof _req.query.category === 'string' ? _req.query.category : undefined
    const difficulty = typeof _req.query.difficulty === 'string' ? _req.query.difficulty : undefined
    const skip = typeof _req.query.skip === 'string' ? parseInt(_req.query.skip, 10) : 0
    const take = typeof _req.query.take === 'string' ? parseInt(_req.query.take, 10) : 10

    const { lessons, total } = await lessonService.getAllLessons({
      category,
      difficulty: difficulty as 'EASY' | 'MEDIUM' | 'HARD' | undefined,
      skip,
      take
    })

    const response: ApiResponse<{
      lessons: typeof lessons
      total: number
      page: number
      pageSize: number
    }> = {
      success: true,
      data: {
        lessons,
        total,
        page: Math.ceil(skip / take) + 1,
        pageSize: take
      },
      message: 'Lessons retrieved successfully'
    }

    res.json(response)
  } catch (error) {
    _next(error)
  }
})

// GET /api/v1/lessons/:id - Get lesson by ID
router.get('/:id', async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const lesson = await lessonService.getLessonById(req.params.id)

    if (!lesson) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: 'Lesson not found'
      }
      res.status(404).json(response)
      return
    }

    const response: ApiResponse<typeof lesson> = {
      success: true,
      data: lesson,
      message: 'Lesson retrieved successfully'
    }

    res.json(response)
  } catch (error) {
    _next(error)
  }
})

// POST /api/v1/lessons - Create new lesson (instructor/admin only)
router.post(
  '/',
  verifyToken,
  isInstructor,
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    try {
      const { title, description, category, difficulty, content } = req.body

      if (!title || !description || !category || !difficulty || !content) {
        const response: ApiResponse<null> = {
          success: false,
          data: null,
          message: 'Missing required fields: title, description, category, difficulty, content'
        }
        res.status(400).json(response)
        return
      }

      if (!['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
        const response: ApiResponse<null> = {
          success: false,
          data: null,
          message: 'Invalid difficulty level. Must be EASY, MEDIUM, or HARD'
        }
        res.status(400).json(response)
        return
      }

      const input: CreateLessonInput = {
        title,
        description,
        category,
        difficulty,
        content,
        authorId: req.user!.userId
      }

      const lesson = await lessonService.createLesson(input)

      const response: ApiResponse<typeof lesson> = {
        success: true,
        data: lesson,
        message: 'Lesson created successfully'
      }

      res.status(201).json(response)
    } catch (error) {
      _next(error)
    }
  }
)

// PUT /api/v1/lessons/:id - Update lesson (author/admin only)
router.put(
  '/:id',
  verifyToken,
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    try {
      const lesson = await lessonService.getLessonById(req.params.id)

      if (!lesson) {
        const response: ApiResponse<null> = {
          success: false,
          data: null,
          message: 'Lesson not found'
        }
        res.status(404).json(response)
        return
      }

      // Check authorization: author or admin
      const isAuthor = lesson.authorId === req.user!.userId
      const userRole = req.user!.role

      if (!isAuthor && userRole !== 'ADMIN') {
        const response: ApiResponse<null> = {
          success: false,
          data: null,
          message: 'Unauthorized: Only author or admin can update this lesson'
        }
        res.status(403).json(response)
        return
      }

      const { title, description, category, difficulty, content } = req.body

      if (difficulty && !['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
        const response: ApiResponse<null> = {
          success: false,
          data: null,
          message: 'Invalid difficulty level. Must be EASY, MEDIUM, or HARD'
        }
        res.status(400).json(response)
        return
      }

      const input: UpdateLessonInput = {}
      if (title !== undefined) input.title = title
      if (description !== undefined) input.description = description
      if (category !== undefined) input.category = category
      if (difficulty !== undefined) input.difficulty = difficulty
      if (content !== undefined) input.content = content

      const updatedLesson = await lessonService.updateLesson(req.params.id, input)

      const response: ApiResponse<typeof updatedLesson> = {
        success: true,
        data: updatedLesson,
        message: 'Lesson updated successfully'
      }

      res.json(response)
    } catch (error) {
      _next(error)
    }
  }
)

// DELETE /api/v1/lessons/:id - Delete lesson (admin only)
router.delete('/:id', verifyToken, isAdmin, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const lesson = await lessonService.getLessonById(req.params.id)

    if (!lesson) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: 'Lesson not found'
      }
      res.status(404).json(response)
      return
    }

    await lessonService.deleteLesson(req.params.id)

    const response: ApiResponse<null> = {
      success: true,
      data: null,
      message: 'Lesson deleted successfully'
    }

    res.json(response)
  } catch (error) {
    _next(error)
  }
})

export default router
