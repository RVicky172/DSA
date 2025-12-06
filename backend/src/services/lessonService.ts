import { PrismaClient } from '@prisma/client'
import type { Lesson } from '@prisma/client'

const prisma = new PrismaClient()

export interface CreateLessonInput {
  title: string
  description: string
  category: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  content: string
  authorId: string
}

export interface UpdateLessonInput {
  title?: string
  description?: string
  category?: string
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
  content?: string
}

export interface LessonFilters {
  category?: string
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
  authorId?: string
  skip?: number
  take?: number
}

class LessonService {
  // Get all lessons with optional filtering and pagination
  async getAllLessons(filters: LessonFilters = {}): Promise<{
    lessons: Lesson[]
    total: number
  }> {
    const { category, difficulty, authorId, skip = 0, take = 10 } = filters

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}
    if (category) where.category = category
    if (difficulty) where.difficulty = difficulty
    if (authorId) where.authorId = authorId

    const [lessons, total] = await Promise.all([
      prisma.lesson.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.lesson.count({ where })
    ])

    return { lessons, total }
  }

  // Get single lesson by ID
  async getLessonById(id: string): Promise<Lesson | null> {
    return prisma.lesson.findUnique({
      where: { id }
    })
  }

  // Create new lesson (instructor/admin only)
  async createLesson(input: CreateLessonInput): Promise<Lesson> {
    return prisma.lesson.create({
      data: {
        title: input.title,
        description: input.description,
        category: input.category,
        difficulty: input.difficulty,
        content: input.content,
        authorId: input.authorId
      }
    })
  }

  // Update lesson (author/admin only)
  async updateLesson(id: string, input: UpdateLessonInput): Promise<Lesson | null> {
    return prisma.lesson.update({
      where: { id },
      data: input
    })
  }

  // Delete lesson (admin only)
  async deleteLesson(id: string): Promise<Lesson | null> {
    return prisma.lesson.delete({
      where: { id }
    })
  }

  // Get lessons by category
  async getLessonsByCategory(category: string, skip = 0, take = 10): Promise<{
    lessons: Lesson[]
    total: number
  }> {
    return this.getAllLessons({ category, skip, take })
  }

  // Get lessons by difficulty
  async getLessonsByDifficulty(difficulty: 'EASY' | 'MEDIUM' | 'HARD', skip = 0, take = 10): Promise<{
    lessons: Lesson[]
    total: number
  }> {
    return this.getAllLessons({ difficulty, skip, take })
  }

  // Get lessons by author
  async getLessonsByAuthor(authorId: string, skip = 0, take = 10): Promise<{
    lessons: Lesson[]
    total: number
  }> {
    return this.getAllLessons({ authorId, skip, take })
  }

  // Get total lesson count
  async getTotalLessonCount(): Promise<number> {
    return prisma.lesson.count()
  }

  // Search lessons by title, description, or content
  async searchLessons(
    query: string,
    filters: {
      category?: string
      difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
      skip?: number
      take?: number
    } = {}
  ): Promise<{
    lessons: Lesson[]
    total: number
  }> {
    const { category, difficulty, skip = 0, take = 10 } = filters

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } }
      ]
    }

    if (category) where.category = category
    if (difficulty) where.difficulty = difficulty

    const [lessons, total] = await Promise.all([
      prisma.lesson.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.lesson.count({ where })
    ])

    return { lessons, total }
  }
}

export const lessonService = new LessonService()
