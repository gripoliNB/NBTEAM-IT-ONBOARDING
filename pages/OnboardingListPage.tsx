import React, { useState } from 'react';
import { useOnboardings, useDeleteOnboarding, useExportOnboardings } from '../hooks/useOnboarding';
import { OnboardingTable } from '../components/OnboardingTable';
import { SearchFilters } from '../components/SearchFilters';
import { Pagination } from '../components/Pagination';
import { SearchParams, PaginationParams, OnboardingResponse } from '../types';

interface OnboardingListPageProps {
  onEdit: (onboarding: OnboardingResponse) => void;
  onView: (employeeNumber: string) => void;
  onCreateNew: () => void;
}

export const OnboardingListPage: React.FC<OnboardingListPageProps> = ({
  onEdit,
  onView,
  onCreateNew
}) => {
  const [searchParams, setSearchParams] = useState<SearchParams>({});
  const [paginationParams, setPaginationParams] = useState<PaginationParams>({
    page: 1,
    size: 10,
    sort: '-startDate'
  });

  const { data, isLoading, error } = useOnboardings(searchParams, paginationParams);
  const deleteOnboarding = useDeleteOnboarding();
  const exportOnboardings = useExportOnboardings();

  const handleSearchChange = (newSearchParams: SearchParams) => {
    setSearchParams(newSearchParams);
    setPaginationParams(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handlePageChange = (page: number) => {
    setPaginationParams(prev => ({ ...prev, page }));
  };

  const handlePageSizeChange = (size: number) => {
    setPaginationParams(prev => ({ ...prev, size, page: 1 }));
  };

  const handleDelete = async (employeeNumber: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este registro de onboarding?')) {
      try {
        await deleteOnboarding.mutateAsync(employeeNumber);
        // Los datos se actualizarán automáticamente gracias a React Query
      } catch (error) {
        console.error('Error deleting onboarding:', error);
        alert('Error al eliminar el registro');
      }
    }
  };

  const handleExport = async () => {
    try {
      await exportOnboardings.mutateAsync(searchParams);
    } catch (error) {
      console.error('Error exporting onboardings:', error);
      alert('Error al exportar los datos');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card">
            <div className="text-center py-12">
              <div className="text-red-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar datos</h3>
              <p className="text-gray-500 mb-4">No se pudieron cargar los registros de onboarding.</p>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Onboarding IT</h1>
          <p className="mt-2 text-gray-600">
            Administra los procesos de onboarding de empleados y sus requerimientos de software.
          </p>
        </div>

        {/* Filtros de búsqueda */}
        <div className="mb-6">
          <SearchFilters
            searchParams={searchParams}
            onSearchChange={handleSearchChange}
            onExport={handleExport}
            onCreateNew={onCreateNew}
            isLoading={isLoading || exportOnboardings.isLoading}
          />
        </div>

        {/* Tabla de resultados */}
        <div className="mb-6">
          <OnboardingTable
            onboardings={data?.data || []}
            onEdit={onEdit}
            onDelete={handleDelete}
            onView={onView}
            isLoading={isLoading}
          />
        </div>

        {/* Paginación */}
        {data && data.pagination.totalPages > 1 && (
          <Pagination
            currentPage={data.pagination.page}
            totalPages={data.pagination.totalPages}
            totalItems={data.pagination.total}
            itemsPerPage={data.pagination.size}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>
    </div>
  );
};






