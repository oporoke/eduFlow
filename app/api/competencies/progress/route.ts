import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId") || (session.user as any).id;

  const progress = await prisma.competencyProgress.findMany({
    where: { studentId },
    include: { competency: true },
  });

  return NextResponse.json(progress);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== "TEACHER" && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { studentId, competencyId, level } = await req.json();

  const progress = await prisma.competencyProgress.upsert({
    where: { studentId_competencyId: { studentId, competencyId } },
    update: { level },
    create: { studentId, competencyId, level },
  });

  return NextResponse.json(progress);
}