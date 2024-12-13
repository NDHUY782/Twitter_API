import { Request, Response } from 'express'
import User from '~/models/schemas/Users.Schema'
import databaseService from '~/services/database.service'
import userService from '~/services/users.service'
import { NextFunction, ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/requests/User.requests'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email === 'huy123@gmail.com' && password === '123456') {
    return res.status(200).json({ msg: 'login Successful' })
  }
  return res.status(400).json({ error: 'Login Fail' })
}
export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    // throw new Error('Lỗi rồi')
    const result = await userService.register(req.body)
    // if (!result) {
    //   // Kiểm tra nếu `result` là `false`
    //   return res.status(400).json({
    //     msg: 'Email already exists'
    //   })
    // }
    return res.status(200).json({
      msg: 'Register Success',
      data: result
    })
  } catch (error) {
    // res.status(400).json({
    //   error: 'Register fail'
    // })
    next(error)
  }
}
