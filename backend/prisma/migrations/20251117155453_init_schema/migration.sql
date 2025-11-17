-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "lessons_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "problems" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "initialCode" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'javascript',
    "lessonId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "problems_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "test_cases" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "problemId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "test_cases_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'javascript',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "result" TEXT,
    "score" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "submissions_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lessonsStarted" INTEGER NOT NULL DEFAULT 0,
    "lessonsCompleted" INTEGER NOT NULL DEFAULT 0,
    "problemsAttempted" INTEGER NOT NULL DEFAULT 0,
    "problemsSolved" INTEGER NOT NULL DEFAULT 0,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "lessons_authorId_idx" ON "lessons"("authorId");

-- CreateIndex
CREATE INDEX "lessons_category_idx" ON "lessons"("category");

-- CreateIndex
CREATE INDEX "lessons_difficulty_idx" ON "lessons"("difficulty");

-- CreateIndex
CREATE INDEX "problems_lessonId_idx" ON "problems"("lessonId");

-- CreateIndex
CREATE INDEX "test_cases_problemId_idx" ON "test_cases"("problemId");

-- CreateIndex
CREATE INDEX "submissions_userId_idx" ON "submissions"("userId");

-- CreateIndex
CREATE INDEX "submissions_problemId_idx" ON "submissions"("problemId");

-- CreateIndex
CREATE INDEX "submissions_status_idx" ON "submissions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "user_progress_userId_key" ON "user_progress"("userId");

-- CreateIndex
CREATE INDEX "user_progress_userId_idx" ON "user_progress"("userId");
