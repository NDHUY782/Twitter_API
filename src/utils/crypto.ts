import { createHash } from 'crypto'
import { config } from 'dotenv'
config()
export function sha256(content: string) {
  return createHash('sha256').update(content).digest('hex')
}

export function hashPassword(password: string) {
  return sha256(password + process.env.PASSWORD_HASH)
}

export function comparePassword(inputPassword: string, storedPassword: string): boolean {
  const hashedInputPassword = hashPassword(inputPassword)

  // So sánh với mật khẩu đã lưu trong cơ sở dữ liệu
  return hashedInputPassword === storedPassword
}
