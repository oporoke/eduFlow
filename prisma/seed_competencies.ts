import bcrypt from "bcryptjs";
import { PrismaClient } from "@/app/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

async function main() {
  const competencies = [
    // Core Competencies
    { name: "Communication & Collaboration", description: "Ability to communicate effectively and work with others", category: "Core" },
    { name: "Critical Thinking & Problem Solving", description: "Ability to analyze, evaluate and solve problems", category: "Core" },
    { name: "Creativity & Imagination", description: "Ability to generate new ideas and think innovatively", category: "Core" },
    { name: "Citizenship", description: "Understanding of civic responsibilities and democratic values", category: "Core" },
    { name: "Digital Literacy", description: "Ability to use digital tools effectively and responsibly", category: "Core" },
    { name: "Learning to Learn", description: "Ability to reflect on and take ownership of learning", category: "Core" },
    { name: "Self-Efficacy", description: "Belief in one's ability to succeed and persist", category: "Core" },

    // Pertinent & Contemporary Issues
    { name: "Environmental Awareness", description: "Understanding of environmental conservation", category: "PCI" },
    { name: "Financial Literacy", description: "Understanding of financial concepts and money management", category: "PCI" },
    { name: "Health & Nutrition", description: "Understanding of healthy living and nutrition", category: "PCI" },
    { name: "Safety & Security", description: "Awareness of personal and community safety", category: "PCI" },

    // Values
    { name: "Integrity", description: "Honesty and strong moral principles", category: "Values" },
    { name: "Respect", description: "Regard for others and their rights", category: "Values" },
    { name: "Responsibility", description: "Accountability for one's actions", category: "Values" },
    { name: "Social Justice", description: "Fairness and equity in social relations", category: "Values" },
  ];

  for (const c of competencies) {
    await prisma.competency.upsert({
      where: { id: c.name },
      update: {},
      create: c,
    });
  }

  console.log("CBC Competencies seeded successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
