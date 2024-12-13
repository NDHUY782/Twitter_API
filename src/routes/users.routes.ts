import { error } from 'console'
import { Router, Application, Request, Response, NextFunction } from 'express'
import { loginController, registerController } from '~/controllers/user.controller'
import { loginValidator, registerValidator } from '~/middleware/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'
import { validate } from '~/utils/validation'

const userRouter = Router()

userRouter.post('/login', loginValidator, loginController)

/**
 * Description: Register new user
 * path: /register
 * method: post
 * body: {name: string, email: string, pass: string, confirm_pass: string , date of birth: ISO,  }
 */
userRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

export default userRouter
