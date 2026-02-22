import { prisma } from "@/lib/prisma";
import { getParentSession } from "@/lib/parent-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const parent = await getParentSession();
  if (!parent) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const children = await prisma.parentChild.findMany({
    where: { parentId: parent.id },
    include: {
      student: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return NextResponse.json(children);
}

export async function POST(req: Request) {
  const parent = await getParentSession();
  if (!parent) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { studentEmail } = await req.json();

  if (!studentEmail) {
    return NextResponse.json({ error: "Student email required" }, { status: 400 });
  }

  const student = await prisma.user.findUnique({ where: { email: studentEmail } });
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  if (student.role !== "STUDENT") {
    return NextResponse.json({ error: "User is not a student" }, { status: 400 });
  }

  try {
    const link = await prisma.parentChild.create({
      data: { parentId: parent.id, studentId: student.id },
      include: { student: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json(link, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Already linked to this student" }, { status: 400 });
  }
}