import { body, param, query } from 'express-validator';
import { SOFTWARE_CATALOG } from '../types';

export const validateOnboarding = [
  body('employeeNumber')
    .isString()
    .isLength({ min: 4, max: 12 })
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage('Employee number must be 4-12 alphanumeric characters'),
  
  body('fullName')
    .isString()
    .isLength({ min: 2, max: 255 })
    .trim()
    .withMessage('Full name is required and must be 2-255 characters'),
  
  body('department')
    .isString()
    .isLength({ min: 2, max: 100 })
    .trim()
    .withMessage('Department is required and must be 2-100 characters'),
  
  body('startDate')
    .isISO8601()
    .toDate()
    .withMessage('Start date must be a valid date'),
  
  body('softwareRequirements')
    .isArray()
    .withMessage('Software requirements must be an array'),
  
  body('softwareRequirements.*')
    .isString()
    .isIn(SOFTWARE_CATALOG.map(s => s.id))
    .withMessage('Invalid software requirement'),
  
  body('otherSoftware')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .trim()
    .custom((value, { req }) => {
      const softwareRequirements = req.body.softwareRequirements || [];
      if (softwareRequirements.includes('other') && (!value || value.trim().length === 0)) {
        throw new Error('Other software description is required when "Other" is selected');
      }
      return true;
    })
];

export const validateEmployeeNumber = [
  param('employeeNumber')
    .isString()
    .isLength({ min: 4, max: 12 })
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage('Invalid employee number format')
];

export const validateSearchParams = [
  query('q')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .trim()
    .withMessage('Search query must be a string with max 100 characters'),
  
  query('department')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .trim()
    .withMessage('Department filter must be a string with max 100 characters'),
  
  query('from')
    .optional()
    .isISO8601()
    .withMessage('From date must be a valid ISO date'),
  
  query('to')
    .optional()
    .isISO8601()
    .withMessage('To date must be a valid ISO date'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('size')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Size must be between 1 and 100'),
  
  query('sort')
    .optional()
    .isIn(['startDate', '-startDate', 'department', '-department', 'employeeNumber', '-employeeNumber'])
    .withMessage('Invalid sort field')
];


