// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.submission.deleteMany();
  await prisma.testCase.deleteMany();
  await prisma.problem.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log("👤 Creating users...");
  const hashedPassword = await bcrypt.hash("password123", 10);

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@example.com",
      username: "admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  const instructorUser = await prisma.user.create({
    data: {
      email: "instructor@example.com",
      username: "instructor",
      password: hashedPassword,
      role: "INSTRUCTOR",
    },
  });

  const student1 = await prisma.user.create({
    data: {
      email: "student1@example.com",
      username: "student1",
      password: hashedPassword,
      role: "STUDENT",
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: "student2@example.com",
      username: "student2",
      password: hashedPassword,
      role: "STUDENT",
    },
  });

  // Create lessons
  console.log("📚 Creating lessons...");

  const lesson1 = await prisma.lesson.create({
    data: {
      title: "Introduction to Arrays",
      description: "Learn the basics of arrays and their operations",
      difficulty: "EASY",
      category: "Arrays",
      content:
        "# Arrays\n\nArrays are fundamental data structures...\n\n## Characteristics\n- Fixed size (in most languages)\n- Sequential storage\n- O(1) access time",
      authorId: instructorUser.id,
    },
  });

  const lesson2 = await prisma.lesson.create({
    data: {
      title: "Introduction to Linked Lists",
      description: "Understand linked lists and pointer-based data structures",
      difficulty: "MEDIUM",
      category: "Linked Lists",
      content:
        "# Linked Lists\n\nLinked lists use pointers to connect nodes...\n\n## Advantages\n- Dynamic size\n- Efficient insertion/deletion\n- No memory waste",
      authorId: instructorUser.id,
    },
  });

  const lesson3 = await prisma.lesson.create({
    data: {
      title: "Binary Search Trees",
      description: "Master binary search trees for efficient searching",
      difficulty: "HARD",
      category: "Trees",
      content:
        "# Binary Search Trees\n\nBSTs provide efficient search, insertion, and deletion operations...\n\n## Properties\n- Left child < parent\n- Right child > parent\n- Average O(log n) operations",
      authorId: instructorUser.id,
    },
  });

  // Create problems for lesson 1
  console.log("💻 Creating problems...");

  const problem1 = await prisma.problem.create({
    data: {
      title: "Find Maximum Element",
      description: "Write a function to find the maximum element in an array",
      difficulty: "EASY",
      initialCode: `function findMax(arr) {
  // Your code here
}`,
      language: "javascript",
      lessonId: lesson1.id,
    },
  });

  const problem2 = await prisma.problem.create({
    data: {
      title: "Reverse an Array",
      description: "Reverse an array in-place",
      difficulty: "EASY",
      initialCode: `function reverseArray(arr) {
  // Your code here
}`,
      language: "javascript",
      lessonId: lesson1.id,
    },
  });

  const problem3 = await prisma.problem.create({
    data: {
      title: "Merge Two Sorted Arrays",
      description: "Merge two sorted arrays into one sorted array",
      difficulty: "MEDIUM",
      initialCode: `function mergeSorted(arr1, arr2) {
  // Your code here
}`,
      language: "javascript",
      lessonId: lesson1.id,
    },
  });

  // Create test cases for problem 1
  console.log("🧪 Creating test cases...");

  await prisma.testCase.create({
    data: {
      input: "[1, 5, 3, 9, 2]",
      output: "9",
      isHidden: false,
      problemId: problem1.id,
    },
  });

  await prisma.testCase.create({
    data: {
      input: "[-10, -5, -20]",
      output: "-5",
      isHidden: false,
      problemId: problem1.id,
    },
  });

  await prisma.testCase.create({
    data: {
      input: "[100]",
      output: "100",
      isHidden: true,
      problemId: problem1.id,
    },
  });

  // Create test cases for problem 2
  await prisma.testCase.create({
    data: {
      input: "[1, 2, 3, 4, 5]",
      output: "[5, 4, 3, 2, 1]",
      isHidden: false,
      problemId: problem2.id,
    },
  });

  await prisma.testCase.create({
    data: {
      input: "[1]",
      output: "[1]",
      isHidden: false,
      problemId: problem2.id,
    },
  });

  // Create test cases for problem 3
  await prisma.testCase.create({
    data: {
      input: "[1, 3, 5] [2, 4, 6]",
      output: "[1, 2, 3, 4, 5, 6]",
      isHidden: false,
      problemId: problem3.id,
    },
  });

  // Create user progress
  console.log("📊 Creating user progress...");

  await prisma.userProgress.create({
    data: {
      lessonsStarted: 2,
      lessonsCompleted: 1,
      problemsAttempted: 5,
      problemsSolved: 3,
      totalScore: 300,
      userId: student1.id,
    },
  });

  await prisma.userProgress.create({
    data: {
      lessonsStarted: 1,
      lessonsCompleted: 0,
      problemsAttempted: 2,
      problemsSolved: 1,
      totalScore: 100,
      userId: student2.id,
    },
  });

  // Create sample submissions
  console.log("📝 Creating sample submissions...");

  await prisma.submission.create({
    data: {
      code: `function findMax(arr) {
  return Math.max(...arr);
}`,
      language: "javascript",
      status: "ACCEPTED",
      score: 100,
      result: JSON.stringify({
        passed: 2,
        failed: 0,
        verdict: "Accepted",
      }),
      userId: student1.id,
      problemId: problem1.id,
    },
  });

  await prisma.submission.create({
    data: {
      code: `function reverseArray(arr) {
  return arr.reverse();
}`,
      language: "javascript",
      status: "ACCEPTED",
      score: 100,
      result: JSON.stringify({
        passed: 2,
        failed: 0,
        verdict: "Accepted",
      }),
      userId: student1.id,
      problemId: problem2.id,
    },
  });

  console.log("✅ Database seeding completed!");
  console.log("\n📌 Sample Credentials:");
  console.log("Admin: admin@example.com / password123");
  console.log("Instructor: instructor@example.com / password123");
  console.log("Student 1: student1@example.com / password123");
  console.log("Student 2: student2@example.com / password123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
