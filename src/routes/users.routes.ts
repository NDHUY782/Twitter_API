import { error } from 'console'
import { Router, Application, Request, Response, NextFunction } from 'express'
import { loginController, logoutController, registerController } from '~/controllers/user.controller'
import {
  accessTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middleware/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'
import { validate } from '~/utils/validation'

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

export default userRouter
