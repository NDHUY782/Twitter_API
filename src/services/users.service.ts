import { verify } from 'crypto'
import { config } from 'dotenv'
import { update } from 'lodash'
import { ObjectId } from 'mongodb'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { LoginReqBody, RegisterReqBody, UpdateMeReqBody } from '~/models/requests/User.requests'
import Follower from '~/models/schemas/Followers.Schema'
import RefreshToken from '~/models/schemas/RefreshToken.Schema'
import User from '~/models/schemas/Users.Schema'
import databaseService from '~/services/database.service'
import { comparePassword, hashPassword } from '~/utils/crypto'
import {
  signEmailVerifyToken,
  signForgotPasswordToken,
  signRefreshToken,
  signToken,
  verifyRefreshToken
} from '~/utils/jwt'

config()
class UserService {
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
        verify
      },
      options: {
        expiresIn: process.env.JWT_SECRET_EXPIRES_IN
      }
    })
  }
  private signRefreshToken({ user_id, verify, exp }: { user_id: string; verify: UserVerifyStatus; exp?: number }) {
    if (exp) {
      return signRefreshToken({
        payload: {
          user_id,
          token_type: TokenType.RefreshToken,
          verify,
          exp
        }
      })
    }
    return signRefreshToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
        verify
      },
      options: {
        expiresIn: process.env.JWT_SECRET_REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }
  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signEmailVerifyToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN,
      options: {
        expiresIn: process.env.JWT_SECRET_REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }
  private signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signForgotPasswordToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN,
      options: {
        expiresIn: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN_EXPIRES_IN
      }
    })
  }

  private signAccessAndRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })])
  }

  private decodeRefreshToken(refresh_token: string) {
    return verifyRefreshToken({
      token: refresh_token,
      secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
    })
  }

  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        username: payload.username,
        email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password),
        verify: UserVerifyStatus.Verified
      })
    )
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    const { exp, iat } = await this.decodeRefreshToken(refresh_token)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token, exp, iat })
    )
    console.log('token verify email la:', email_verify_token)
    return {
      access_token,
      refresh_token
    }
  }

  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id,
      verify
    })
    const { exp, iat } = await this.decodeRefreshToken(refresh_token)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token, exp, iat })
    )
    return {
      access_token,
      refresh_token
    }
  }
  async checkEmailExist(email: string) {
    const existEmail = await databaseService.users.findOne({ email })
    return Boolean(existEmail)
    // if (existEmail) {
    //   return false
    // }
  }
  async logout(refresh_token: string) {
    const result = await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return {
      message: USERS_MESSAGES.LOGOUT_SUCCESS,
      data: result
    }
  }

  async refreshToken({
    user_id,
    verify,
    refresh_token,
    exp
  }: {
    user_id: string
    verify: UserVerifyStatus
    refresh_token: string
    exp: number
  }) {
    const [new_access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken({ user_id, verify }),
      this.signRefreshToken({ user_id, verify, exp }),
      databaseService.refreshTokens.deleteOne({ token: refresh_token })
    ])
    const decode_refresh_token = await this.decodeRefreshToken(new_refresh_token)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: new_refresh_token,
        exp: decode_refresh_token.exp,
        iat: decode_refresh_token.iat
      })
    )
    return {
      access_token: new_access_token,
      refresh_token: new_refresh_token
    }
  }

  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      this.signAccessAndRefreshToken({
        user_id: user_id.toString(),
        verify: UserVerifyStatus.Verified
      }),
      databaseService.users.updateOne(
        { _id: new ObjectId(user_id) },
        {
          $set: {
            email_verify_token: '', // Xóa token xác thực email
            verify: UserVerifyStatus.Verified // Cập nhật trạng thái xác minh
          },
          $currentDate: {
            updated_at: true // Cập nhật thời gian sửa đổi
          }
        }
      )
    ])
    const [access_token, refresh_token] = token
    const { exp, iat } = await this.decodeRefreshToken(refresh_token)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token, exp, iat })
    )
    return { access_token, refresh_token }
  }
  async resendVerifyEmail(user_id: string) {
    // const [token] = await Promise.all([
    //   this.signEmailVerifyToken(user_id),
    //   databaseService.users.updateOne(
    //     { _id: new ObjectId(user_id) },
    //     {
    //       $set: {
    //         email_verify_token: '', // Xóa token xác thực email
    //         verify: UserVerifyStatus.Verified // Cập nhật trạng thái xác minh
    //       },
    //       $currentDate: {
    //         updated_at: true // Cập nhật thời gian sửa đổi
    //       }
    //     }
    //   )
    // ])
    // const [access_token, refresh_token] = token
    // return { access_token, refresh_token }
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    console.log('email verify token là: ', email_verify_token)

    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          email_verify_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      msg: USERS_MESSAGES.RESEND_EMAIL_VERIFY_SUCCESS
    }
  }
  async forgotPassword({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const forgot_password_token = await this.signForgotPasswordToken({
      user_id,
      verify
    })
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          forgot_password_token: forgot_password_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    //Gửi mail kèm đưuòng link đến email người dùng: .../forgot-password?token=token
    console.log('forgot pass token: ', forgot_password_token)
    return {
      msg: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
    }
  }
  async getMe(user_id: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }
    return user
  }

  async updateMe(user_id: string, payload: UpdateMeReqBody) {
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload
    const user = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      {
        $set: { ...(_payload as UpdateMeReqBody & { date_of_birth?: Date }) },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user
  }
  async getUserProfile(username: string) {
    const user = await databaseService.users.findOne(
      { username },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user
  }
  async followUser(user_id: string, followed_user_id: string) {
    const follow = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    if (follow === null) {
      const data = await databaseService.followers.insertOne(
        new Follower({
          user_id: new ObjectId(user_id),
          followed_user_id: new ObjectId(followed_user_id)
        })
      )
      return {
        msg: USERS_MESSAGES.FOLLOW_SUCCESS,
        data: data
      }
    }
    return {
      msg: USERS_MESSAGES.ALREADY_FOLLOWED
    }
  }
  async unFollowUser(user_id: string, followed_user_id: string) {
    const follow = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    if (follow === null) {
      return {
        msg: USERS_MESSAGES.ALREADY_UNFOLLOW_SUCCESS
      }
    }
    const data = await databaseService.followers.deleteOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    return {
      msg: USERS_MESSAGES.UNFOLLOW_SUCCESS,
      data
    }
  }
  async changePassword(user_id: string, new_password: string) {
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          password: hashPassword(new_password)
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      msg: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESS
    }
  }
  async addUsersToTwitterCircle(user_id: string, added_user_ids: string[]) {
    const ownerOid = new ObjectId(user_id)
    const user_ids = added_user_ids.map((id) => new ObjectId(id))

    const result = await databaseService.users.updateOne(
      { _id: ownerOid },
      {
        $addToSet: { twitter_circle: { $each: user_ids } },
        $currentDate: { updated_at: true }
      }
    )

    return result
  }
}

const userService = new UserService()
export default userService
