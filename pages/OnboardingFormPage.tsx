import React from 'react';
import { useCreateOnboarding, useUpdateOnboarding } from '../hooks/useOnboarding';
import { OnboardingForm } from '../components/OnboardingForm';
import { OnboardingData } from '../types';
import { ArrowLeft } from 'lucide-react';

interface OnboardingFormPageProps {
  initialData?: Partial<OnboardingData>;
  isEditing?: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export const OnboardingFormPage: React.FC<OnboardingFormPageProps> = ({
  initialData,
  isEditing = false,
  onCancel,
  onSuccess
}) => {
  const createOnboarding = useCreateOnboarding();
  const updateOnboarding = useUpdateOnboarding();

  const isLoading = createOnboarding.isLoading || updateOnboarding.isLoading;

  const handleSubmit = async (data: OnboardingData) => {
    try {
      if (isEditing && initialData?.employeeNumber) {
        await updateOnboarding.mutateAsync({
          employeeNumber: initialData.employeeNumber,
          data
        });
      } else {
        await createOnboarding.mutateAsync(data);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving onboarding:', error);
      // El error se mostrará en el formulario a través de React Query
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={onCancel}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Editar Onboarding' : 'Nuevo Onboarding'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEditing 
              ? 'Modifica la información del proceso de onboarding.'
              : 'Completa la información para crear un nuevo proceso de onboarding.'
            }
          </p>
        </div>

        {/* Formulario */}
        <div className="card">
          <OnboardingForm
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={onCancel}
            isLoading={isLoading}
            isEditing={isEditing}
          />
        </div>

        {/* Mensajes de error */}
        {(createOnboarding.error || updateOnboarding.error) && (
          <div className="mt-4 card bg-red-50 border-red-200">
            <div className="text-red-800">
              <strong>Error:</strong> {
                createOnboarding.error?.message || 
                updateOnboarding.error?.message || 
                'Error desconocido'
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
};






