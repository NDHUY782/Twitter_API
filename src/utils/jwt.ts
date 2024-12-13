import { error } from 'console'
import jwt, { SignOptions } from 'jsonwebtoken'
import { resolve } from 'path'

export const signToken = ({
  payload,
  privateKey = process.env.JWT_SECRET as string,
  options = {
    algorithm: 'HS256'
  }
}: {
  payload: string | Buffer | object
  privateKey?: string
  options?: SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (error, token) => {
      if (error) {
        return reject(error)
      }
      resolve(token as string)
    })
  })
}
export const signRefreshToken = ({
  payload,
  privateKey = process.env.JWT_SECRET_REFRESH_TOKEN as string,
  options = {
    algorithm: 'HS256'
  }
}: {
  payload: string | Buffer | object
  privateKey?: string
  options?: SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (error, token) => {
      if (error) {
        return reject(error)
      }
      resolve(token as string)
    })
  })
}
