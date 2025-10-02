import { Request, Response } from 'express';
import { OnboardingService } from '../services/onboardingService';
import { SOFTWARE_CATALOG } from '../types';

export class OnboardingController {
  private onboardingService: OnboardingService;

  constructor() {
    this.onboardingService = new OnboardingService();
  }

  createOnboarding = async (req: Request, res: Response) => {
    try {
      const onboardingData = req.body;
      const createdBy = req.user?.email; // Asumiendo que tenemos middleware de auth

      const onboarding = await this.onboardingService.createOnboarding(onboardingData, createdBy);

      res.status(201).json({
        success: true,
        data: onboarding,
        message: 'Onboarding created successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  };

  getOnboarding = async (req: Request, res: Response) => {
    try {
      const { employeeNumber } = req.params;
      const onboarding = await this.onboardingService.getOnboardingByEmployeeNumber(employeeNumber);

      if (!onboarding) {
        return res.status(404).json({
          success: false,
          error: 'Onboarding record not found'
        });
      }

      res.json({
        success: true,
        data: onboarding
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  updateOnboarding = async (req: Request, res: Response) => {
    try {
      const { employeeNumber } = req.params;
      const updateData = req.body;
      const updatedBy = req.user?.email;

      const onboarding = await this.onboardingService.updateOnboarding(
        employeeNumber,
        updateData,
        updatedBy
      );

      res.json({
        success: true,
        data: onboarding,
        message: 'Onboarding updated successfully'
      });
    } catch (error: any) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  };

  deleteOnboarding = async (req: Request, res: Response) => {
    try {
      const { employeeNumber } = req.params;
      const deletedBy = req.user?.email;

      await this.onboardingService.deleteOnboarding(employeeNumber, deletedBy);

      res.json({
        success: true,
        message: 'Onboarding deleted successfully'
      });
    } catch (error: any) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  };

  searchOnboardings = async (req: Request, res: Response) => {
    try {
      const searchParams = {
        q: req.query.q as string,
        department: req.query.department as string,
        from: req.query.from as string,
        to: req.query.to as string
      };

      const paginationParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        size: req.query.size ? parseInt(req.query.size as string) : 10,
        sort: req.query.sort as string || '-startDate'
      };

      const result = await this.onboardingService.searchOnboardings(searchParams, paginationParams);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  exportOnboardings = async (req: Request, res: Response) => {
    try {
      const searchParams = {
        q: req.query.q as string,
        department: req.query.department as string,
        from: req.query.from as string,
        to: req.query.to as string
      };

      const onboardings = await this.onboardingService.exportOnboardings(searchParams);

      // Configurar headers para descarga de CSV
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="onboardings.csv"');

      // Crear CSV
      const csvHeader = 'Employee Number,Full Name,Department,Start Date,Software Requirements,Other Software,Created At,Updated At\n';
      const csvRows = onboardings.map(onboarding => {
        const softwareList = onboarding.softwareRequirements.join('; ');
        return `"${onboarding.employeeNumber}","${onboarding.fullName}","${onboarding.department}","${onboarding.startDate}","${softwareList}","${onboarding.otherSoftware || ''}","${onboarding.createdAt}","${onboarding.updatedAt}"`;
      }).join('\n');

      res.send(csvHeader + csvRows);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  getSoftwareCatalog = async (req: Request, res: Response) => {
    res.json({
      success: true,
      data: SOFTWARE_CATALOG
    });
  };
}


