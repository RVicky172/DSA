import { Router, Request, Response, NextFunction } from 'express'
import { analyticsService } from '../services/analyticsService'
import { verifyToken } from '../middleware/authMiddleware'
import type { ApiResponse } from '../types'
import type { AuthRequest } from '../middleware/authMiddleware'

const router = Router()

// GET /api/v1/analytics/platform - Get platform-wide analytics
router.get('/platform', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await analyticsService.getPlatformStats()

    const response: ApiResponse<typeof stats> = {
      success: true,
      data: stats,
      message: 'Platform analytics retrieved successfully'
    }

    res.json(response)
  } catch (error) {
    next(error)
  }
})

// GET /api/v1/analytics/user/:userId - Get user statistics
router.get('/user/:userId', verifyToken, async (req: AuthRequest, res: Response, _next: NextFunction) => {
  try {
    const { userId } = req.params

    // Users can only see their own stats unless they're admin
    if (req.user!.userId !== userId && req.user!.role !== 'ADMIN') {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: 'Unauthorized: Can only view own stats or admin can view any stats'
      }
      res.status(403).json(response)
      return
    }

    const stats = await analyticsService.getUserStats(userId)

    if (!stats) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: 'User not found'
      }
      res.status(404).json(response)
      return
    }

    const response: ApiResponse<typeof stats> = {
      success: true,
      data: stats,
      message: 'User analytics retrieved successfully'
    }

    res.json(response)
  } catch (error) {
    _next(error)
  }
})

// GET /api/v1/analytics/lesson/:lessonId - Get lesson progress for current user
router.get(
  '/lesson/:lessonId',
  verifyToken,
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    try {
      const { lessonId } = req.params
      const userId = req.user!.userId

      const progress = await analyticsService.getLessonProgress(userId, lessonId)

      if (!progress) {
        const response: ApiResponse<null> = {
          success: false,
          data: null,
          message: 'Lesson not found'
        }
        res.status(404).json(response)
        return
      }

      const response: ApiResponse<typeof progress> = {
        success: true,
        data: progress,
        message: 'Lesson progress retrieved successfully'
      }

      res.json(response)
    } catch (error) {
      _next(error)
    }
  }
)

// GET /api/v1/analytics/leaderboard - Get top users leaderboard
router.get('/leaderboard', async (_req: Request, res: Response, _next: NextFunction) => {
  try {
    const limit = typeof _req.query.limit === 'string' ? parseInt(_req.query.limit, 10) : 10
    const validLimit = Math.min(Math.max(limit, 1), 100) // Clamp between 1 and 100

    const topUsers = await analyticsService.getTopUsers(validLimit)

    const response: ApiResponse<{
      topUsers: typeof topUsers
      totalFetched: number
      rank: { [key: string]: number }
    }> = {
      success: true,
      data: {
        topUsers,
        totalFetched: topUsers.length,
        rank: topUsers.reduce(
          (acc, user, idx) => {
            acc[user.userId] = idx + 1
            return acc
          },
          {} as { [key: string]: number }
        )
      },
      message: 'Leaderboard retrieved successfully'
    }

    res.json(response)
  } catch (error) {
    _next(error)
  }
})

// GET /api/v1/analytics/difficulty-distribution - Get problem distribution by difficulty
router.get('/difficulty-distribution', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const distribution = await analyticsService.getProblemsByDifficulty()

    const response: ApiResponse<typeof distribution> = {
      success: true,
      data: distribution,
      message: 'Difficulty distribution retrieved successfully'
    }

    res.json(response)
  } catch (error) {
    next(error)
  }
})

export default router
