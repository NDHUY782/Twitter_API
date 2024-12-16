import { config } from 'dotenv'
import { ObjectId } from 'mongodb'
import { TokenType } from '~/constants/enums'
import { USERS_MESSAGES } from '~/constants/messages'
import { LoginReqBody, RegisterReqBody } from '~/models/requests/User.requests'
import RefreshToken from '~/models/schemas/RefreshToken.Schema'
import User from '~/models/schemas/Users.Schema'
import databaseService from '~/services/database.service'
import { comparePassword, hashPassword } from '~/utils/crypto'
import { signRefreshToken, signToken } from '~/utils/jwt'

config()
class UserService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken
      },
      options: {
        expiresIn: process.env.JWT_SECRET_EXPIRES_IN
      }
    })
  }
  private signRefreshToken(user_id: string) {
    return signRefreshToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken
      },
      options: {
        expiresIn: process.env.JWT_SECRET_REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }

  private signAccessAndRefreshToken(user_id: string) {
    return Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
  }
  async login(user_id: string) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )
    return {
      access_token,
      refresh_token
    }
  }
  async register(payload: RegisterReqBody) {
    const { email, password } = payload
    /** cách 1: dùng chung check email exist cùng chung api register còn cách 2 là dùng custom trong middleware schema và tạo api check email exist */

    // const existEmail = await databaseService.users.findOne({
    //   email: email
    // })
    // if (existEmail) {
    //   return false
    // }

    /**---------------------------------------------------------------------------- */
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        data_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )

    const user_id = result.insertedId.toString()
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
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
}

const userService = new UserService()
export default userService
