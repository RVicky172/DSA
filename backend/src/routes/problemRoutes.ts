import { Router, Request, Response, NextFunction } from 'express'
import { problemService, CreateProblemInput, UpdateProblemInput } from '../services/problemService.js'
import { lessonService } from '../services/lessonService.js'
import { verifyToken, isInstructor, isAdmin } from '../middleware/authMiddleware.js'
import type { ApiResponse } from '../types/index.js'
import type { AuthRequest } from '../middleware/authMiddleware.js'

const router = Router()

// GET /api/v1/problems - Get all problems with pagination and filtering
router.get('/', async (_req: Request, res: Response, _next: NextFunction) => {
  try {
    const lessonId = typeof _req.query.lessonId === 'string' ? _req.query.lessonId : undefined
    const difficulty = typeof _req.query.difficulty === 'string' ? _req.query.difficulty : undefined
    const skip = typeof _req.query.skip === 'string' ? parseInt(_req.query.skip, 10) : 0
    const take = typeof _req.query.take === 'string' ? parseInt(_req.query.take, 10) : 10

    const { problems, total } = await problemService.getAllProblems({
      lessonId,
      difficulty: difficulty as 'EASY' | 'MEDIUM' | 'HARD' | undefined,
      skip,
      take
    })

    const response: ApiResponse<{
      problems: typeof problems
      total: number
      page: number
      pageSize: number
    }> = {
      success: true,
      data: {
        problems,
        total,
        page: Math.ceil(skip / take) + 1,
        pageSize: take
      },
      message: 'Problems retrieved successfully'
    }

    res.json(response)
  } catch (error) {
    _next(error)
  }
})

// GET /api/v1/problems/:id - Get problem by ID
router.get('/:id', async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const problem = await problemService.getProblemById(req.params.id)

    if (!problem) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: 'Problem not found'
      }
      res.status(404).json(response)
      return
    }

    const response: ApiResponse<typeof problem> = {
      success: true,
      data: problem,
      message: 'Problem retrieved successfully'
    }

    res.json(response)
  } catch (error) {
    _next(error)
  }
})

// POST /api/v1/problems - Create new problem (instructor/admin only)
router.post(
  '/',
  verifyToken,
  isInstructor,
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    try {
      const { title, description, difficulty, initialCode, lessonId } = req.body

      if (!title || !description || !difficulty || !initialCode || !lessonId) {
        const response: ApiResponse<null> = {
          success: false,
          data: null,
          message: 'Missing required fields: title, description, difficulty, initialCode, lessonId'
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

      // Verify lesson exists and user is author or admin
      const lesson = await lessonService.getLessonById(lessonId)
      if (!lesson) {
        const response: ApiResponse<null> = {
          success: false,
          data: null,
          message: 'Lesson not found'
        }
        res.status(404).json(response)
        return
      }

      const isLessonAuthor = lesson.authorId === req.user!.userId
      const isAdminUser = req.user!.role === 'ADMIN'
      if (!isLessonAuthor && !isAdminUser) {
        const response: ApiResponse<null> = {
          success: false,
          data: null,
          message: 'Unauthorized: Only lesson author or admin can add problems'
        }
        res.status(403).json(response)
        return
      }

      const input: CreateProblemInput = {
        title,
        description,
        difficulty,
        initialCode,
        lessonId
      }

      const problem = await problemService.createProblem(input)

      const response: ApiResponse<typeof problem> = {
        success: true,
        data: problem,
        message: 'Problem created successfully'
      }

      res.status(201).json(response)
    } catch (error) {
      _next(error)
    }
  }
)

// PUT /api/v1/problems/:id - Update problem
router.put(
  '/:id',
  verifyToken,
  isInstructor,
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    try {
      const problem = await problemService.getProblemById(req.params.id)

      if (!problem) {
        const response: ApiResponse<null> = {
          success: false,
          data: null,
          message: 'Problem not found'
        }
        res.status(404).json(response)
        return
      }

      // Verify user has permission to update
      const lesson = await lessonService.getLessonById(problem.lessonId)
      if (!lesson) {
        const response: ApiResponse<null> = {
          success: false,
          data: null,
          message: 'Associated lesson not found'
        }
        res.status(404).json(response)
        return
      }

      const isLessonAuthor = lesson.authorId === req.user!.userId
      const isAdminUser = req.user!.role === 'ADMIN'
      if (!isLessonAuthor && !isAdminUser) {
        const response: ApiResponse<null> = {
          success: false,
          data: null,
          message: 'Unauthorized: Only lesson author or admin can update this problem'
        }
        res.status(403).json(response)
        return
      }

      const { title, description, difficulty, initialCode } = req.body

      if (difficulty && !['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
        const response: ApiResponse<null> = {
          success: false,
          data: null,
          message: 'Invalid difficulty level. Must be EASY, MEDIUM, or HARD'
        }
        res.status(400).json(response)
        return
      }

      const input: UpdateProblemInput = {}
      if (title !== undefined) input.title = title
      if (description !== undefined) input.description = description
      if (difficulty !== undefined) input.difficulty = difficulty
      if (initialCode !== undefined) input.initialCode = initialCode

      const updatedProblem = await problemService.updateProblem(req.params.id, input)

      const response: ApiResponse<typeof updatedProblem> = {
        success: true,
        data: updatedProblem,
        message: 'Problem updated successfully'
      }

      res.json(response)
    } catch (error) {
      _next(error)
    }
  }
)

// DELETE /api/v1/problems/:id - Delete problem (admin only)
router.delete('/:id', verifyToken, isAdmin, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const problem = await problemService.getProblemById(req.params.id)

    if (!problem) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: 'Problem not found'
      }
      res.status(404).json(response)
      return
    }

    await problemService.deleteProblem(req.params.id)

    const response: ApiResponse<null> = {
      success: true,
      data: null,
      message: 'Problem deleted successfully'
    }

    res.json(response)
  } catch (error) {
    _next(error)
  }
})

export default router
