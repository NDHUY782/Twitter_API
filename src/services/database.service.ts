import dotenv from 'dotenv'
import { union } from 'lodash'
import { Db, MongoClient, Collection, ServerApiVersion } from 'mongodb'
import Bookmark from '~/models/schemas/Bookmark.Schena'
import Follower from '~/models/schemas/Followers.Schema'
import Hashtag from '~/models/schemas/Hashtags.Schema'
import Like from '~/models/schemas/Like.Schema'
import RefreshToken from '~/models/schemas/RefreshToken.Schema'
import Tweet from '~/models/schemas/Tweet.schema'
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

  async indexUsers() {
    const exist = await this.users.indexExists(['email_1_password_1', 'email_1', 'username_1'])
    if (!exist) {
      this.users.createIndex({ email: 1, password: 1 })
      this.users.createIndex({ email: 1 }, { unique: true })
      this.users.createIndex({ username: 1 }, { unique: true })
    }
  }
  async indexRefreshTokens() {
    const exist = await this.refreshTokens.indexExists(['token_1', 'exp_1'])
    if (!exist) {
      this.refreshTokens.createIndex({ token: 1 })
      this.refreshTokens.createIndex({ exp: 1 }, { expireAfterSeconds: 0 })
    }
  }
  async indexFollowers() {
    const exist = await this.followers.indexExists(['user_id_1_follower_id_1'])
    if (!exist) {
      this.followers.createIndex({ user_id: 1, follower_id: 1 })
    }
  }

  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
  }
  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKEN_COLLECTION as string)
  }
  get followers(): Collection<Follower> {
    return this.db.collection(process.env.DB_FOLLOWERS_COLLECTION as string)
  }
  get tweets(): Collection<Tweet> {
    return this.db.collection(process.env.DB_TWEETS_COLLECTION as string)
  }
  get hashtags(): Collection<Hashtag> {
    return this.db.collection(process.env.DB_HASHTAGS_COLLECTION as string)
  }
  get bookmarks(): Collection<Bookmark> {
    return this.db.collection(process.env.DB_BOOKMARKS_COLLECTION as string)
  }
  get likes(): Collection<Like> {
    return this.db.collection(process.env.DB_LIKES_COLLECTION as string)
  }
}

const databaseService = new DatabaseService()
export default databaseService
