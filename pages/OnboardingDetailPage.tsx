import React from 'react';
import { useOnboarding } from '../hooks/useOnboarding';
import { formatDate, getSoftwareNames, getBadgeColor } from '../utils';
import { ArrowLeft, Edit, Trash2, Calendar, User, Building, Package } from 'lucide-react';

interface OnboardingDetailPageProps {
  employeeNumber: string;
  onEdit: (employeeNumber: string) => void;
  onDelete: (employeeNumber: string) => void;
  onBack: () => void;
}

export const OnboardingDetailPage: React.FC<OnboardingDetailPageProps> = ({
  employeeNumber,
  onEdit,
  onDelete,
  onBack
}) => {
  const { data: onboarding, isLoading, error } = useOnboarding(employeeNumber);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Cargando...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !onboarding) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card">
            <div className="text-center py-12">
              <div className="text-red-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Registro no encontrado</h3>
              <p className="text-gray-500 mb-4">No se pudo encontrar el registro de onboarding.</p>
              <button
                onClick={onBack}
                className="btn btn-primary"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const softwareNames = getSoftwareNames(onboarding.softwareRequirements);
  const hasOtherSoftware = onboarding.softwareRequirements.includes('other');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </button>
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(onboarding.employeeNumber)}
                className="btn btn-primary flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </button>
              <button
                onClick={() => {
                  if (window.confirm('¿Estás seguro de que quieres eliminar este registro?')) {
                    onDelete(onboarding.employeeNumber);
                  }
                }}
                className="btn btn-danger flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </button>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Detalles del Onboarding
          </h1>
          <p className="mt-2 text-gray-600">
            Información completa del proceso de onboarding para {onboarding.fullName}
          </p>
        </div>

        {/* Información principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Información del empleado */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Información del Empleado
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Número de Empleado</dt>
                <dd className="text-lg font-semibold text-gray-900">{onboarding.employeeNumber}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Nombre Completo</dt>
                <dd className="text-lg text-gray-900">{onboarding.fullName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Departamento</dt>
                <dd>
                  <span className="badge badge-blue text-lg">
                    {onboarding.department}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Información de fechas */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Fechas
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Fecha de Inicio</dt>
                <dd className="text-lg text-gray-900">{formatDate(onboarding.startDate)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Fecha de Creación</dt>
                <dd className="text-sm text-gray-600">{formatDate(onboarding.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Última Actualización</dt>
                <dd className="text-sm text-gray-600">{formatDate(onboarding.updatedAt)}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Requerimientos de software */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Requerimientos de Software
          </h2>
          
          {softwareNames.length > 0 ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {softwareNames.map((name, index) => (
                  <span
                    key={index}
                    className={`badge ${getBadgeColor(index)}`}
                  >
                    {name}
                  </span>
                ))}
              </div>
              
              {hasOtherSoftware && onboarding.otherSoftware && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="text-sm font-medium text-yellow-800 mb-2">Otro Software</h3>
                  <p className="text-yellow-700">{onboarding.otherSoftware}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No se han especificado requerimientos de software.</p>
          )}
        </div>

        {/* Información de auditoría */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Building className="h-5 w-5 mr-2" />
            Información de Auditoría
          </h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {onboarding.createdBy && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Creado por</dt>
                <dd className="text-sm text-gray-900">{onboarding.createdBy}</dd>
              </div>
            )}
            {onboarding.updatedBy && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Actualizado por</dt>
                <dd className="text-sm text-gray-900">{onboarding.updatedBy}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
};






