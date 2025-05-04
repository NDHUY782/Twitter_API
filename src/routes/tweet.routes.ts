import { Router, Application, Request, Response, NextFunction } from 'express'
import {
  createTweetController,
  getNewFeedController,
  getTweetChildrenController,
  getTweetController
} from '~/controllers/tweet.controller'

import { filterMiddlewares } from '~/middleware/common.middlewares'
import {
  audienceValidator,
  createTweetValidator,
  getTweetChildrenValidator,
  paginationValidator,
  tweetValidator
} from '~/middleware/tweet.middlewares'
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
 * Description: get new feeds
 * Path: /
 * Method: GET
 * Header: {Authorization: Bearer <access_token>}
 * Query: {limit: number,page: number}
 */

tweetsRouter.get(
  '/',
  paginationValidator,
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(getNewFeedController)
)

/**
 * Description: get tweet detail
 * Path: /:tweet_id
 * Method: GET
 * Header: {Authorization: Bearer <access_token>}
 */

tweetsRouter.get(
  '/:tweet_id',
  tweetValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  wrapAsync(getTweetController)
)

/**
 * Description: get tweet_children detail
 * Path: /:tweet_id/children
 * Method: GET
 * Header: {Authorization: Bearer <access_token>}
 * Query: {limit: number,page: number, tweet_type: TweetType}
 */

tweetsRouter.get(
  '/:tweet_id/children',
  tweetValidator,
  getTweetChildrenValidator,
  paginationValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  wrapAsync(getTweetChildrenController)
)

export default tweetsRouter
