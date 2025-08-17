import Joi from 'joi';
import { logger } from '../utils/logger.js';

// Validation schemas
const userSchemas = {
  register: Joi.object({
    username: Joi.string()
      .min(3)
      .max(30)
      .pattern(/^[a-zA-Z0-9_]+$/)
      .required()
      .messages({
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters',
        'string.pattern.base': 'Username can only contain letters, numbers, and underscores',
        'any.required': 'Username is required'
      }),
    email: Joi.string()
      .email()
      .lowercase()
      .required()
      .messages({
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required'
      }),
    firstName: Joi.string()
      .max(50)
      .optional()
      .messages({
        'string.max': 'First name cannot exceed 50 characters'
      }),
    lastName: Joi.string()
      .max(50)
      .optional()
      .messages({
        'string.max': 'Last name cannot exceed 50 characters'
      })
  }),

  login: Joi.object({
    email: Joi.string()
      .required()
      .messages({
        'any.required': 'Email or username is required'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  }),

  updateProfile: Joi.object({
    firstName: Joi.string()
      .max(50)
      .optional()
      .messages({
        'string.max': 'First name cannot exceed 50 characters'
      }),
    lastName: Joi.string()
      .max(50)
      .optional()
      .messages({
        'string.max': 'Last name cannot exceed 50 characters'
      })
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'any.required': 'Current password is required'
      }),
    newPassword: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'New password must be at least 6 characters long',
        'any.required': 'New password is required'
      })
  })
};

// Generic validation middleware
export const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = userSchemas[schemaName];
    
    if (!schema) {
      logger.error(`Validation schema '${schemaName}' not found`);
      return res.status(500).json({
        success: false,
        message: 'Validation error'
      });
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      
      logger.warn('Validation failed:', {
        path: req.path,
        errors: errorMessages,
        body: req.body
      });

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorMessages
      });
    }

    // Replace req.body with validated data
    req.body = value;
    next();
  };
};

// Specific validation middlewares
export const validateRegister = validate('register');
export const validateLogin = validate('login');
export const validateUpdateProfile = validate('updateProfile');
export const validateChangePassword = validate('changePassword');
