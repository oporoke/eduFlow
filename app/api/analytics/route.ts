import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const classroomId = searchParams.get("classroomId");

  if (!classroomId) return NextResponse.json({ error: "classroomId required" }, { status: 400 });

  // Get all enrolled students
  const enrollments = await prisma.enrollment.findMany({
    where: { classroomId },
    include: { student: true },
  });

  // Get all lessons in this classroom
  const subjects = await prisma.subject.findMany({
    where: { classroomId },
    include: {
      topics: {
        include: {
          subtopics: {
            include: {
              lessons: true,
              quizzes: {
                include: { attempts: true },
              },
            },
          },
        },
      },
    },
  });

  const allLessons = subjects.flatMap((s) =>
    s.topics.flatMap((t) =>
      t.subtopics.flatMap((st) => st.lessons)
    )
  );

  const allQuizzes = subjects.flatMap((s) =>
    s.topics.flatMap((t) =>
      t.subtopics.flatMap((st) => st.quizzes)
    )
  );

  // Per student analytics
  const studentStats = await Promise.all(
    enrollments.map(async (e) => {
      const completedLessons = await prisma.lessonProgress.count({
        where: {
          studentId: e.studentId,
          lessonId: { in: allLessons.map((l) => l.id) },
          completed: true,
        },
      });

      const quizAttempts = await prisma.quizAttempt.findMany({
        where: {
          studentId: e.studentId,
          quizId: { in: allQuizzes.map((q) => q.id) },
        },
      });

      const avgScore =
        quizAttempts.length > 0
          ? Math.round(
              (quizAttempts.reduce((acc, a) => acc + a.score / a.total, 0) /
                quizAttempts.length) *
                100
            )
          : null;

      return {
        student: e.student,
        completedLessons,
        totalLessons: allLessons.length,
        quizzesTaken: quizAttempts.length,
        totalQuizzes: allQuizzes.length,
        avgScore,
      };
    })
  );

  return NextResponse.json({
    totalStudents: enrollments.length,
    totalLessons: allLessons.length,
    totalQuizzes: allQuizzes.length,
    studentStats,
  });
}
