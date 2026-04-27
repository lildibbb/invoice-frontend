import type { UseFormSetError, FieldValues, Path } from 'react-hook-form';
import { toast } from 'sonner';

/**
 * Handle API error responses and map them to form field errors.
 * Backend returns 422 errors with { message: string, errors?: Record<string, string[]> }
 * or { message: string, statusCode: number }
 */
export function handleFormError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fallbackMessage = 'An error occurred'
) {
  const err = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } }; message?: string };
  
  // Handle field-level validation errors from backend (422)
  const errors = err?.response?.data?.errors;
  if (errors && typeof errors === 'object') {
    Object.entries(errors).forEach(([field, messages]) => {
      if (Array.isArray(messages) && messages.length > 0) {
        setError(field as Path<T>, {
          type: 'server',
          message: messages[0],
        });
      }
    });
    toast.error('Please fix the validation errors');
    return;
  }

  // Handle general error message
  const message = err?.response?.data?.message || err?.message || fallbackMessage;
  toast.error(message);
}
