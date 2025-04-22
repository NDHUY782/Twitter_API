import dotenv from 'dotenv'
import express, { Application, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import logger from 'morgan'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import moment from 'moment-timezone'
import bodyParser from 'body-parser'
import databaseService from './services/database.service'

import { Router } from 'express'
import userRouter from './routes/users.routes'
import { defaultErrorHandler } from '~/middleware/error.middlewares'
import mediaRouter from '~/routes/medias.routes'
import { initFolder } from '~/utils/file'
import staticRoute from '~/routes/static.routes'
import { UPLOAD_VIDEO_DIR } from '~/constants/dir'
import tweetsRouter from '~/routes/tweet.routes'
import bookmarksRoute from '~/routes/bookmarks.routes'
import likesRoute from '~/routes/likes.routes'
import searchRouter from '~/routes/search.routes'

import { createServer } from 'http'
import { Server } from 'socket.io'
import Conversation from '~/models/schemas/Conversation.Schema'
import conversationRoute from '~/routes/conversation.routes'
import { ObjectId } from 'mongodb'

const router = Router()

const PORT = process.env.PORT || 4000

dotenv.config()
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Bangkok')
moment.tz.setDefault('Asia/Bangkok')

// connectDB()
databaseService.connect().then(() => {
  databaseService.indexUsers()
  databaseService.indexRefreshTokens()
  databaseService.indexFollowers()
  databaseService.indexTweets()
})
const app = express()

initFolder()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('trust proxy', 1)
app.use(express.json({ limit: '4mb' }))
app.use(helmet())
app.use(cors())
app.use(
  logger('dev', {
    skip: (req: Request) => req.url.indexOf('socket') >= 0
  })
)

// Root route
app.get('/', (_, res: Response) => {
  res.send('Twitter server is running')
})
app.use('/api/users/', userRouter)
app.use('/api/medias/', mediaRouter)
app.use('/api/static/', staticRoute)
app.use('/api/tweet/', tweetsRouter)
app.use('/api/bookmark/', bookmarksRoute)
app.use('/api/like/', likesRoute)
app.use('/api/search/', searchRouter)
app.use('/api/conversations/', conversationRoute)

app.use('static/video', express.static(UPLOAD_VIDEO_DIR))
app.use(defaultErrorHandler)
// Error handler middleware
// app.use((err: any, req: Request, res: Response, next: NextFunction) => {
//   if (res.headersSent) return next(err)
//   res.status(400).json({ message: err.message })
// })

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: true
  }
})

const users: {
  [key: string]: {
    socket_id: string
  }
} = {}
io.on('connection', (socket) => {
  console.log('Client connected: ', socket)
  const user_id = socket.handshake.auth._id
  // const user_id = socket.handshake.query.user_id
  users[user_id] = {
    socket_id: socket.id
  }
  socket.on('message', async (data) => {
    const receiver_socket_id = users[data.to].socket_id

    await databaseService.conversations.insertOne(
      new Conversation({
        sender_id: new ObjectId(data.from),
        receiver_id: new ObjectId(data.to),
        content: data.content
      })
    )

    socket.to(receiver_socket_id).emit('receive message', {
      from: user_id,
      content: data.content
    })
  })
  socket.on('disconnect', () => {
    delete users[user_id]
  })
})

const server = httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
