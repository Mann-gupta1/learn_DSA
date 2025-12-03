/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate code syntax (basic check)
 */
export function validateCode(code: string, language: 'python' | 'cpp' | 'javascript'): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!code.trim()) {
    errors.push('Code cannot be empty');
    return { valid: false, errors };
  }

  // Basic validation
  if (language === 'python') {
    if (code.includes('```')) {
      errors.push('Remove markdown code fences');
    }
  } else if (language === 'cpp') {
    if (!code.includes('#include') && !code.includes('using namespace')) {
      // Not a strict requirement, but helpful
    }
  } else if (language === 'javascript') {
    // Basic JS validation
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

