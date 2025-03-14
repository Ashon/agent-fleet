import { NextFunction, Request, Response } from 'express'

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message })
  }

  console.error(err)
  return res.status(500).json({ error: '서버 오류가 발생했습니다.' })
}
