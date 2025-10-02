import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleOnboardings = [
  {
    employeeNumber: 'EMP001',
    fullName: 'Juan Pérez García',
    department: 'Desarrollo',
    startDate: new Date('2024-01-15'),
    softwareRequirements: ['email', 'microsoft365', 'teams', 'project'],
    otherSoftware: null,
    createdBy: 'admin@company.com'
  },
  {
    employeeNumber: 'EMP002',
    fullName: 'María López Rodríguez',
    department: 'Marketing',
    startDate: new Date('2024-01-20'),
    softwareRequirements: ['email', 'office365', 'hubspot', 'zoom'],
    otherSoftware: null,
    createdBy: 'admin@company.com'
  },
  {
    employeeNumber: 'EMP003',
    fullName: 'Carlos Martínez Silva',
    department: 'Finanzas',
    startDate: new Date('2024-02-01'),
    softwareRequirements: ['email', 'quickbook', 'powerbi', 'acrobat'],
    otherSoftware: null,
    createdBy: 'admin@company.com'
  },
  {
    employeeNumber: 'EMP004',
    fullName: 'Ana García Fernández',
    department: 'Recursos Humanos',
    startDate: new Date('2024-02-10'),
    softwareRequirements: ['email', 'bamboo', 'harvest', 'dialpad'],
    otherSoftware: null,
    createdBy: 'admin@company.com'
  },
  {
    employeeNumber: 'EMP005',
    fullName: 'Roberto Sánchez Torres',
    department: 'Infraestructura',
    startDate: new Date('2024-02-15'),
    softwareRequirements: ['email', 'aws', 'solman', 'sap', 'avast'],
    otherSoftware: 'Custom monitoring tool',
    createdBy: 'admin@company.com'
  }
];

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Limpiar datos existentes
    await prisma.onboarding.deleteMany({});
    console.log('🗑️  Cleaned existing onboarding records');

    // Crear registros de ejemplo
    for (const onboarding of sampleOnboardings) {
      await prisma.onboarding.create({
        data: onboarding
      });
      console.log(`✅ Created onboarding for ${onboarding.employeeNumber}`);
    }

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });






