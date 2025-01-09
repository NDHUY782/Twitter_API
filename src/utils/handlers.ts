import { Request, Response, NextFunction, RequestHandler } from 'express'

// export const wrapRequestHandler = (func: RequestHandler) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     /** cách 1 */
//     // Promise.resolve(func(req, res, next)).catch(next)
//     /**cách 2 */
//     try {
//       await func(req, res, next)
//     } catch (error) {
//       next(error)
//     }
//   }
// }

export const wrapRequestHandler = (func: RequestHandler): RequestHandler => {
  return async (req, res, next) => {
    try {
      const result = await func(req, res, next)
      return result // Đảm bảo trả về kết quả từ hàm controller
    } catch (error) {
      next(error)
    }
  }
}
