import { Request, Response } from 'express'
import User from '~/models/schemas/Users.Schema'
import databaseService from '~/services/database.service'
import userService from '~/services/users.service'
import { NextFunction, ParamsDictionary } from 'express-serve-static-core'
import { LogoutReqBody, RegisterReqBody } from '~/models/requests/User.requests'
import { ObjectId } from 'mongodb'

export const loginController = async (req: Request, res: Response) => {
  try {
    const user = req.user as User
    const user_id = user._id as ObjectId

    const result = await userService.login(user_id.toString())
    return res.status(200).json({
      msg: 'Login Success',
      data: result
    })
  } catch (error) {
    res.status(400).json({
      msg: 'Login failed'
    })
  }
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
export const logoutController = async (
  req: Request<ParamsDictionary, any, LogoutReqBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refresh_token } = req.body
    const result = await userService.logout(refresh_token)
    res.json({
      result
    })
  } catch (error) {
    next(error)
  }
}
