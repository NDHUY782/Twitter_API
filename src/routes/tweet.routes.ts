import { Router, Application, Request, Response, NextFunction } from 'express'
import { createTweetController } from '~/controllers/tweet.controller'

import { filterMiddlewares } from '~/middleware/common.middlewares'
import { createTweetValidator } from '~/middleware/tweet.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middleware/users.middlewares'
import { UnFollowReqParams, UpdateMeReqBody } from '~/models/requests/User.requests'
import { wrapAsync, wrapRequestHandler, wrapRequest } from '~/utils/handlers'

const tweetsRouter = Router()
/**
 * Description: Create new tweet
 * Path: /create
 * Method: POST
 * Body: TweetReqBody
 */

tweetsRouter.post(
  '/create',
  accessTokenValidator,
  verifiedUserValidator,
  createTweetValidator,
  wrapAsync(createTweetController)
)

export default tweetsRouter
