/**
 * Custom error classes for better error handling
 */

export class APIError extends Error {
  constructor(message, status = 500, code = 'API_ERROR') {
    super(message)
    this.name = 'APIError'
    this.status = status
    this.code = code
  }
}

export class AuthError extends Error {
  constructor(message, code = 'AUTH_ERROR') {
    super(message)
    this.name = 'AuthError'
    this.code = code
  }
}

export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message)
    this.name = 'ValidationError'
    this.field = field
  }
}

export class SubscriptionError extends Error {
  constructor(message, tier = null) {
    super(message)
    this.name = 'SubscriptionError'
    this.tier = tier
  }
}

/**
 * Error handler utility functions
 */
export const errorHandler = {
  /**
   * Handle Supabase errors
   */
  handleSupabaseError(error) {
    if (error.code === 'PGRST116') {
      return new APIError('Record not found', 404, 'NOT_FOUND')
    }
    if (error.code === '23505') {
      return new APIError('Record already exists', 409, 'DUPLICATE')
    }
    if (error.code === '23503') {
      return new APIError('Referenced record not found', 400, 'FOREIGN_KEY_VIOLATION')
    }
    return new APIError(error.message || 'Database error', 500, 'DATABASE_ERROR')
  },

  /**
   * Handle OpenAI API errors
   */
  handleOpenAIError(error) {
    if (error.status === 401) {
      return new APIError('Invalid API key', 401, 'INVALID_API_KEY')
    }
    if (error.status === 429) {
      return new APIError('Rate limit exceeded', 429, 'RATE_LIMIT')
    }
    if (error.status === 400) {
      return new APIError('Invalid request to AI service', 400, 'INVALID_REQUEST')
    }
    return new APIError('AI service error', 500, 'AI_SERVICE_ERROR')
  },

  /**
   * Handle Stripe errors
   */
  handleStripeError(error) {
    switch (error.type) {
      case 'card_error':
        return new APIError(error.message, 400, 'CARD_ERROR')
      case 'rate_limit_error':
        return new APIError('Too many requests', 429, 'RATE_LIMIT')
      case 'invalid_request_error':
        return new APIError('Invalid request', 400, 'INVALID_REQUEST')
      case 'api_error':
        return new APIError('Payment service error', 500, 'PAYMENT_ERROR')
      case 'api_connection_error':
        return new APIError('Payment service unavailable', 503, 'SERVICE_UNAVAILABLE')
      case 'authentication_error':
        return new APIError('Payment authentication failed', 401, 'AUTH_ERROR')
      default:
        return new APIError('Payment processing error', 500, 'PAYMENT_ERROR')
    }
  },

  /**
   * Get user-friendly error message
   */
  getUserMessage(error) {
    const messages = {
      // API Errors
      'NOT_FOUND': 'The requested item could not be found.',
      'DUPLICATE': 'This item already exists.',
      'FOREIGN_KEY_VIOLATION': 'Cannot complete action due to related data.',
      'DATABASE_ERROR': 'A database error occurred. Please try again.',
      
      // Auth Errors
      'AUTH_ERROR': 'Authentication failed. Please log in again.',
      'INVALID_CREDENTIALS': 'Invalid email or password.',
      'USER_NOT_FOUND': 'User account not found.',
      
      // AI Service Errors
      'INVALID_API_KEY': 'AI service configuration error. Please contact support.',
      'RATE_LIMIT': 'Too many requests. Please wait a moment and try again.',
      'AI_SERVICE_ERROR': 'AI service is temporarily unavailable.',
      
      // Payment Errors
      'CARD_ERROR': 'There was an issue with your payment method.',
      'PAYMENT_ERROR': 'Payment processing failed. Please try again.',
      'SERVICE_UNAVAILABLE': 'Payment service is temporarily unavailable.',
      
      // Subscription Errors
      'SUBSCRIPTION_LIMIT': 'You have reached your subscription limit.',
      'UPGRADE_REQUIRED': 'Please upgrade your subscription to continue.',
      
      // Validation Errors
      'VALIDATION_ERROR': 'Please check your input and try again.',
      'REQUIRED_FIELD': 'This field is required.',
      'INVALID_FORMAT': 'Please enter a valid format.',
      
      // Default
      'UNKNOWN_ERROR': 'An unexpected error occurred. Please try again.'
    }

    return messages[error.code] || messages['UNKNOWN_ERROR']
  }
}

/**
 * Async error wrapper for better error handling
 */
export const asyncHandler = (fn) => {
  return async (...args) => {
    try {
      return await fn(...args)
    } catch (error) {
      console.error('Async handler error:', error)
      
      // Handle different error types
      if (error.name === 'PostgrestError') {
        throw errorHandler.handleSupabaseError(error)
      }
      
      if (error.name === 'OpenAIError' || error.status) {
        throw errorHandler.handleOpenAIError(error)
      }
      
      if (error.type && error.type.includes('stripe')) {
        throw errorHandler.handleStripeError(error)
      }
      
      // Re-throw custom errors as-is
      if (error instanceof APIError || 
          error instanceof AuthError || 
          error instanceof ValidationError || 
          error instanceof SubscriptionError) {
        throw error
      }
      
      // Default error
      throw new APIError(error.message || 'An unexpected error occurred')
    }
  }
}

/**
 * Validation utilities
 */
export const validators = {
  email(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new ValidationError('Please enter a valid email address', 'email')
    }
  },

  required(value, fieldName) {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      throw new ValidationError(`${fieldName} is required`, fieldName)
    }
  },

  minLength(value, min, fieldName) {
    if (value && value.length < min) {
      throw new ValidationError(`${fieldName} must be at least ${min} characters`, fieldName)
    }
  },

  maxLength(value, max, fieldName) {
    if (value && value.length > max) {
      throw new ValidationError(`${fieldName} must be no more than ${max} characters`, fieldName)
    }
  },

  url(url, fieldName = 'URL') {
    try {
      new URL(url)
    } catch {
      throw new ValidationError(`Please enter a valid ${fieldName}`, fieldName)
    }
  }
}
