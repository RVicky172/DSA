import { PrismaClient } from '@prisma/client'
import type { Problem } from '@prisma/client'

const prisma = new PrismaClient()

export interface CreateProblemInput {
  title: string
  description: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  initialCode: string
  lessonId: string
}

export interface UpdateProblemInput {
  title?: string
  description?: string
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
  initialCode?: string
}

export interface ProblemFilters {
  lessonId?: string
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
  skip?: number
  take?: number
}

class ProblemService {
  // Get all problems with optional filtering and pagination
  async getAllProblems(filters: ProblemFilters = {}): Promise<{
    problems: Problem[]
    total: number
  }> {
    const { lessonId, difficulty, skip = 0, take = 10 } = filters

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}
    if (lessonId) where.lessonId = lessonId
    if (difficulty) where.difficulty = difficulty

    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.problem.count({ where })
    ])

    return { problems, total }
  }

  // Get single problem by ID
  async getProblemById(id: string): Promise<Problem | null> {
    return prisma.problem.findUnique({
      where: { id }
    })
  }

  // Get problems by lesson ID
  async getProblemsByLesson(lessonId: string, skip = 0, take = 10): Promise<{
    problems: Problem[]
    total: number
  }> {
    return this.getAllProblems({ lessonId, skip, take })
  }

  // Create new problem (instructor/admin only)
  async createProblem(input: CreateProblemInput): Promise<Problem> {
    return prisma.problem.create({
      data: {
        title: input.title,
        description: input.description,
        difficulty: input.difficulty,
        initialCode: input.initialCode,
        lessonId: input.lessonId
      }
    })
  }

  // Update problem (creator/admin only)
  async updateProblem(id: string, input: UpdateProblemInput): Promise<Problem | null> {
    return prisma.problem.update({
      where: { id },
      data: input
    })
  }

  // Delete problem (admin only)
  async deleteProblem(id: string): Promise<Problem | null> {
    return prisma.problem.delete({
      where: { id }
    })
  }

  // Get problems by difficulty
  async getProblemsByDifficulty(difficulty: 'EASY' | 'MEDIUM' | 'HARD', skip = 0, take = 10): Promise<{
    problems: Problem[]
    total: number
  }> {
    return this.getAllProblems({ difficulty, skip, take })
  }

  // Get total problem count
  async getTotalProblemCount(): Promise<number> {
    return prisma.problem.count()
  }

  // Get problem count by lesson
  async getProblemCountByLesson(lessonId: string): Promise<number> {
    return prisma.problem.count({ where: { lessonId } })
  }

  // Search problems by title or description
  async searchProblems(
    query: string,
    filters: {
      lessonId?: string
      difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
      skip?: number
      take?: number
    } = {}
  ): Promise<{
    problems: Problem[]
    total: number
  }> {
    const { lessonId, difficulty, skip = 0, take = 10 } = filters

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ]
    }

    if (lessonId) where.lessonId = lessonId
    if (difficulty) where.difficulty = difficulty

    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.problem.count({ where })
    ])

    return { problems, total }
  }
}

export const problemService = new ProblemService()
