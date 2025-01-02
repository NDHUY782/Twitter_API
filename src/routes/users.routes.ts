import { Router, Application, Request, Response, NextFunction } from 'express'
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
  unFollowUserController
} from '~/controllers/user.controller'
import { filterMiddlewares } from '~/middleware/common.middlewares'
import {
  accessTokenValidator,
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
import { UpdateMeReqBody } from '~/models/requests/User.requests'
import { wrapRequestHandler } from '~/utils/handlers'

const userRouter = Router()
/**
 * Description: Register new user
 * Path: /register
 * Method: POST
 * Body: {name: string, email: string, password: string, confirm_password: string , date of birth: ISO,  }
 */

userRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

/**
 * Description: Login user
 * Path: /login
 * Method: POST
 * Body: {name: string, email: string, password: string, confirm_password: string , date of birth: ISO,  }
 */

userRouter.post('/login', loginValidator, loginController)

/**
 * Description: User Log out
 * Path: /logout
 * Method: POST
 * Header: {Authorization: Bearer <access_token>}
 * Body: {refresh_token: string  }
 */
userRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

/**
 * Description: User verify email
 * Path: /verify-email
 * Method: POST
 * Body: {email_verify_token: string  }
 */
userRouter.post('/verify-email', verifyEmailTokenValidator, wrapRequestHandler(emailVerifyController))

/**
 * Description: User click to receive the new verify email
 * Path: /resend-verify-email
 * Method: POST
 * Header: {Authorization: Bearer <access_token>}
 */
userRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendEmailVerifyController))

/**
 * Description: Submit reset password link
 * Path: /forgot-password
 * Method: POST
 * Body: email
 */
userRouter.post('/forgot-password', forgotPasswordTokenValidator, wrapRequestHandler(forgotPasswordController))

/**
 * Description: Verify link in email to reset password
 * Path: /verify-forgot-password
 * Method: POST
 * Body: {forgot-password-token: string}
 */
userRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordController)
)

/**
 * Description: Get my profile
 * Path: /me
 * Method: GET
 * Header: {Authorization: Bearer <access_token>}
 */
userRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMyProfileController))

/**
 * Description: Update my profile
 * Path: /me
 * Method: PATCH
 * Header: {Authorization: Bearer <access_token>}
 */
userRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  filterMiddlewares<UpdateMeReqBody>([
    'name',
    'date_of_birth',
    'avatar',
    'bio',
    'location',
    'website',
    'username',
    'cover_photo'
  ]),
  wrapRequestHandler(updateMeController)
)

/**
 * Description: Get user profile
 * Path: /:username
 * Method: GET

 */
userRouter.get('/:username', wrapRequestHandler(getUserProfileController))

/**
 * Description: Follow someone
 * Path: /follow
 * Method: POST
 * Header: {Authorization: Bearer <access_token>}
 * Body: followed_user_id:string

 */
userRouter.post(
  '/follow',
  accessTokenValidator,
  verifiedUserValidator,
  followValidator,
  wrapRequestHandler(followUserController)
)

/**
 * Description: Unfollow someone
 * Path: /follow/:followed_user_id
 * Method: DELETE
 * Header: {Authorization: Bearer <access_token>}
 * Body: followed_user_id:string

 */
userRouter.delete(
  '/follow/:user_id',
  accessTokenValidator,
  verifiedUserValidator,
  unFollowValidator,
  wrapRequestHandler(unFollowUserController)
)

export default userRouter
