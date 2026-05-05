import bcrypt from 'bcryptjs'

const BCRYPT_ROUNDS = 10

export async function hash(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

export async function compare(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}