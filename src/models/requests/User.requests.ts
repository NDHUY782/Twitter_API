import { JwtPayload } from 'jsonwebtoken'
import { ppid } from 'process'
import { TokenType } from '~/constants/enums'
import { ParamsDictionary } from 'express-serve-static-core'
export interface UpdateMeReqBody {
  name: string
  date_of_birth?: string
  avatar?: string
  bio?: string
  location?: string
  website?: string
  username?: string
  cover_photo?: string
}
export interface RegisterReqBody {
  name: string
  email: string
  password: string
  confirmPassword: string
  date_of_birth: string
}
export interface LoginReqBody {
  email: string
  password: string
}
export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
}

export interface LogoutReqBody {
  refresh_token: string
}
export interface VerifyEmailReqBody {
  email_verify_token: string
}
export interface ForgotPasswordReqBody {
  email: string
}
export interface VerifyForgotPasswordReqBody {
  forgot_password_token: string
}
export interface GetProfileReqParams extends ParamsDictionary {
  username: string
}
export interface FollowReqBody {
  followed_user_id: string
}
export interface UnFollowReqParams extends ParamsDictionary {
  user_id: string
}
