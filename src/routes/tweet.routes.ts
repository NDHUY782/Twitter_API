import { Router, Application, Request, Response, NextFunction } from 'express'
import { createTweetController, getTweetController } from '~/controllers/tweet.controller'

import { filterMiddlewares } from '~/middleware/common.middlewares'
import { audienceValidator, createTweetValidator, tweetValidator } from '~/middleware/tweet.middlewares'
import { accessTokenValidator, isUserLoggedInValidator, verifiedUserValidator } from '~/middleware/users.middlewares'
import { UnFollowReqParams, UpdateMeReqBody } from '~/models/requests/User.requests'
import { wrapAsync, wrapRequestHandler, wrapRequest } from '~/utils/handlers'

const tweetsRouter = Router()
/**
 * Description: Create new tweet
 * Path: /create
 * Method: POST
 * Body: TweetReqBody
 * Header: {Authorization: Bearer <access_token>}
 */

tweetsRouter.post(
  '/create',
  accessTokenValidator,
  verifiedUserValidator,
  createTweetValidator,
  wrapAsync(createTweetController)
)

/**
 * Description: get tweet detail
 * Path: /:tweet_id
 * Method: GET
 * Header: {Authorization: Bearer <access_token>}
 */

tweetsRouter.get(
  '/:tweet_id',
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  // createTweetValidator,
  tweetValidator,
  wrapAsync(getTweetController)
)
export default tweetsRouter
