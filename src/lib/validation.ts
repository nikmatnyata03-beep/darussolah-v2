/**
 * Input Validation Utilities
 * 
 * This module provides validation functions to sanitize and validate user input
 * to prevent SQL injection, XSS, and other security vulnerabilities.
 */

// Sanitize string input by removing potentially dangerous characters
export const sanitizeString = (input: string | undefined | null): string => {
  if (!input) return '';
  
  // Remove null bytes and trim whitespace
  let sanitized = input.replace(/\0/g, '').trim();
  
  // Limit length to prevent buffer overflow attacks
  const MAX_LENGTH = 10000;
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH);
  }
  
  return sanitized;
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Validate phone number (basic validation for Indonesian numbers)
export const isValidPhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;
  
  // Allow digits, spaces, dashes, parentheses, and plus sign
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Indonesian phone numbers: +62 or 0 followed by 9-13 digits
  const phoneRegex = /^(\+62|0)[0-9]{9,13}$/;
  return phoneRegex.test(cleaned);
};

// Validate date format (YYYY-MM-DD)
export const isValidDate = (date: string): boolean => {
  if (!date || typeof date !== 'string') return false;
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  const parsed = new Date(date);
  return !isNaN(parsed.getTime());
};

// Validate integer ID
export const isValidIntegerId = (id: any): boolean => {
  const num = parseInt(id, 10);
  return !isNaN(num) && Number.isInteger(num) && num > 0;
};

// Validate slug format
export const isValidSlug = (slug: string): boolean => {
  if (!slug || typeof slug !== 'string') return false;
  
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 100;
};

// Validate required fields in an object
export const validateRequiredFields = (
  obj: Record<string, any>,
  requiredFields: string[]
): { valid: boolean; missing: string[] } => {
  const missing = requiredFields.filter(field => {
    const value = obj[field];
    return value === undefined || value === null || value === '';
  });
  
  return {
    valid: missing.length === 0,
    missing
  };
};

// Sanitize object by applying sanitization to all string values
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
};

// Escape HTML to prevent XSS
export const escapeHtml = (unsafe: string): string => {
  if (!unsafe) return '';
  
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Validate that a value is one of allowed options
export const isInAllowedValues = (value: any, allowedValues: any[]): boolean => {
  return allowedValues.includes(value);
};
