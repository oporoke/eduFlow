import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const competencies = await prisma.competency.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(competencies);
}