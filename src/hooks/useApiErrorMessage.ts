import { ApiError } from '../services';

/**
 * Turns any thrown value into something worth showing a person. Validation
 * failures list the offending fields rather than a generic "invalid input".
 */
export function useApiErrorMessage() {
  return (error: unknown, fallback = 'Something went wrong. Please try again.'): string => {
    if (error instanceof ApiError) {
      const issues = error.fieldIssues;
      if (issues.length > 0) {
        return issues.map((issue) => `${issue.path}: ${issue.message}`).join(' · ');
      }
      return error.message;
    }
    if (error instanceof Error) return error.message;
    return fallback;
  };
}

export function describeApiError(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (error instanceof ApiError) {
    const issues = error.fieldIssues;
    if (issues.length > 0) return issues.map((issue) => `${issue.path}: ${issue.message}`).join(' · ');
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
