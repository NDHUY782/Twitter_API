import { Request, Response, NextFunction, RequestHandler } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import * as core from 'express-serve-static-core'
// type Func = (req: Request, res: Response, next: NextFunction) => Promise<void>

export const wrapRequest = (func: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    /** cách 1 */
    // Promise.resolve(func(req, res, next)).catch(next)
    /**cách 2 */
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

export const wrapAsync = <T extends Request, U extends Response>(
  fn: (req: T, res: U, next: NextFunction) => Promise<Response<any, Record<string, any>>>
) => {
  return (req: T, res: U, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

//------------ĐỂ DÀNH ĐỂ TEST NẾU BỊ LỖI----------------
// export const wrapRequestHandler = <P = ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = core.Query>(
//   func: RequestHandler<P, ResBody, ReqBody, ReqQuery>
// ) => {
//   return async (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       await func(req, res, next)
//     } catch (error) {
//       next(error)
//     }
//   }
// }
export const wrapRequestHandler = <P>(func: RequestHandler<P, any, any, any>) => {
  return async (req: Request<P>, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
