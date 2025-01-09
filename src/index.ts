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
// import { connectDB } from './config/db'
import databaseService from './services/database.service'

import { Router } from 'express'
import userRouter from './routes/users.routes'
import { defaultErrorHandler } from '~/middleware/error.middlewares'
import mediaRouter from '~/routes/medias.routes'
import { initFolder } from '~/utils/file'
import { UPLOAD_DIR, UPLOAD_TEMP_DIR } from '~/constants/dir'

const router = Router()

const PORT = process.env.PORT || 4000

dotenv.config()
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Bangkok')
moment.tz.setDefault('Asia/Bangkok')

// connectDB()
databaseService.connect()
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
// app.use("/api/category/", categoryRoute);
// app.use("/api/post", postRoute);
// app.use("/api/page", pageRoute);
// app.use("/api/comment/", commentRoute);
// app.use("/api/profile/", profileRoute);
// app.use("/api/group/", groupRoute);
// app.use("/api/group-media/", groupMediaRoute);
// app.use("/api/conversation/", conversationRoute);
// app.use("/api/chat-group/", chatGroupRoute);
// app.use("/api/send-mess/", messRoute);

app.use('static', express.static(UPLOAD_DIR))
app.use(defaultErrorHandler)
// Error handler middleware
// app.use((err: any, req: Request, res: Response, next: NextFunction) => {
//   if (res.headersSent) return next(err)
//   res.status(400).json({ message: err.message })
// })

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
