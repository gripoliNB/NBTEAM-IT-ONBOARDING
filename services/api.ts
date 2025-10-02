import axios from 'axios';
import { 
  OnboardingData, 
  OnboardingResponse, 
  PaginationParams, 
  SearchParams, 
  ApiResponse, 
  PaginatedResponse,
  SoftwareOption 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export class OnboardingService {
  // Crear onboarding
  async createOnboarding(data: OnboardingData): Promise<OnboardingResponse> {
    const response = await api.post<ApiResponse<OnboardingResponse>>('/onboardings', data);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to create onboarding');
    }
    return response.data.data!;
  }

  // Obtener onboarding por employee number
  async getOnboarding(employeeNumber: string): Promise<OnboardingResponse> {
    const response = await api.get<ApiResponse<OnboardingResponse>>(`/onboardings/${employeeNumber}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to get onboarding');
    }
    return response.data.data!;
  }

  // Actualizar onboarding
  async updateOnboarding(employeeNumber: string, data: Partial<OnboardingData>): Promise<OnboardingResponse> {
    const response = await api.put<ApiResponse<OnboardingResponse>>(`/onboardings/${employeeNumber}`, data);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to update onboarding');
    }
    return response.data.data!;
  }

  // Eliminar onboarding
  async deleteOnboarding(employeeNumber: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(`/onboardings/${employeeNumber}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete onboarding');
    }
  }

  // Buscar onboardings
  async searchOnboardings(
    searchParams: SearchParams,
    paginationParams: PaginationParams
  ): Promise<PaginatedResponse<OnboardingResponse>> {
    const params = { ...searchParams, ...paginationParams };
    const response = await api.get<ApiResponse<PaginatedResponse<OnboardingResponse>>>('/onboardings', { params });
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to search onboardings');
    }
    return response.data.data!;
  }

  // Exportar onboardings
  async exportOnboardings(searchParams: SearchParams): Promise<Blob> {
    const response = await api.get('/onboardings/export', {
      params: searchParams,
      responseType: 'blob',
    });
    return response.data;
  }

  // Obtener catálogo de software
  async getSoftwareCatalog(): Promise<SoftwareOption[]> {
    const response = await api.get<ApiResponse<SoftwareOption[]>>('/software-catalog');
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to get software catalog');
    }
    return response.data.data!;
  }
}

export const onboardingService = new OnboardingService();






