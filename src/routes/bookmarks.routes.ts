import { Router, Application, Request, Response, NextFunction } from 'express'
import { bookmarkTweetController, unBookmarkTweetController } from '~/controllers/bookmark.controller'
import { filterMiddlewares } from '~/middleware/common.middlewares'
import { tweetValidator } from '~/middleware/tweet.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middleware/users.middlewares'
import { wrapAsync, wrapRequestHandler, wrapRequest } from '~/utils/handlers'

const bookmarksRoute = Router()
/**
 * Description: Bookmark Tweet
 * Path: /
 * Method: POST
 * Body: {tweet_id}
 * Header: {Authorization: Bearer <access_token>}
 */

bookmarksRoute.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  tweetValidator,
  wrapAsync(bookmarkTweetController)
)
/**
 * Description: UnBookmark Tweet
 * Path: tweet/:tweet_id
 * Method: DELETE
 * Params: {tweet_id}
 * Header: {Authorization: Bearer <access_token>}
 */

bookmarksRoute.delete(
  '/tweet/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetValidator,
  wrapAsync(unBookmarkTweetController)
)

export default bookmarksRoute
