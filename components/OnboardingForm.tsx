import React from 'react';
import { useForm } from 'react-hook-form';
import { OnboardingData } from '../types';
import { SOFTWARE_CATALOG } from '../types';
import { validateEmployeeNumber } from '../utils';

interface OnboardingFormProps {
  initialData?: Partial<OnboardingData>;
  onSubmit: (data: OnboardingData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEditing?: boolean;
}

export const OnboardingForm: React.FC<OnboardingFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  isEditing = false
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    getValues
  } = useForm<OnboardingData>({
    defaultValues: {
      employeeNumber: initialData?.employeeNumber || '',
      fullName: initialData?.fullName || '',
      department: initialData?.department || '',
      startDate: initialData?.startDate || '',
      softwareRequirements: initialData?.softwareRequirements || [],
      otherSoftware: initialData?.otherSoftware || ''
    }
  });

  const watchedSoftwareRequirements = watch('softwareRequirements') || [];
  const hasOtherSoftware = watchedSoftwareRequirements.includes('other');

  const handleSoftwareChange = (softwareId: string, checked: boolean) => {
    const current = getValues('softwareRequirements') || [];
    if (checked) {
      setValue('softwareRequirements', [...current, softwareId]);
    } else {
      setValue('softwareRequirements', current.filter(id => id !== softwareId));
      // Limpiar otherSoftware si se deselecciona "other"
      if (softwareId === 'other') {
        setValue('otherSoftware', '');
      }
    }
  };

  const handleFormSubmit = (data: OnboardingData) => {
    // Validar que si se selecciona "other", se proporcione descripción
    if (data.softwareRequirements.includes('other') && !data.otherSoftware?.trim()) {
      return;
    }
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Employee Number */}
        <div>
          <label htmlFor="employeeNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Número de Empleado *
          </label>
          <input
            {...register('employeeNumber', {
              required: 'El número de empleado es requerido',
              validate: (value) => validateEmployeeNumber(value) || 'Debe ser alfanumérico de 4-12 caracteres'
            })}
            type="text"
            className="input"
            placeholder="Ej: EMP001"
            disabled={isEditing}
          />
          {errors.employeeNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.employeeNumber.message}</p>
          )}
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre Completo *
          </label>
          <input
            {...register('fullName', {
              required: 'El nombre completo es requerido',
              minLength: { value: 2, message: 'Mínimo 2 caracteres' },
              maxLength: { value: 255, message: 'Máximo 255 caracteres' }
            })}
            type="text"
            className="input"
            placeholder="Ej: Juan Pérez García"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Department */}
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
            Departamento *
          </label>
          <input
            {...register('department', {
              required: 'El departamento es requerido',
              minLength: { value: 2, message: 'Mínimo 2 caracteres' },
              maxLength: { value: 100, message: 'Máximo 100 caracteres' }
            })}
            type="text"
            className="input"
            placeholder="Ej: Desarrollo, Marketing, Finanzas"
          />
          {errors.department && (
            <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
          )}
        </div>

        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Inicio *
          </label>
          <input
            {...register('startDate', {
              required: 'La fecha de inicio es requerida'
            })}
            type="date"
            className="input"
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
          )}
        </div>
      </div>

      {/* Software Requirements */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Requerimientos de Software *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SOFTWARE_CATALOG.map((software) => (
            <label key={software.id} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={watchedSoftwareRequirements.includes(software.id)}
                onChange={(e) => handleSoftwareChange(software.id, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{software.name}</span>
            </label>
          ))}
        </div>
        {errors.softwareRequirements && (
          <p className="mt-1 text-sm text-red-600">{errors.softwareRequirements.message}</p>
        )}
      </div>

      {/* Other Software */}
      {hasOtherSoftware && (
        <div>
          <label htmlFor="otherSoftware" className="block text-sm font-medium text-gray-700 mb-2">
            Otro Software *
          </label>
          <input
            {...register('otherSoftware', {
              required: hasOtherSoftware ? 'La descripción del otro software es requerida' : false,
              maxLength: { value: 500, message: 'Máximo 500 caracteres' }
            })}
            type="text"
            className="input"
            placeholder="Describe el software adicional requerido"
          />
          {errors.otherSoftware && (
            <p className="mt-1 text-sm text-red-600">{errors.otherSoftware.message}</p>
          )}
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
        </button>
      </div>
    </form>
  );
};






