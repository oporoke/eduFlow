import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const lessonId = searchParams.get("lessonId");

  if (!lessonId) return NextResponse.json({ error: "lessonId required" }, { status: 400 });

  const comments = await prisma.comment.findMany({
    where: { lessonId },
    include: { user: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(comments);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { lessonId, text } = await req.json();

  if (!lessonId || !text) {
    return NextResponse.json({ error: "lessonId and text are required" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: { lessonId, userId, text },
    include: { user: { select: { id: true, name: true, role: true } } },
  });

  return NextResponse.json(comment, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const role = (session.user as any).role;
  const { searchParams } = new URL(req.url);
  const commentId = searchParams.get("id");

  if (!commentId) return NextResponse.json({ error: "id required" }, { status: 400 });

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });

  if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });

  // Only owner, teacher or admin can delete
  if (comment.userId !== userId && role !== "ADMIN" && role !== "TEACHER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.comment.delete({ where: { id: commentId } });

  return NextResponse.json({ message: "Comment deleted" });
}