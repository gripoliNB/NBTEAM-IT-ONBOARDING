import React from 'react';
import { OnboardingResponse } from '../types';
import { formatDate, getSoftwareNames, getBadgeColor, truncate } from '../utils';
import { Edit, Trash2, Eye } from 'lucide-react';

interface OnboardingTableProps {
  onboardings: OnboardingResponse[];
  onEdit: (onboarding: OnboardingResponse) => void;
  onDelete: (employeeNumber: string) => void;
  onView: (employeeNumber: string) => void;
  isLoading?: boolean;
}

export const OnboardingTable: React.FC<OnboardingTableProps> = ({
  onboardings,
  onEdit,
  onDelete,
  onView,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando...</span>
        </div>
      </div>
    );
  }

  if (onboardings.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay registros</h3>
          <p className="text-gray-500">No se encontraron registros de onboarding.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Empleado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Departamento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Inicio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Software
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Otro Software
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {onboardings.map((onboarding) => {
              const softwareNames = getSoftwareNames(onboarding.softwareRequirements);
              const hasOtherSoftware = onboarding.softwareRequirements.includes('other');
              
              return (
                <tr key={onboarding.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {onboarding.employeeNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {onboarding.fullName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="badge badge-blue">
                      {onboarding.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(onboarding.startDate)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {softwareNames.slice(0, 3).map((name, index) => (
                        <span
                          key={index}
                          className={`badge ${getBadgeColor(index)}`}
                        >
                          {truncate(name, 20)}
                        </span>
                      ))}
                      {softwareNames.length > 3 && (
                        <span className="badge badge-gray">
                          +{softwareNames.length - 3} más
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {hasOtherSoftware && onboarding.otherSoftware ? (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        {truncate(onboarding.otherSoftware, 30)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => onView(onboarding.employeeNumber)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEdit(onboarding)}
                        className="text-indigo-600 hover:text-indigo-900 p-1"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(onboarding.employeeNumber)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};






