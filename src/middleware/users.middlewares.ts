import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { ErrorWithStatus } from '~/models/Errors'
import userService from '~/services/users.service'
import { validate } from '~/utils/validation'

export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: ' Missing email or password' })
  }
  next()
}
export const registerValidator = validate(
  checkSchema({
    name: {
      isString: true,
      notEmpty: true,
      isLength: {
        options: { min: 1, max: 100 }
      },
      trim: true
    },
    email: {
      isEmail: true,
      notEmpty: true,
      trim: true,
      custom: {
        options: async (value) => {
          const existEmail = await userService.checkEmailExist(value)
          if (existEmail) {
            throw new Error('Email is exist')
            // throw new ErrorWithStatus({ message: 'Email already exist', status: 400 })
          }
        }
      }
    },
    password: {
      notEmpty: true,
      isString: true,
      isLength: {
        options: {
          min: 5,
          max: 50
        }
      },
      trim: true,
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage:
          'Password  must be at least 6 character long and contain at least 1 lowerCase, upperCase, 1 num, and 1 symbol'
      }
    },
    confirm_password: {
      notEmpty: true,
      isString: true,
      isLength: {
        options: {
          min: 5,
          max: 50
        }
      },
      trim: true,
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage:
          'Password  must be at least 6 character long and contain at least 1 lowerCase, upperCase, 1 num, and 1 symbol'
      },
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error('Password confirm dose not match password')
          }
          return true
        }
      }
    },
    date_of_birth: {
      isISO8601: {
        options: {
          strict: true,
          strictSeparator: true
        }
      }
    }
  })
)
