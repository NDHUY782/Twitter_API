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

const userRouter = Router()
/**
 * Description: Register new user
 * Path: /register
 * Method: POST
 * Body: {name: string, email: string, password: string, confirm_password: string , date of birth: ISO,  }
 */

userRouter.post('/register', registerValidator, wrapAsync(registerController))

/**
 * Description: Login user
 * Path: /login
 * Method: POST
 * Body: {name: string, email: string, password: string, confirm_password: string , date of birth: ISO,  }
 */

userRouter.post('/login', loginValidator, wrapAsync(loginController))

/**
 * Description: User Log out
 * Path: /logout
 * Method: POST
 * Header: {Authorization: Bearer <access_token>}
 * Body: {refresh_token: string  }
 */
userRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))
/**
 * Description: Refresh Token
 * Path: /refresh-token
 * Method: POST
 * Body: {refresh_token: string  }
 */
userRouter.post('/refresh-token', refreshTokenValidator, wrapAsync(refreshTokenController))

/**
 * Description: User verify email
 * Path: /verify-email
 * Method: POST
 * Body: {email_verify_token: string  }
 */
userRouter.post('/verify-email', verifyEmailTokenValidator, wrapAsync(emailVerifyController))

/**
 * Description: User click to receive the new verify email
 * Path: /resend-verify-email
 * Method: POST
 * Header: {Authorization: Bearer <access_token>}
 */
userRouter.post('/resend-verify-email', accessTokenValidator, wrapAsync(resendEmailVerifyController))

/**
 * Description: Submit reset password link
 * Path: /forgot-password
 * Method: POST
 * Body: email
 */
userRouter.post('/forgot-password', forgotPasswordTokenValidator, wrapAsync(forgotPasswordController))

/**
 * Description: Verify link in email to reset password
 * Path: /verify-forgot-password
 * Method: POST
 * Body: {forgot-password-token: string}
 */
userRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapAsync(verifyForgotPasswordController)
)
/**
 * Description: Change password
 * Path: /change-password
 * Method: PUT
 * Body: {old-password: string,password, confirm password: string}
 */
userRouter.post(
  '/change-password',
  accessTokenValidator,
  verifyForgotPasswordTokenValidator,
  changePasswordValidator,
  wrapAsync(changePasswordController)
)

/**
 * Description: Get my profile
 * Path: /me
 * Method: GET
 * Header: {Authorization: Bearer <access_token>}
 */
userRouter.get('/me', accessTokenValidator, wrapAsync(getMyProfileController))

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
  wrapAsync(updateMeController)
)

/**
 * Description: Get user profile
 * Path: /:username
 * Method: GET

 */
userRouter.get('/:username', wrapAsync(getUserProfileController))

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
  wrapAsync(followUserController)
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
  wrapAsync(unFollowUserController)
)

export default userRouter
