import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface UserStats {
  userId: string
  totalLessonsStarted: number
  totalLessonsCompleted: number
  totalProblemsAttempted: number
  totalProblemesSolved: number
  successRate: number
  averageDifficulty: string
  lastActivityDate: Date | null
}

export interface PlatformStats {
  totalUsers: number
  totalLessons: number
  totalProblems: number
  totalSubmissions: number
  averageCompletionRate: number
  mostPopularLesson: {
    id: string
    title: string
    attemptCount: number
  } | null
  mostPopularProblem: {
    id: string
    title: string
    attemptCount: number
  } | null
  difficultyDistribution: {
    easy: number
    medium: number
    hard: number
  }
}

class AnalyticsService {
  // Get user statistics
  async getUserStats(userId: string): Promise<UserStats | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return null
    }

    // Get user submissions to calculate stats
    const submissions = await prisma.submission.findMany({
      where: { userId }
    })

    const acceptedSubmissions = submissions.filter((s) => s.status === 'ACCEPTED')

    // Get attempted problems to calculate average difficulty
    const attemptedProblems = await prisma.problem.findMany({
      where: {
        submissions: {
          some: { userId }
        }
      }
    })

    // Calculate average difficulty
    const difficultyMap: Record<string, number> = { EASY: 1, MEDIUM: 2, HARD: 3 }
    const avgDifficultyScore =
      attemptedProblems.length > 0
        ? attemptedProblems.reduce((sum, p) => sum + (difficultyMap[p.difficulty] || 0), 0) /
          attemptedProblems.length
        : 0

    let averageDifficulty = 'EASY'
    if (avgDifficultyScore > 1.5) averageDifficulty = 'MEDIUM'
    if (avgDifficultyScore > 2.5) averageDifficulty = 'HARD'

    // Get last submission date
    const lastSubmission = await prisma.submission.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return {
      userId,
      totalLessonsStarted: 0, // Placeholder - can be tracked in UserProgress model
      totalLessonsCompleted: 0, // Placeholder - can be tracked in UserProgress model
      totalProblemsAttempted: submissions.length,
      totalProblemesSolved: acceptedSubmissions.length,
      successRate: submissions.length > 0 ? (acceptedSubmissions.length / submissions.length) * 100 : 0,
      averageDifficulty,
      lastActivityDate: lastSubmission?.createdAt || null
    }
  }

  // Get platform-wide statistics
  async getPlatformStats(): Promise<PlatformStats> {
    const [totalUsers, totalLessons, totalProblems, totalSubmissions] = await Promise.all([
      prisma.user.count(),
      prisma.lesson.count(),
      prisma.problem.count(),
      prisma.submission.count()
    ])

    // Get all submissions for completion rate calculation
    const submissions = await prisma.submission.findMany()
    const acceptedCount = submissions.filter((s) => s.status === 'ACCEPTED').length
    const averageCompletionRate = submissions.length > 0 ? (acceptedCount / submissions.length) * 100 : 0

    // Get most popular lesson (by submission count)
    const popularLessons = await prisma.lesson.findMany({
      include: {
        problems: {
          include: {
            submissions: true
          }
        }
      }
    })

    let mostPopularLesson: { id: string; title: string; attemptCount: number } | null = null
    let maxAttempts = 0

    for (const lesson of popularLessons) {
      const attemptCount = lesson.problems.reduce((sum, p) => sum + p.submissions.length, 0)
      if (attemptCount > maxAttempts) {
        maxAttempts = attemptCount
        mostPopularLesson = {
          id: lesson.id,
          title: lesson.title,
          attemptCount
        }
      }
    }

    // Get most popular problem
    const allProblems = await prisma.problem.findMany({
      include: { submissions: true }
    })

    let mostPopularProblem: { id: string; title: string; attemptCount: number } | null = null
    let maxProblemAttempts = 0

    for (const problem of allProblems) {
      const attemptCount = problem.submissions.length
      if (attemptCount > maxProblemAttempts) {
        maxProblemAttempts = attemptCount
        mostPopularProblem = {
          id: problem.id,
          title: problem.title,
          attemptCount
        }
      }
    }

    // Get difficulty distribution
    const difficultyDistribution = await prisma.problem.groupBy({
      by: ['difficulty'],
      _count: true
    })

    const distribution = { easy: 0, medium: 0, hard: 0 }
    for (const item of difficultyDistribution) {
      if (item.difficulty === 'EASY') distribution.easy = item._count
      if (item.difficulty === 'MEDIUM') distribution.medium = item._count
      if (item.difficulty === 'HARD') distribution.hard = item._count
    }

    return {
      totalUsers,
      totalLessons,
      totalProblems,
      totalSubmissions,
      averageCompletionRate,
      mostPopularLesson,
      mostPopularProblem,
      difficultyDistribution: distribution
    }
  }

  // Get user progress in a specific lesson
  async getLessonProgress(userId: string, lessonId: string): Promise<{
    lessonId: string
    lessonTitle: string
    totalProblems: number
    solvedProblems: number
    completionPercentage: number
  } | null> {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { problems: true }
    })

    if (!lesson) {
      return null
    }

    const totalProblems = lesson.problems.length

    // Count solved problems in this lesson
    const solvedProblems = await prisma.submission.count({
      where: {
        userId,
        status: 'ACCEPTED',
        problem: { lessonId }
      }
    })

    return {
      lessonId,
      lessonTitle: lesson.title,
      totalProblems,
      solvedProblems,
      completionPercentage: totalProblems > 0 ? (solvedProblems / totalProblems) * 100 : 0
    }
  }

  // Get top users by problem solved count
  async getTopUsers(limit: number = 10): Promise<
    Array<{
      userId: string
      username: string
      problemsSolved: number
    }>
  > {
    const submissions = await prisma.submission.findMany({
      include: { user: true }
    })

    // Group by user and count accepted submissions
    const userStats: Record<string, { username: string; count: number }> = {}

    for (const submission of submissions) {
      if (submission.status === 'ACCEPTED') {
        if (!userStats[submission.userId]) {
          userStats[submission.userId] = {
            username: submission.user.username,
            count: 0
          }
        }
        userStats[submission.userId].count++
      }
    }

    // Convert to array and sort
    const topUsers = Object.entries(userStats)
      .map(([userId, data]) => ({
        userId,
        username: data.username,
        problemsSolved: data.count
      }))
      .sort((a, b) => b.problemsSolved - a.problemsSolved)
      .slice(0, limit)

    return topUsers
  }

  // Get problems by difficulty for analytics
  async getProblemsByDifficulty(): Promise<{
    easy: number
    medium: number
    hard: number
  }> {
    const easy = await prisma.problem.count({ where: { difficulty: 'EASY' } })
    const medium = await prisma.problem.count({ where: { difficulty: 'MEDIUM' } })
    const hard = await prisma.problem.count({ where: { difficulty: 'HARD' } })

    return { easy, medium, hard }
  }
}

export const analyticsService = new AnalyticsService()
