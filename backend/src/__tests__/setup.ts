import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Setup test database
  await prisma.$connect();
});

afterAll(async () => {
  // Cleanup
  await prisma.onboarding.deleteMany({
    where: {
      employeeNumber: {
        startsWith: 'TEST'
      }
    }
  });
  await prisma.$disconnect();
});






