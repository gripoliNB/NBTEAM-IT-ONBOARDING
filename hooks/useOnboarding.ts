import { useQuery, useMutation, useQueryClient } from 'react-query';
import { onboardingService } from '../services/api';
import { OnboardingData, SearchParams, PaginationParams } from '../types';

// Hook para obtener onboardings
export const useOnboardings = (searchParams: SearchParams, paginationParams: PaginationParams) => {
  return useQuery(
    ['onboardings', searchParams, paginationParams],
    () => onboardingService.searchOnboardings(searchParams, paginationParams),
    {
      keepPreviousData: true,
      staleTime: 30000, // 30 segundos
    }
  );
};

// Hook para obtener un onboarding específico
export const useOnboarding = (employeeNumber: string) => {
  return useQuery(
    ['onboarding', employeeNumber],
    () => onboardingService.getOnboarding(employeeNumber),
    {
      enabled: !!employeeNumber,
    }
  );
};

// Hook para obtener catálogo de software
export const useSoftwareCatalog = () => {
  return useQuery(
    ['software-catalog'],
    () => onboardingService.getSoftwareCatalog(),
    {
      staleTime: 300000, // 5 minutos
    }
  );
};

// Hook para crear onboarding
export const useCreateOnboarding = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (data: OnboardingData) => onboardingService.createOnboarding(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('onboardings');
      },
    }
  );
};

// Hook para actualizar onboarding
export const useUpdateOnboarding = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ employeeNumber, data }: { employeeNumber: string; data: Partial<OnboardingData> }) =>
      onboardingService.updateOnboarding(employeeNumber, data),
    {
      onSuccess: (_, { employeeNumber }) => {
        queryClient.invalidateQueries('onboardings');
        queryClient.invalidateQueries(['onboarding', employeeNumber]);
      },
    }
  );
};

// Hook para eliminar onboarding
export const useDeleteOnboarding = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (employeeNumber: string) => onboardingService.deleteOnboarding(employeeNumber),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('onboardings');
      },
    }
  );
};

// Hook para exportar onboardings
export const useExportOnboardings = () => {
  return useMutation(
    (searchParams: SearchParams) => onboardingService.exportOnboardings(searchParams),
    {
      onSuccess: (blob, searchParams) => {
        // Crear URL para descargar el archivo
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `onboardings-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
    }
  );
};






