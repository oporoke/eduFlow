import { prisma } from "@/lib/prisma";
import { getParentSession } from "@/lib/parent-auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const parent = await getParentSession();
  if (!parent) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { studentId } = await params;

  // Verify parent is linked to this student
  const link = await prisma.parentChild.findUnique({
    where: { parentId_studentId: { parentId: parent.id, studentId } },
  });

  if (!link) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Get student enrollments
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    include: {
      classroom: {
        include: {
          teacher: { select: { name: true } },
          subjects: {
            include: {
              topics: {
                include: {
                  subtopics: {
                    include: { lessons: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  // Get lesson progress
  const allLessonIds = enrollments.flatMap((e) =>
    e.classroom.subjects.flatMap((s) =>
      s.topics.flatMap((t) =>
        t.subtopics.flatMap((st) => st.lessons.map((l) => l.id))
      )
    )
  );

  const completedLessons = await prisma.lessonProgress.count({
    where: { studentId, lessonId: { in: allLessonIds }, completed: true },
  });

  // Get quiz attempts
  const quizAttempts = await prisma.quizAttempt.findMany({
    where: { studentId },
  });

  const avgScore = quizAttempts.length
    ? Math.round(
        (quizAttempts.reduce((acc, a) => acc + a.score / a.total, 0) /
          quizAttempts.length) * 100
      )
    : null;

  // Get IEPs
  const ieps = await prisma.iEP.findMany({
    where: { studentId },
    include: { teacher: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({
    enrollments,
    completedLessons,
    totalLessons: allLessonIds.length,
    avgScore,
    quizAttempts: quizAttempts.length,
    ieps,
  });
}