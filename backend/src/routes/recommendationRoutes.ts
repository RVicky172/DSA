import { Router, Response, NextFunction } from 'express'
import { recommendationService } from '../services/recommendationService'
import { verifyToken } from '../middleware/authMiddleware'
import type { ApiResponse } from '../types'
import type { AuthRequest } from '../middleware/authMiddleware'

const router = Router()

// GET /api/v1/recommendations - Get recommended problems for current user
router.get('/', verifyToken, async (req: AuthRequest, res: Response, _next: NextFunction) => {
  try {
    const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : 5
    const validLimit = Math.min(Math.max(limit, 1), 20) // Clamp between 1 and 20

    const userId = req.user!.userId
    const recommendations = await recommendationService.getRecommendations(userId, validLimit)

    const response: ApiResponse<{
      recommendations: typeof recommendations
      count: number
      totalAttempts: number
    }> = {
      success: true,
      data: {
        recommendations,
        count: recommendations.length,
        totalAttempts: validLimit
      },
      message: 'Recommendations retrieved successfully'
    }

    res.json(response)
  } catch (error) {
    _next(error)
  }
})

// GET /api/v1/recommendations/lesson/:lessonId - Get next problems in a lesson
router.get(
  '/lesson/:lessonId',
  verifyToken,
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    try {
      const { lessonId } = req.params
      const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : 3
      const validLimit = Math.min(Math.max(limit, 1), 10) // Clamp between 1 and 10

      const userId = req.user!.userId
      const nextProblems = await recommendationService.getNextProblems(userId, lessonId, validLimit)

      const response: ApiResponse<{
        nextProblems: typeof nextProblems
        count: number
        lessonId: string
      }> = {
        success: true,
        data: {
          nextProblems,
          count: nextProblems.length,
          lessonId
        },
        message: 'Next problems retrieved successfully'
      }

      res.json(response)
    } catch (error) {
      _next(error)
    }
  }
)

export default router
