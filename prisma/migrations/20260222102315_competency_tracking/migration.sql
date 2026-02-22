-- CreateTable
CREATE TABLE "Competency" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Competency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonCompetency" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,

    CONSTRAINT "LessonCompetency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizCompetency" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,

    CONSTRAINT "QuizCompetency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetencyProgress" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'BEGINNING',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompetencyProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LessonCompetency_lessonId_competencyId_key" ON "LessonCompetency"("lessonId", "competencyId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizCompetency_quizId_competencyId_key" ON "QuizCompetency"("quizId", "competencyId");

-- CreateIndex
CREATE UNIQUE INDEX "CompetencyProgress_studentId_competencyId_key" ON "CompetencyProgress"("studentId", "competencyId");

-- AddForeignKey
ALTER TABLE "LessonCompetency" ADD CONSTRAINT "LessonCompetency_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonCompetency" ADD CONSTRAINT "LessonCompetency_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "Competency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizCompetency" ADD CONSTRAINT "QuizCompetency_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizCompetency" ADD CONSTRAINT "QuizCompetency_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "Competency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencyProgress" ADD CONSTRAINT "CompetencyProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencyProgress" ADD CONSTRAINT "CompetencyProgress_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "Competency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
