import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { SOFTWARE_CATALOG } from '../types';

// Formatear fecha para mostrar
export const formatDate = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy', { locale: es });
  } catch {
    return dateString;
  }
};

// Formatear fecha para input
export const formatDateForInput = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'yyyy-MM-dd');
  } catch {
    return dateString;
  }
};

// Obtener nombre del software por ID
export const getSoftwareName = (softwareId: string): string => {
  const software = SOFTWARE_CATALOG.find(s => s.id === softwareId);
  return software?.name || softwareId;
};

// Obtener nombres de software por IDs
export const getSoftwareNames = (softwareIds: string[]): string[] => {
  return softwareIds.map(getSoftwareName);
};

// Validar employee number
export const validateEmployeeNumber = (employeeNumber: string): boolean => {
  return /^[A-Za-z0-9]{4,12}$/.test(employeeNumber);
};

// Validar email
export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Clase CSS condicional
export const clsx = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Generar colores para badges
export const getBadgeColor = (index: number): string => {
  const colors = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-indigo-100 text-indigo-800',
    'bg-red-100 text-red-800',
    'bg-gray-100 text-gray-800',
  ];
  return colors[index % colors.length];
};

// Capitalizar primera letra
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Truncar texto
export const truncate = (str: string, length: number): string => {
  return str.length > length ? str.substring(0, length) + '...' : str;
};






