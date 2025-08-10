import type { ValidationRule } from '../types';

function validateNotEmpty(value: unknown): string | null {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return 'This field is required';
  }
  return null;
}

function validateMinLength(value: unknown, min: number): string | null {
  if (typeof value === 'string' && value.length < min) {
    return `Minimum length is ${min}`;
  }
  return null;
}

function validateMaxLength(value: unknown, max: number): string | null {
  if (typeof value === 'string' && value.length > max) {
    return `Maximum length is ${max}`;
  }
  return null;
}

function validateEmail(value: unknown): string | null {
  if (typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Invalid email format';
  }
  return null;
}

function validatePassword(value: unknown, minLen: number, requireNumber: boolean): string | null {
  if (typeof value !== 'string' || value.length < minLen) {
    return `Password must be at least ${minLen} characters`;
  }
  if (requireNumber && !/\d/.test(value)) {
    return 'Password must contain a number';
  }
  return null;
}

export function validateField(rules: ValidationRule[], value: unknown): string | null {
  for (const rule of rules) {
    switch (rule.type) {
      case 'notEmpty':
        return validateNotEmpty(value) || null;
      case 'minLength':
        return validateMinLength(value, rule.value) || null;
      case 'maxLength':
        return validateMaxLength(value, rule.value) || null;
      case 'email':
        return validateEmail(value) || null;
      case 'password':
        return validatePassword(value, rule.minLen, rule.requireNumber) || null;
    }
  }
  return null;
}
