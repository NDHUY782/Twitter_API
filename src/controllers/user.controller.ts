import { Request, RequestHandler, Response } from 'express'
import User from '~/models/schemas/Users.Schema'
import databaseService from '~/services/database.service'
import userService from '~/services/users.service'
import { NextFunction, ParamsDictionary } from 'express-serve-static-core'
import {
  ChangePasswordReqBody,
  FollowReqBody,
  ForgotPasswordReqBody,
  GetProfileReqParams,
  LoginReqBody,
  LogoutReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
  TokenPayload,
  UnFollowReqParams,
  UpdateMeReqBody,
  VerifyEmailReqBody,
  VerifyForgotPasswordReqBody
} from '~/models/requests/User.requests'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { UserVerifyStatus } from '~/constants/enums'

export const loginController = async (
  req: Request<ParamsDictionary, any, LoginReqBody>,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as User
  const user_id = user._id as ObjectId

  const result = await userService.login({ user_id: user_id.toString(), verify: user.verify })
  return res.status(200).json({
    msg: 'Login Success',
    data: result
  })
}
export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await userService.register(req.body)
  if (!result) {
    return res.status(400).json({
      error: 'Register fail'
    })
  }
  return res.json({
    msg: 'Register Success',
    data: result
  })
}
export const logoutController = async (
  req: Request<ParamsDictionary, any, LogoutReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { refresh_token } = req.body
  const result = await userService.logout(refresh_token)
  return res.json({
    result
  })
}
export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { refresh_token } = req.body
  const { user_id, verify, exp } = req.decoded_refresh_token as TokenPayload
  const result = await userService.refreshToken({ user_id, verify, refresh_token, exp })
  return res.json({
    msg: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS,
    data: result
  })
}
export const emailVerifyController = async (
  req: Request<ParamsDictionary, any, VerifyEmailReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id)
  })
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      msg: USERS_MESSAGES.USER_NOT_FOUND
    })
  }
  if (user.email_verify_token == null) {
    return res.json({
      msg: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  const result = await userService.verifyEmail(user_id)
  return res.json({
    msg: 'Email verified successfully',
    result
  })
}
export const resendEmailVerifyController = async (
  req: Request<ParamsDictionary, any, VerifyEmailReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    return res.json({
      msg: USERS_MESSAGES.USER_NOT_FOUND
    })
  }
  if (user.verify == UserVerifyStatus.Verified) {
    return res.json({
      msg: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED
    })
  }
  const result = await userService.resendVerifyEmail(user_id)
  return res.json(result)
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { _id, verify } = req.user as User
  // const email = req.body
  // const user = await databaseService.users.findOne({
  //   email: email
  // })
  // console.log(user)
  // if (!user) {
  //   return res.status(HTTP_STATUS.NOT_FOUND).json({
  //     msg: USERS_MESSAGES.USER_NOT_FOUND
  //   })
  // }
  const result = await userService.forgotPassword({ user_id: (_id as ObjectId).toString(), verify })

  return res.json({
    msg: 'Hãy Kiểm Tra Mail Của Bạn Và Đổi Password Của Bạn',
    result
  })
}
export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  return res.json({
    msg: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_SUCCESS
  })
}
export const getMyProfileController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await userService.getMe(user_id)
  return res.json({ result })
}
export const updateMeController = async (
  req: Request<ParamsDictionary, any, UpdateMeReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { body } = req
  console.log(body)
  const user = await userService.updateMe(user_id, body)
  return res.json({
    msg: USERS_MESSAGES.UPDATE_ME_SUCCESS,
    user
  })
}

export const getUserProfileController = async (
  req: Request<GetProfileReqParams>,
  res: Response,
  next: NextFunction
) => {
  const username = req.params.username
  const user = await userService.getUserProfile(username)
  return res.json({
    msg: USERS_MESSAGES.GET_USER_PROFILE_SUCCESS,
    user
  })
}

export const followUserController = async (
  req: Request<ParamsDictionary, any, FollowReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { followed_user_id } = req.body
  const result = await userService.followUser(user_id, followed_user_id)
  return res.json({
    // message: USERS_MESSAGES.FOLLOW_SUCCESS,
    result
  })
}
export const unFollowUserController = async (req: Request<UnFollowReqParams>, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { user_id: followed_user_id } = req.params
  const result = await userService.unFollowUser(user_id, followed_user_id)
  return res.json({
    result
  })
}
export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { password } = req.body
  const result = await userService.changePassword(user_id, password)
  return res.json(result)
}
