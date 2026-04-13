import { Request, Response, NextFunction } from 'express';

/**
 * asyncHandler — wraps an async route handler and forwards any
 * rejected promise to Express's next() (global error handler).
 * Eliminates try-catch boilerplate in every controller.
 *
 * Usage:
 *   router.get('/me', asyncHandler(getMe));
 */
export const asyncHandler =
  <T extends Request = Request>(
    fn: (req: T, res: Response, next: NextFunction) => Promise<void>,
  ) =>
  (req: T, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
