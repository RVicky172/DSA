import { PrismaClient } from '@prisma/client'
import type { Problem } from '@prisma/client'

const prisma = new PrismaClient()

export interface RecommendedProblem {
  id: string
  title: string
  difficulty: string
  description: string
  lessonId: string
  lessonTitle: string
  relevanceScore: number
  reason: string
}

class RecommendationService {
  // Get recommended problems for a user based on their performance
  async getRecommendations(userId: string, limit: number = 5): Promise<RecommendedProblem[]> {
    // Get user's submission history
    const userSubmissions = await prisma.submission.findMany({
      where: { userId },
      include: { problem: { include: { lesson: true } } }
    })

    if (userSubmissions.length === 0) {
      // If user has no submissions, recommend easy problems from all lessons
      return this.getBeginnerProblems(limit)
    }

    // Calculate user's success rate by difficulty
    const difficultyPerformance = this.calculateDifficultyPerformance(userSubmissions)

    // Get solved problem IDs to exclude from recommendations
    const solvedProblemIds = new Set(
      userSubmissions.filter((s) => s.status === 'ACCEPTED').map((s) => s.problemId)
    )

    // Get all unsolved problems
    const unsolvedProblems = await prisma.problem.findMany({
      where: {
        NOT: {
          id: { in: Array.from(solvedProblemIds) }
        }
      },
      include: { lesson: true }
    })

    // Score each problem based on various factors
    const scoredProblems = unsolvedProblems.map((problem) => {
      const score = this.calculateRecommendationScore(problem, difficultyPerformance, userSubmissions)
      return { ...problem, score }
    })

    // Sort by score and get top recommendations
    const recommendations = scoredProblems
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((p) => ({
        id: p.id,
        title: p.title,
        difficulty: p.difficulty,
        description: p.description,
        lessonId: p.lessonId,
        lessonTitle: p.lesson.title,
        relevanceScore: p.score,
        reason: this.getRecommendationReason(p, difficultyPerformance)
      }))

    return recommendations
  }

  // Get beginner-friendly problems for new users
  private async getBeginnerProblems(limit: number): Promise<RecommendedProblem[]> {
    const easyProblems = await prisma.problem.findMany({
      where: { difficulty: 'EASY' },
      include: { lesson: true },
      take: limit,
      orderBy: { createdAt: 'asc' }
    })

    return easyProblems.map((p) => ({
      id: p.id,
      title: p.title,
      difficulty: p.difficulty,
      description: p.description,
      lessonId: p.lessonId,
      lessonTitle: p.lesson.title,
      relevanceScore: 1.0,
      reason: 'Great for beginners - start with easy problems'
    }))
  }

  // Calculate user's performance by difficulty level
  private calculateDifficultyPerformance(
    submissions: Array<{ status: string; problem: { difficulty: string } }>
  ): Record<string, { successRate: number; attemptCount: number }> {
    const performance: Record<string, { successRate: number; attemptCount: number }> = {
      EASY: { successRate: 0, attemptCount: 0 },
      MEDIUM: { successRate: 0, attemptCount: 0 },
      HARD: { successRate: 0, attemptCount: 0 }
    }

    const difficultySubmissions: Record<string, { accepted: number; total: number }> = {
      EASY: { accepted: 0, total: 0 },
      MEDIUM: { accepted: 0, total: 0 },
      HARD: { accepted: 0, total: 0 }
    }

    // Count submissions by difficulty
    for (const submission of submissions) {
      const difficulty = submission.problem.difficulty
      difficultySubmissions[difficulty].total++
      if (submission.status === 'ACCEPTED') {
        difficultySubmissions[difficulty].accepted++
      }
    }

    // Calculate success rates
    for (const difficulty of ['EASY', 'MEDIUM', 'HARD']) {
      const stats = difficultySubmissions[difficulty]
      performance[difficulty].attemptCount = stats.total
      performance[difficulty].successRate = stats.total > 0 ? stats.accepted / stats.total : 0
    }

    return performance
  }

