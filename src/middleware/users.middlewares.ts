import { NextFunction, Request } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { ppid } from 'process'
import { UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { REGEX_USERNAME } from '~/constants/regex'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/User.requests'
import databaseService from '~/services/database.service'
import userService from '~/services/users.service'
import { hashPassword } from '~/utils/crypto'
import { verifyEmailToken, verifyForgotPasswordToken, verifyRefreshToken, verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

const nameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.NAME_MUST_BE_A_STRING
  },
  isLength: {
    options: { min: 1, max: 100 },
    errorMessage: USERS_MESSAGES.NAME_LENGTH
  },
  trim: true
}
const dateOfBirthSchema: ParamSchema = {
  isISO8601: {
    options: {
      strict: true,
      strictSeparator: true
    },
    errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_MUST_ISO8601
  }
}

const imageSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: USERS_MESSAGES.IMAGE_URL_MUST_BE_STRING
  },
  trim: true,
  isLength: {
    options: { min: 1, max: 450 },
    errorMessage: USERS_MESSAGES.IMAGE_URL_LENGTH
  }
}

const userIdSchema: ParamSchema = {
  custom: {
    options: async (value: string, { req }) => {
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.INVALID_USER_ID,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      const followed_user = await databaseService.users.findOne({
        _id: new ObjectId(value)
      })
      if (followed_user == null) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.USER_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
    }
  }
}

