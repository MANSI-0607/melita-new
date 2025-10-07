/**
 * Utility functions for handling API errors and displaying user-friendly messages
 */

export interface ApiError {
  success: boolean;
  message: string;
  errors?: Record<string, string | string[]>;
}

/**
 * Extracts error message from API response
 */
export const extractErrorMessage = (error: any, fallbackMessage: string = 'An error occurred'): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return fallbackMessage;
};

/**
 * Handles API response and throws appropriate errors
 */
export const handleApiResponse = async (response: Response): Promise<any> => {
  let data: any = {};
  
  try {
    data = await response.json();
  } catch (jsonError) {
    // If JSON parsing fails, create a basic error object
    data = {
      success: false,
      message: `HTTP ${response.status}: ${response.statusText}`,
      errors: {}
    };
  }
  
  if (!response.ok) {
    const errorMessage = data.message || `HTTP ${response.status}: ${response.statusText}`;
    const errorDetails = data.errors ? 
      Object.values(data.errors)
        .flat()
        .filter(Boolean)
        .join(', ') : '';
    
    const fullMessage = errorDetails ? `${errorMessage}. ${errorDetails}` : errorMessage;
    throw new Error(fullMessage);
  }
  
  if (data.success === false) {
    const errorMessage = data.message || 'Operation failed';
    const errorDetails = data.errors ? 
      Object.values(data.errors)
        .flat()
        .filter(Boolean)
        .join(', ') : '';
    
    const fullMessage = errorDetails ? `${errorMessage}. ${errorDetails}` : errorMessage;
    throw new Error(fullMessage);
  }
  
  return data;
};

/**
 * Creates a standardized error handler for API calls
 */
export const createApiErrorHandler = (
  operation: string,
  onError?: (error: Error) => void
) => {
  return (error: any) => {
    const errorMessage = extractErrorMessage(error, `Failed to ${operation}`);
    console.error(`Error ${operation}:`, error);
    
    if (onError) {
      onError(new Error(errorMessage));
    }
    
    return errorMessage;
  };
};

/**
 * Validates form data and returns validation errors
 */
export const validateFormData = (
  data: Record<string, any>,
  rules: Record<string, (value: any) => string | null>
): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  for (const [field, validator] of Object.entries(rules)) {
    const error = validator(data[field]);
    if (error) {
      errors[field] = error;
    }
  }
  
  return errors;
};

/**
 * Common validation rules
 */
export const validationRules = {
  required: (fieldName: string) => (value: any) => 
    (!value || (typeof value === 'string' && !value.trim())) ? `${fieldName} is required` : null,
  
  minLength: (fieldName: string, min: number) => (value: any) => 
    (typeof value === 'string' && value.length < min) ? `${fieldName} must be at least ${min} characters` : null,
  
  maxLength: (fieldName: string, max: number) => (value: any) => 
    (typeof value === 'string' && value.length > max) ? `${fieldName} must be no more than ${max} characters` : null,
  
  email: (fieldName: string) => (value: any) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (typeof value === 'string' && value && !emailRegex.test(value)) ? `${fieldName} must be a valid email` : null;
  },
  
  phone: (fieldName: string) => (value: any) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return (typeof value === 'string' && value && !phoneRegex.test(value)) ? `${fieldName} must be a valid 10-digit phone number` : null;
  },
  
  positiveNumber: (fieldName: string) => (value: any) => 
    (typeof value === 'number' && value <= 0) ? `${fieldName} must be a positive number` : null,
  
  nonNegativeNumber: (fieldName: string) => (value: any) => 
    (typeof value === 'number' && value < 0) ? `${fieldName} cannot be negative` : null
};
