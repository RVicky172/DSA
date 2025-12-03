import { Router, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { verifyToken, isAdmin } from '../middleware/authMiddleware'
import type { ApiResponse } from '../types'
import type { AuthRequest } from '../middleware/authMiddleware'

const router = Router()
const prisma = new PrismaClient()

// GET /api/v1/admin/stats - Get dashboard statistics (admin only)
router.get(
    '/stats',
    verifyToken,
    isAdmin,
    async (_req: AuthRequest, res: Response, _next: NextFunction) => {
        try {
            // Get counts for dashboard
            const [userCount, lessonCount, problemCount, submissionCount] = await Promise.all([
                prisma.user.count(),
                prisma.lesson.count(),
                prisma.problem.count(),
                prisma.submission.count()
            ])

            // Get recent activity
            const recentSubmissions = await prisma.submission.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { username: true, email: true } },
                    problem: { select: { title: true } }
                }
            })

            const stats = {
                users: userCount,
                lessons: lessonCount,
                problems: problemCount,
                submissions: submissionCount,
                recentActivity: recentSubmissions.map(sub => ({
                    id: sub.id,
                    username: sub.user.username,
                    problemTitle: sub.problem.title,
                    status: sub.status,
                    score: sub.score,
                    createdAt: sub.createdAt
                }))
            }

            const response: ApiResponse<typeof stats> = {
                success: true,
                data: stats,
                message: 'Admin statistics retrieved successfully'
            }

            res.json(response)
        } catch (error) {
            _next(error)
        }
    }
)

// GET /api/v1/admin/users - Get all users with pagination (admin only)
router.get(
    '/users',
    verifyToken,
    isAdmin,
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
        try {
            const skip = typeof req.query.skip === 'string' ? parseInt(req.query.skip, 10) : 0
            const take = typeof req.query.take === 'string' ? parseInt(req.query.take, 10) : 20

            const [users, total] = await Promise.all([
                prisma.user.findMany({
                    skip,
                    take,
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        role: true,
                        createdAt: true,
                        _count: {
                            select: {
                                submissions: true,
                                lessons: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }),
                prisma.user.count()
            ])

            const response: ApiResponse<{
                users: typeof users
                total: number
                page: number
                pageSize: number
            }> = {
                success: true,
                data: {
                    users,
                    total,
                    page: Math.ceil(skip / take) + 1,
                    pageSize: take
                },
                message: 'Users retrieved successfully'
            }

            res.json(response)
        } catch (error) {
            _next(error)
        }
    }
)

// PUT /api/v1/admin/users/:id/role - Update user role (admin only)
router.put(
    '/users/:id/role',
    verifyToken,
    isAdmin,
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
        try {
            const { role } = req.body
            const userId = req.params.id

            if (!role || !['STUDENT', 'INSTRUCTOR', 'ADMIN'].includes(role)) {
                const response: ApiResponse<null> = {
                    success: false,
                    data: null,
                    message: 'Invalid role. Must be STUDENT, INSTRUCTOR, or ADMIN'
                }
                res.status(400).json(response)
                return
            }

            const user = await prisma.user.findUnique({ where: { id: userId } })

            if (!user) {
                const response: ApiResponse<null> = {
                    success: false,
                    data: null,
                    message: 'User not found'
                }
                res.status(404).json(response)
                return
            }

            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { role },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    role: true,
                    createdAt: true
                }
            })

            const response: ApiResponse<typeof updatedUser> = {
                success: true,
                data: updatedUser,
                message: 'User role updated successfully'
            }

            res.json(response)
        } catch (error) {
            _next(error)
        }
    }
)

export default router
