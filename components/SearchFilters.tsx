import React from 'react';
import { Search, Filter, Download, Plus } from 'lucide-react';
import { SearchParams } from '../types';
import { debounce } from '../utils';

interface SearchFiltersProps {
  searchParams: SearchParams;
  onSearchChange: (params: SearchParams) => void;
  onExport: () => void;
  onCreateNew: () => void;
  isLoading?: boolean;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchParams,
  onSearchChange,
  onExport,
  onCreateNew,
  isLoading = false
}) => {
  const [localParams, setLocalParams] = React.useState<SearchParams>(searchParams);

  // Debounced search
  const debouncedSearch = React.useCallback(
    debounce((params: SearchParams) => {
      onSearchChange(params);
    }, 300),
    [onSearchChange]
  );

  React.useEffect(() => {
    debouncedSearch(localParams);
  }, [localParams, debouncedSearch]);

  const handleInputChange = (field: keyof SearchParams, value: string) => {
    const newParams = { ...localParams, [field]: value || undefined };
    setLocalParams(newParams);
  };

  const clearFilters = () => {
    const clearedParams = {};
    setLocalParams(clearedParams);
  };

  const hasActiveFilters = Object.values(localParams).some(value => value);

  return (
    <div className="card">
      <div className="space-y-4">
        {/* Header con botones */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Filtros de Búsqueda</h2>
          <div className="flex space-x-2">
            <button
              onClick={onCreateNew}
              className="btn btn-primary flex items-center"
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Onboarding
            </button>
            <button
              onClick={onExport}
              className="btn btn-secondary flex items-center"
              disabled={isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Búsqueda general */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Búsqueda General
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                id="search"
                type="text"
                placeholder="Número, nombre, departamento..."
                value={localParams.q || ''}
                onChange={(e) => handleInputChange('q', e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Departamento */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              Departamento
            </label>
            <input
              id="department"
              type="text"
              placeholder="Ej: Desarrollo, Marketing..."
              value={localParams.department || ''}
              onChange={(e) => handleInputChange('department', e.target.value)}
              className="input"
            />
          </div>

          {/* Fecha desde */}
          <div>
            <label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Desde
            </label>
            <input
              id="from"
              type="date"
              value={localParams.from || ''}
              onChange={(e) => handleInputChange('from', e.target.value)}
              className="input"
            />
          </div>

          {/* Fecha hasta */}
          <div>
            <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Hasta
            </label>
            <input
              id="to"
              type="date"
              value={localParams.to || ''}
              onChange={(e) => handleInputChange('to', e.target.value)}
              className="input"
            />
          </div>
        </div>

        {/* Botón limpiar filtros */}
        {hasActiveFilters && (
          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
            >
              <Filter className="h-4 w-4 mr-1" />
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
};