  // Calculate recommendation score for a problem
  private calculateRecommendationScore(
    problem: Problem,
    difficultyPerformance: Record<string, { successRate: number; attemptCount: number }>,
    submissions: Array<{ status: string; problemId: string; problem: { difficulty: string; lessonId: string } }>
  ): number {
    let score = 0

    const userSuccessRate = difficultyPerformance[problem.difficulty].successRate
    const userAttempts = difficultyPerformance[problem.difficulty].attemptCount

    // Difficulty matching score (recommend problems slightly above current level)
    if (problem.difficulty === 'EASY') {
      score += 1.0 // Always good to maintain easy problems
      if (userSuccessRate > 0.8) score += 2.0 // If easy success rate is high, ready for next level
    } else if (problem.difficulty === 'MEDIUM') {
      if (userSuccessRate >= 0.5) score += 3.0 // Ready for medium if success rate is decent
      if (userAttempts > 0) score += 1.0 // Bonus if user has medium problem experience
    } else if (problem.difficulty === 'HARD') {
      if (userSuccessRate >= 0.7) score += 4.0 // Only recommend hard if very successful
      if (userAttempts > 2) score += 2.0 // Bonus if user has extensive medium experience
    }

    // Lesson diversity score (recommend from lessons user hasn't tried many problems from)
    const lessonProblemsAttempted = submissions.filter((s) => s.problem.lessonId === problem.lessonId)
      .length
    if (lessonProblemsAttempted === 0) {
      score += 1.5 // New lesson bonus
    } else {
      score += 0.5 / (lessonProblemsAttempted + 1) // Diminishing returns for more attempts
    }

    // Randomness factor (to avoid always recommending the same problems)
    score += Math.random() * 0.5

    return score
  }

  // Get explanation for why a problem is recommended
  private getRecommendationReason(
    problem: Problem,
    difficultyPerformance: Record<string, { successRate: number; attemptCount: number }>
  ): string {
    const successRate = difficultyPerformance[problem.difficulty].successRate
    const attemptCount = difficultyPerformance[problem.difficulty].attemptCount

    if (attemptCount === 0) {
      return `Start with ${problem.difficulty} difficulty problems`
    }

    if (problem.difficulty === 'EASY') {
      return 'Build confidence with fundamentals'
    }

    if (problem.difficulty === 'MEDIUM') {
      if (successRate > 0.7) {
        return `You're doing great with ${problem.difficulty} problems - keep it up!`
      }
      return `Practice more ${problem.difficulty} problems to improve`
    }

    if (problem.difficulty === 'HARD') {
      if (successRate > 0.7) {
        return `Challenge yourself with ${problem.difficulty} problems`
      }
      return `Master ${problem.difficulty} problems to unlock advanced concepts`
    }

    return 'Recommended based on your progress'
  }

  // Get recommendations for a specific lesson
  async getNextProblems(
    userId: string,
    lessonId: string,
    limit: number = 3
  ): Promise<RecommendedProblem[]> {
    // Get problems in the lesson that the user hasn't solved
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { problems: true }
    })

    if (!lesson) {
      return []
    }

    // Get user's submissions for this lesson
    const userSubmissions = await prisma.submission.findMany({
      where: {
        userId,
        problem: { lessonId }
      },
      include: { problem: true }
    })

    const solvedProblemIds = new Set(
      userSubmissions.filter((s) => s.status === 'ACCEPTED').map((s) => s.problemId)
    )

    // Get unsolved problems in this lesson
    const unsolvedProblems = lesson.problems.filter((p) => !solvedProblemIds.has(p.id))

    // If all problems are solved, return empty
    if (unsolvedProblems.length === 0) {
      return []
    }

    // Sort by difficulty and return
    unsolvedProblems.sort((a, b) => {
      const diffOrder = { EASY: 1, MEDIUM: 2, HARD: 3 }
      return diffOrder[a.difficulty as keyof typeof diffOrder] - diffOrder[b.difficulty as keyof typeof diffOrder]
    })

    return unsolvedProblems.slice(0, limit).map((p) => ({
      id: p.id,
      title: p.title,
      difficulty: p.difficulty,
      description: p.description,
      lessonId: p.lessonId,
      lessonTitle: lesson.title,
      relevanceScore: 1.0,
      reason: `Next ${p.difficulty} problem in ${lesson.title}`
    }))
  }
}

export const recommendationService = new RecommendationService()
