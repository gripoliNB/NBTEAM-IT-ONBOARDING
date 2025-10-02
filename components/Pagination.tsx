import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onPageSizeChange
}) => {
  const pageSizes = [10, 25, 50, 100];
  
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Mostrar</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            {pageSizes.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span className="text-sm text-gray-700">elementos por página</span>
        </div>
        <div className="text-sm text-gray-700">
          Mostrando {startItem} a {endItem} de {totalItems} resultados
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-700">Mostrar</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        >
          {pageSizes.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
        <span className="text-sm text-gray-700">elementos por página</span>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-700">
          Mostrando {startItem} a {endItem} de {totalItems} resultados
        </span>
        
        <div className="flex items-center space-x-1">
          {/* Botón anterior */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Números de página */}
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-gray-500">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={`px-3 py-2 rounded-md border text-sm font-medium ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}

          {/* Botón siguiente */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};






