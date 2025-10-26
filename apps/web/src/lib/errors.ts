import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { logger } from './logger'

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public metadata?: Record<string, any>
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, { details })
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 'FORBIDDEN', 403)
    this.name = 'ForbiddenError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409)
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 'RATE_LIMIT', 429)
    this.name = 'RateLimitError'
  }
}

/**
 * Global error handler for API routes
 */
export async function handleApiError(error: unknown): Promise<NextResponse> {
  // Log error
  await logger.error('API Error', error)

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Invalid request data',
        code: 'VALIDATION_ERROR',
        details: error.errors,
      },
      { status: 400 }
    )
  }

  // Handle app errors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(error.metadata && { metadata: error.metadata }),
      },
      { status: error.statusCode }
    )
  }

  // Handle generic errors
  if (error instanceof Error) {
    // Don't expose internal errors in production
    const isProduction = process.env.NODE_ENV === 'production'
    
    return NextResponse.json(
      {
        error: isProduction ? 'Internal server error' : error.message,
        code: 'INTERNAL_ERROR',
        ...(isProduction ? {} : { stack: error.stack }),
      },
      { status: 500 }
    )
  }

  // Unknown error
  return NextResponse.json(
    {
      error: 'Unknown error occurred',
      code: 'UNKNOWN_ERROR',
    },
    { status: 500 }
  )
}

/**
 * Async error wrapper for API route handlers
 */
export function withErrorHandler<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args)
    } catch (error) {
      return await handleApiError(error)
    }
  }) as T
}

/**
 * Assert condition or throw error
 */
export function assert(condition: boolean, error: AppError): asserts condition {
  if (!condition) {
    throw error
  }
}

/**
 * Assert value exists or throw NotFoundError
 */
export function assertExists<T>(
  value: T | null | undefined,
  resource: string
): asserts value is T {
  if (value == null) {
    throw new NotFoundError(resource)
  }
}

