export interface OnboardingData {
  employeeNumber: string;
  fullName: string;
  department: string;
  startDate: string;
  softwareRequirements: string[];
  otherSoftware?: string;
}

export interface OnboardingResponse {
  id: string;
  employeeNumber: string;
  fullName: string;
  department: string;
  startDate: string;
  softwareRequirements: string[];
  otherSoftware?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface SearchParams {
  q?: string;
  department?: string;
  from?: string;
  to?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

export interface SoftwareOption {
  id: string;
  name: string;
  category?: string;
}

export const SOFTWARE_CATALOG: SoftwareOption[] = [
  { id: 'email', name: 'Crear / Activar cuenta de correo electrónico corporativo' },
  { id: 'powerbi', name: 'Power BI' },
  { id: 'quickbook', name: 'Appd financiera QuickBook' },
  { id: 'avast', name: 'Avast' },
  { id: 'microsoft365', name: 'Microsoft 365' },
  { id: 'project', name: 'Project' },
  { id: 'teams', name: 'Teams' },
  { id: 'bamboo', name: 'Bamboo' },
  { id: 'acrobat', name: 'Acrobat' },
  { id: 'dialpad', name: 'Dialpad' },
  { id: 'office365', name: 'Office 365' },
  { id: 'hubspot', name: 'Hubspot' },
  { id: 'harvest', name: 'Harverst' },
  { id: 'pamet', name: 'Pamet Each' },
  { id: 'sap', name: 'SAP for ME' },
  { id: 'zoom', name: 'ZOOM' },
  { id: 'solman', name: 'Solman' },
  { id: 'aws', name: 'Escritorio Virtual (AWS)' },
  { id: 'printers', name: 'Acceso a impresoras y dispositivos' },
  { id: 'other', name: 'Other' }
];