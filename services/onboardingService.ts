import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { OnboardingData, OnboardingResponse, PaginationParams, SearchParams } from '../types';

export class OnboardingService {
  async createOnboarding(data: OnboardingData, createdBy?: string): Promise<OnboardingResponse> {
    // Verificar si el employee number ya existe
    const existing = await prisma.onboarding.findFirst({
      where: {
        employeeNumber: data.employeeNumber,
        isDeleted: false
      }
    });

    if (existing) {
      throw new Error('Employee number already exists');
    }

    const onboarding = await prisma.onboarding.create({
      data: {
        employeeNumber: data.employeeNumber,
        fullName: data.fullName,
        department: data.department,
        startDate: new Date(data.startDate),
        softwareRequirements: data.softwareRequirements,
        otherSoftware: data.otherSoftware,
        createdBy: createdBy
      }
    });

    return this.formatOnboardingResponse(onboarding);
  }

  async getOnboardingByEmployeeNumber(employeeNumber: string): Promise<OnboardingResponse | null> {
    const onboarding = await prisma.onboarding.findFirst({
      where: {
        employeeNumber: employeeNumber,
        isDeleted: false
      }
    });

    return onboarding ? this.formatOnboardingResponse(onboarding) : null;
  }

  async updateOnboarding(
    employeeNumber: string, 
    data: Partial<OnboardingData>, 
    updatedBy?: string
  ): Promise<OnboardingResponse> {
    const existing = await prisma.onboarding.findFirst({
      where: {
        employeeNumber: employeeNumber,
        isDeleted: false
      }
    });

    if (!existing) {
      throw new Error('Onboarding record not found');
    }

    // Si se está cambiando el employee number, verificar que no exista
    if (data.employeeNumber && data.employeeNumber !== employeeNumber) {
      const duplicate = await prisma.onboarding.findFirst({
        where: {
          employeeNumber: data.employeeNumber,
          isDeleted: false,
          id: { not: existing.id }
        }
      });

      if (duplicate) {
        throw new Error('Employee number already exists');
      }
    }

    const updateData: Prisma.OnboardingUpdateInput = {
      updatedBy: updatedBy,
      updatedAt: new Date()
    };

    if (data.employeeNumber) updateData.employeeNumber = data.employeeNumber;
    if (data.fullName) updateData.fullName = data.fullName;
    if (data.department) updateData.department = data.department;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.softwareRequirements) updateData.softwareRequirements = data.softwareRequirements;
    if (data.otherSoftware !== undefined) updateData.otherSoftware = data.otherSoftware;

    const onboarding = await prisma.onboarding.update({
      where: { id: existing.id },
      data: updateData
    });

    return this.formatOnboardingResponse(onboarding);
  }

  async deleteOnboarding(employeeNumber: string, deletedBy?: string): Promise<void> {
    const existing = await prisma.onboarding.findFirst({
      where: {
        employeeNumber: employeeNumber,
        isDeleted: false
      }
    });

    if (!existing) {
      throw new Error('Onboarding record not found');
    }

    await prisma.onboarding.update({
      where: { id: existing.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: deletedBy
      }
    });
  }

  async searchOnboardings(
    searchParams: SearchParams,
    paginationParams: PaginationParams
  ) {
    const { q, department, from, to } = searchParams;
    const { page = 1, size = 10, sort = '-startDate' } = paginationParams;

    const where: Prisma.OnboardingWhereInput = {
      isDeleted: false
    };

    // Filtros de búsqueda
    if (q) {
      where.OR = [
        { employeeNumber: { contains: q, mode: 'insensitive' } },
        { fullName: { contains: q, mode: 'insensitive' } },
        { department: { contains: q, mode: 'insensitive' } }
      ];
    }

    if (department) {
      where.department = { contains: department, mode: 'insensitive' };
    }

    if (from || to) {
      where.startDate = {};
      if (from) where.startDate.gte = new Date(from);
      if (to) where.startDate.lte = new Date(to);
    }

    // Ordenamiento
    const orderBy: Prisma.OnboardingOrderByWithRelationInput = {};
    if (sort.startsWith('-')) {
      orderBy[sort.slice(1) as keyof Prisma.OnboardingOrderByWithRelationInput] = 'desc';
    } else {
      orderBy[sort as keyof Prisma.OnboardingOrderByWithRelationInput] = 'asc';
    }

    const skip = (page - 1) * size;

    const [onboardings, total] = await Promise.all([
      prisma.onboarding.findMany({
        where,
        orderBy,
        skip,
        take: size
      }),
      prisma.onboarding.count({ where })
    ]);

    return {
      data: onboardings.map(onboarding => this.formatOnboardingResponse(onboarding)),
      pagination: {
        page,
        size,
        total,
        totalPages: Math.ceil(total / size)
      }
    };
  }

  async exportOnboardings(searchParams: SearchParams) {
    const { q, department, from, to } = searchParams;

    const where: Prisma.OnboardingWhereInput = {
      isDeleted: false
    };

    if (q) {
      where.OR = [
        { employeeNumber: { contains: q, mode: 'insensitive' } },
        { fullName: { contains: q, mode: 'insensitive' } },
        { department: { contains: q, mode: 'insensitive' } }
      ];
    }

    if (department) {
      where.department = { contains: department, mode: 'insensitive' };
    }

    if (from || to) {
      where.startDate = {};
      if (from) where.startDate.gte = new Date(from);
      if (to) where.startDate.lte = new Date(to);
    }

    const onboardings = await prisma.onboarding.findMany({
      where,
      orderBy: { startDate: 'desc' }
    });

    return onboardings.map(onboarding => this.formatOnboardingResponse(onboarding));
  }

  private formatOnboardingResponse(onboarding: any): OnboardingResponse {
    return {
      id: onboarding.id,
      employeeNumber: onboarding.employeeNumber,
      fullName: onboarding.fullName,
      department: onboarding.department,
      startDate: onboarding.startDate.toISOString().split('T')[0],
      softwareRequirements: onboarding.softwareRequirements,
      otherSoftware: onboarding.otherSoftware,
      createdAt: onboarding.createdAt.toISOString(),
      updatedAt: onboarding.updatedAt.toISOString(),
      createdBy: onboarding.createdBy,
      updatedBy: onboarding.updatedBy
    };
  }
}


