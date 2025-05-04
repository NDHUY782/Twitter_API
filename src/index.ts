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
import Message from '~/models/schemas/Message.Schema'
import messageRoute from '~/routes/message.routes'

import swaggerUi from 'swagger-ui-express'
import { swaggerDocument } from './swagger/swagger'

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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.use('/api/users/', userRouter)
app.use('/api/medias/', mediaRouter)
app.use('/api/static/', staticRoute)
app.use('/api/tweets/', tweetsRouter)
app.use('/api/bookmarks/', bookmarksRoute)
app.use('/api/likes/', likesRoute)
app.use('/api/search/', searchRouter)
app.use('/api/conversations/', conversationRoute)
app.use('/api/messages/', messageRoute)

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
  socket.on('send message', async (data) => {
    const receiver_socket_id = users[data.to].socket_id

    let conversation = await databaseService.conversations.findOne({
      $or: [
        { sender_id: new ObjectId(String(data.to)), receiver_id: new ObjectId(String(user_id)) },
        { sender_id: new ObjectId(String(user_id)), receiver_id: new ObjectId(String(data.to)) }
      ]
    })

    if (!conversation) {
      const newConversation = new Conversation({
        sender_id: new ObjectId(String(data.from)),
        receiver_id: new ObjectId(String(data.to))
      })
      const result = await databaseService.conversations.insertOne(newConversation)
      conversation = {
        ...newConversation,
        _id: result.insertedId
      }
    }
    await databaseService.messages.insertOne(
      new Message({
        sender_id: user_id,
        receiver_id: data.to,
        conversation_id: conversation._id,
        content: data.content
      })
    )

    socket.to(receiver_socket_id).emit('receive message', {
      from: user_id,
      content: data.content
    })
    socket.on('seen message', async (message_id) => {
      const message = await databaseService.messages.findOne({ _id: new ObjectId(String(message_id)) })
      if (message) {
        await databaseService.messages.updateOne({ _id: new ObjectId(String(message_id)) }, { $set: { seen: true } })
        socket.to(receiver_socket_id).emit('seen message', {
          message_id: message._id,
          seen: true
        })
      }
    })
    socket.on('typing', () => {
      socket.to(receiver_socket_id).emit('typing', {
        from: user_id,
        typing: true
      })
    })
    socket.on('stop typing', () => {
      socket.to(receiver_socket_id).emit('stop typing', {
        from: user_id,
        typing: false
      })
    })
  })
  socket.on('disconnect', () => {
    delete users[user_id]
  })
})

const server = httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
