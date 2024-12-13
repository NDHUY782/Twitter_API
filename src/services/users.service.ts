import { TokenType } from '~/constants/enums'
import { RegisterReqBody } from '~/models/requests/User.requests'
import User from '~/models/schemas/Users.Schema'
import databaseService from '~/services/database.service'
import { hashPassword } from '~/utils/crypto'
import { signRefreshToken, signToken } from '~/utils/jwt'

class UserService {
  private signAccessToken(user_id: string, email: string) {
    return signToken({
      payload: {
        user_id,
        email,
        token_type: TokenType.AccessToken
      },
      options: {
        expiresIn: process.env.JWT_SECRET_EXPIRES_IN
      }
    })
  }
  private signRefreshToken(user_id: string, email: string) {
    return signRefreshToken({
      payload: {
        user_id,
        email,
        token_type: TokenType.RefreshToken
      },
      options: {
        expiresIn: process.env.JWT_SECRET_REFRESH_TOKEN_EXPIRES_IN
      }
    })
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

    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id, email),
      this.signRefreshToken(user_id, email)
    ])

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
}

const userService = new UserService()
export default userService