const passwordSchema: ParamSchema = {
  notEmpty: { errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED },
  isString: { errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING },
  isLength: {
    options: {
      min: 5,
      max: 50
    },
    errorMessage: USERS_MESSAGES.PASSWORD_LENGTH
  },
  trim: true,
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
  }
}
const confirmPasswordSchema: ParamSchema = {
  notEmpty: { errorMessage: USERS_MESSAGES.PASSWORD_CONFIRMATION_IS_REQUIRED },
  isString: { errorMessage: USERS_MESSAGES.PASSWORD_CONFIRMATION_MUST_BE_A_STRING },
  isLength: {
    options: {
      min: 5,
      max: 50
    },
    errorMessage: USERS_MESSAGES.PASSWORD_CONFIRMATION_LENGTH
  },
  trim: true,
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: USERS_MESSAGES.PASSWORD_CONFIRMATION_MUST_BE_STRONG
  },
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(USERS_MESSAGES.PASSWORD_CONFIRMATION_MUST_MATCH)
      }
      return true
    }
  }
}
export const loginValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              email: value,
              password: hashPassword(req.body.password)
            })
            if (!user) {
              throw new Error(USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT)
            }
            req.user = user
            return true
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
          },
          errorMessage: USERS_MESSAGES.PASSWORD_LENGTH
        },
        trim: true,
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
        }
      }
    },
    ['body']
  )
)
export const registerValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      email: {
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        trim: true,
        custom: {
          options: async (value) => {
            const existEmail = await userService.checkEmailExist(value)
            if (existEmail) {
              throw new Error(USERS_MESSAGES.EMAIL_ALREADY_EXIST)
              // throw new ErrorWithStatus({ message: 'Email already exist', status: 400 })
            }
          }
        }
      },
      password: {
        notEmpty: { errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED },
        isString: { errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING },
        isLength: {
          options: {
            min: 5,
            max: 50
          },
          errorMessage: USERS_MESSAGES.PASSWORD_LENGTH
        },
        trim: true,
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
        }
      },
      confirm_password: {
        notEmpty: { errorMessage: USERS_MESSAGES.PASSWORD_CONFIRMATION_IS_REQUIRED },
        isString: { errorMessage: USERS_MESSAGES.PASSWORD_CONFIRMATION_MUST_BE_A_STRING },
        isLength: {
          options: {
            min: 5,
            max: 50
          },
          errorMessage: USERS_MESSAGES.PASSWORD_CONFIRMATION_LENGTH
        },
        trim: true,
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: USERS_MESSAGES.PASSWORD_CONFIRMATION_MUST_BE_STRONG
        },
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new Error(USERS_MESSAGES.PASSWORD_CONFIRMATION_MUST_MATCH)
            }
            return true
          }
        }
      },
      date_of_birth: dateOfBirthSchema
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        notEmpty: { errorMessage: USERS_MESSAGES.AUTHORIZATION_HEADER_IS_REQUIRED },
        custom: {
          options: async (value: string, { req }) => {
            const access_token = value.split(' ')[1]
            if (!access_token) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.AUTHORIZATION_HEADER_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decoded_authorization = await verifyToken({ token: access_token })
              ;(req as Request).decoded_authorization = decoded_authorization
            } catch (error) {
              throw new ErrorWithStatus({
                message: (error as JsonWebTokenError).message,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            return true
          }
        }
      }
    },
    ['headers']
  )
)
export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        notEmpty: { errorMessage: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED },
        custom: {
          options: async (value: string, { req }) => {
            try {
              const [decoded_refresh_token, refresh_token] = await Promise.all([
                verifyRefreshToken({ token: value }),
                databaseService.refreshTokens.findOne({ token: value })
              ])
              if (refresh_token == null) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.USED_REFRESH_TOKEN_OR_NOT_EXIST,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              ;(req as Request).decoded_refresh_token = decoded_refresh_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                new ErrorWithStatus({
                  message: error.message,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)
export const verifyEmailTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        notEmpty: { errorMessage: USERS_MESSAGES.AUTHORIZATION_HEADER_IS_REQUIRED },
        custom: {
          options: async (value: string, { req }) => {
            try {
              const [decoded_email_verify_token, email_verify_token] = await Promise.all([
                verifyEmailToken({ token: value }),
                databaseService.users.findOne({ email_verify_token: value })
              ])
              console.log(decoded_email_verify_token)
              if (email_verify_token == null) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.USED_REFRESH_TOKEN_OR_NOT_EXIST,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              ;(req as Request).decoded_email_verify_token = decoded_email_verify_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                new ErrorWithStatus({
                  message: error.message,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)
export const forgotPasswordTokenValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              email: value
            })
            if (!user) {
              throw new Error(USERS_MESSAGES.USER_NOT_FOUND)
            }
            req.user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)
export const verifyForgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRE,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decoded_forgot_password_token = await verifyToken({
                token: value,
                secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
              })
              const { user_id } = decoded_forgot_password_token
              const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

              if (user == null) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.USER_NOT_FOUND,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              if (user.forgot_password_token != value) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.INVALID_FORGOT_PASSWORD_TOKEN,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                new ErrorWithStatus({
                  message: error.message,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)
export const verifiedUserValidator = async (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decoded_authorization as TokenPayload
  if (verify !== UserVerifyStatus.Verified) {
    return next(
      new ErrorWithStatus({
        message: USERS_MESSAGES.USER_IS_NOT_VERIFIED,
        status: HTTP_STATUS.FORBIDDEN
      })
    )
  }
  next()
}
export const updateMeValidator = validate(
  checkSchema(
    {
      name: {
        ...nameSchema,
        optional: true,
        notEmpty: undefined
      },
      date_of_birth: {
        ...dateOfBirthSchema,
        optional: true
      },
      bio: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.BIO_SHOULD_BE_A_STRING
        },
        trim: true,
        isLength: {
          options: { min: 1, max: 200 },
          errorMessage: USERS_MESSAGES.BIO_LENGTH
        }
      },
      location: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.LOCATION_SHOULD_BE_A_STRING
        },
        trim: true,
        isLength: {
          options: { min: 1, max: 200 },
          errorMessage: USERS_MESSAGES.LOCATION_LENGTH
        }
      },
      website: {
        optional: true,

        isString: {
          errorMessage: USERS_MESSAGES.WEBSITE_SHOULD_BE_A_STRING
        },
        trim: true,
        isLength: {
          options: { min: 1, max: 200 },
          errorMessage: USERS_MESSAGES.WEBSITE_LENGTH
        }
      },
      username: {
        optional: true,

        isString: {
          errorMessage: USERS_MESSAGES.USERNAME_SHOULD_BE_A_STRING
        },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!REGEX_USERNAME.test(value)) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.USERNAME_INVALID,
                status: 400
              })
            }
            const user = await databaseService.users.findOne({ username: value })
            if (user) {
              throw new Error(USERS_MESSAGES.USERNAME_EXIST)
            }
          }
        }
      },
      avatar: imageSchema,
      cover_photo: imageSchema
    },
    ['body']
  )
)
export const followValidator = validate(
  checkSchema(
    {
      followed_user_id: userIdSchema
    },
    ['body']
  )
)
export const unFollowValidator = validate(
  checkSchema(
    {
      user_id: userIdSchema
    },
    ['params']
  )
)
export const changePasswordValidator = validate(
  checkSchema(
    {
      old_password: {
        ...passwordSchema,
        custom: {
          options: async (value: string, { req }) => {
            const { user_id } = (req as Request).decoded_email_verify_token as TokenPayload
            const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
            if (!user) {
              throw new Error(USERS_MESSAGES.USER_NOT_FOUND)
            }
            const { password } = user
            const isMatchPassword = hashPassword(value) === password
            if (!isMatchPassword) {
              throw new ErrorWithStatus({ status: 401, message: USERS_MESSAGES.OLD_PASSWORD_NOT_MATCH })
            }
          }
        }
      },
      new_password: passwordSchema,
      confirm_new_password: confirmPasswordSchema
    },
    ['body']
  )
)
