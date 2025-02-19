import { verify } from 'crypto'
import { config } from 'dotenv'
import { update } from 'lodash'
import { ObjectId } from 'mongodb'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { TweetReqBody } from '~/models/requests/Tweet.requests'
import { LoginReqBody, RegisterReqBody, UpdateMeReqBody } from '~/models/requests/User.requests'
import Follower from '~/models/schemas/Followers.Schema'
import RefreshToken from '~/models/schemas/RefreshToken.Schema'
import Tweet from '~/models/schemas/Tweet.schema'
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
class TweetService {
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

  // async register(payload: RegisterReqBody) {
  //   const { email, password } = payload
  //   /** cách 1: dùng chung check email exist cùng chung api register còn cách 2 là dùng custom trong middleware schema và tạo api check email exist */

  //   // const existEmail = await databaseService.users.findOne({
  //   //   email: email
  //   // })
  //   // if (existEmail) {
  //   //   return false
  //   // }

  //   /**---------------------------------------------------------------------------- */

  //   const result = await databaseService.users.insertOne(
  //     new User({
  //       ...payload,
  //       data_of_birth: new Date(payload.date_of_birth),
  //       password: hashPassword(payload.password)
  //     })
  //   )

  //   const user_id = result.insertedId.toString()
  //   const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)
  //   await databaseService.refreshTokens.insertOne(
  //     new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
  //   )
  //   const email_verify_token = await this.signEmailVerifyToken({
  //     user_id: user_id.toString(),
  //     verify: UserVerifyStatus.Unverified
  //   })
  //   console.log('email verify token là: ', email_verify_token)
  //   // Cập nhật email_verify_token cho người dùng
  //   await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, { $set: { email_verify_token } })
  //   return {
  //     access_token,
  //     refresh_token
  //   }
  // }
  async createTweet(payload: TweetReqBody) {
    const user_id = new ObjectId()

    // await databaseService.tweets.insertOne(
    //   new Tweet({
    //     ...payload,
    //     user_id: user_id
    //   })
    // )
  }
}

const tweetService = new TweetService()
export default tweetService
