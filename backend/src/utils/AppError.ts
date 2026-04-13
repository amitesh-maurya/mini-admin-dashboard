/**
 * AppError — operational errors with a known HTTP status code.
 * Differentiates from unexpected programming errors (unhandled exceptions).
 * Usage: throw new AppError('Email already exists', 409);
 */
export class AppError extends Error {
  public readonly statusCode: number;
  /** Operational errors are expected; programming errors are not */
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    // Restore correct prototype chain for `instanceof` checks
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
