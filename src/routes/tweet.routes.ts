import { Router, Application, Request, Response, NextFunction } from 'express'
import { createTweetController } from '~/controllers/tweet.controller'
import {
  loginController,
  logoutController,
  registerController,
  emailVerifyController,
  resendEmailVerifyController,
  forgotPasswordController,
  verifyForgotPasswordController,
  getMyProfileController,
  updateMeController,
  getUserProfileController,
  followUserController,
  unFollowUserController,
  changePasswordController,
  refreshTokenController
} from '~/controllers/user.controller'
import { filterMiddlewares } from '~/middleware/common.middlewares'
import {
  accessTokenValidator,
  changePasswordValidator,
  followValidator,
  forgotPasswordTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  unFollowValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyEmailTokenValidator,
  verifyForgotPasswordTokenValidator
} from '~/middleware/users.middlewares'
import { UnFollowReqParams, UpdateMeReqBody } from '~/models/requests/User.requests'
import { wrapAsync, wrapRequestHandler, wrapRequest } from '~/utils/handlers'

const tweetsRouter = Router()
/**
 * Description: Create new tweet
 * Path: /create
 * Method: POST
 * Body: TweetReqBody
 */

tweetsRouter.post('/create', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(createTweetController))

export default tweetsRouter
