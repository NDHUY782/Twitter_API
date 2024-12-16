import dotenv from 'dotenv'
import { Db, MongoClient, Collection, ServerApiVersion } from 'mongodb'
import RefreshToken from '~/models/schemas/RefreshToken.Schema'
import User from '~/models/schemas/Users.Schema'

dotenv.config()

const uri = process.env.MONGO_URI
if (!uri) {
  throw new Error('MONGO_URI is not defined in the environment variables.')
}

const dbName = process.env.DB_NAME
if (!dbName) {
  throw new Error('DB_NAME is not defined in the environment variables.')
}

const usersCollectionName = process.env.DB_USERS_COLLECTION
if (!usersCollectionName) {
  throw new Error('DB_USERS_COLLECTION is not defined in the environment variables.')
}

class DatabaseService {
  private client: MongoClient
  private db: Db

  constructor() {
    this.client = new MongoClient(uri as string, {
      serverApi: ServerApiVersion.v1
    })
    this.db = this.client.db(dbName)
  }

  async connect() {
    try {
      await this.client.connect() // Kết nối tới MongoDB
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (err) {
      console.error('Failed to connect to MongoDB:', err)
      throw err
    }
  }

  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
  }
  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKEN_COLLECTION as string)
  }
}

const databaseService = new DatabaseService()
export default databaseService
