import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { OnboardingListPage } from './pages/OnboardingListPage';
import { OnboardingFormPage } from './pages/OnboardingFormPage';
import { OnboardingDetailPage } from './pages/OnboardingDetailPage';
import { OnboardingData } from './types';

// Crear cliente de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

type AppPage = 'list' | 'create' | 'edit' | 'detail';

interface AppState {
  page: AppPage;
  selectedEmployeeNumber?: string;
  editingData?: Partial<OnboardingData>;
}

export const App: React.FC = () => {
  const [state, setState] = useState<AppState>({ page: 'list' });

  const navigateToList = () => {
    setState({ page: 'list' });
  };

  const navigateToCreate = () => {
    setState({ page: 'create' });
  };

  const navigateToEdit = (data: Partial<OnboardingData>) => {
    setState({ page: 'edit', editingData: data });
  };

  const navigateToDetail = (employeeNumber: string) => {
    setState({ page: 'detail', selectedEmployeeNumber: employeeNumber });
  };

  const handleEditFromDetail = (employeeNumber: string) => {
    // En una implementación real, cargarías los datos aquí
    setState({ page: 'edit', selectedEmployeeNumber: employeeNumber });
  };

  const handleDeleteFromDetail = async (employeeNumber: string) => {
    // En una implementación real, manejarías la eliminación aquí
    console.log('Delete:', employeeNumber);
    navigateToList();
  };

  const handleFormSuccess = () => {
    navigateToList();
  };

  const renderPage = () => {
    switch (state.page) {
      case 'list':
        return (
          <OnboardingListPage
            onEdit={navigateToEdit}
            onView={navigateToDetail}
            onCreateNew={navigateToCreate}
          />
        );
      
      case 'create':
        return (
          <OnboardingFormPage
            onCancel={navigateToList}
            onSuccess={handleFormSuccess}
          />
        );
      
      case 'edit':
        return (
          <OnboardingFormPage
            initialData={state.editingData}
            isEditing={true}
            onCancel={navigateToList}
            onSuccess={handleFormSuccess}
          />
        );
      
      case 'detail':
        return (
          <OnboardingDetailPage
            employeeNumber={state.selectedEmployeeNumber!}
            onEdit={handleEditFromDetail}
            onDelete={handleDeleteFromDetail}
            onBack={navigateToList}
          />
        );
      
      default:
        return <OnboardingListPage onEdit={navigateToEdit} onView={navigateToDetail} onCreateNew={navigateToCreate} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        {renderPage()}
      </div>
    </QueryClientProvider>
  );
};






