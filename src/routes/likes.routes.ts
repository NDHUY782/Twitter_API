import { Router, Application, Request, Response, NextFunction } from 'express'
import { bookmarkTweetController, unBookmarkTweetController } from '~/controllers/bookmark.controller'
import { likeTweet, unlikeTweet } from '~/controllers/like.controller'
import { filterMiddlewares } from '~/middleware/common.middlewares'
import { tweetValidator } from '~/middleware/tweet.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middleware/users.middlewares'
import { wrapAsync, wrapRequestHandler, wrapRequest } from '~/utils/handlers'

const likesRoute = Router()
/**
 * Description: Like Tweet
 * Path: /
 * Method: POST
 * Body: {tweet_id}
 * Header: {Authorization: Bearer <access_token>}
 */

likesRoute.post('/', accessTokenValidator, verifiedUserValidator, tweetValidator, wrapAsync(likeTweet))
/**
 * Description: unlike Tweet
 * Path: tweet/:tweet_id
 * Method: DELETE
 * Params: {tweet_id}
 * Header: {Authorization: Bearer <access_token>}
 */

likesRoute.delete(
  '/tweet/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetValidator,
  wrapAsync(unlikeTweet)
)

export default likesRoute
