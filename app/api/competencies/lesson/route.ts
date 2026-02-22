import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lessonId, competencyIds } = await req.json();

  if (!lessonId || !competencyIds?.length) {
    return NextResponse.json({ error: "lessonId and competencyIds required" }, { status: 400 });
  }

  // Delete existing and recreate
  await prisma.lessonCompetency.deleteMany({ where: { lessonId } });

  await prisma.lessonCompetency.createMany({
    data: competencyIds.map((competencyId: string) => ({ lessonId, competencyId })),
  });

  return NextResponse.json({ message: "Competencies linked" });
}