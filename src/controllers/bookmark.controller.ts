import { Request, Response, NextFunction } from 'express'
import databaseService from '~/services/database.service'
import { ParamsDictionary } from 'express-serve-static-core'
import { TokenPayload } from '~/models/requests/User.requests'
import { BookmarkTweetReqBody } from '~/models/requests/Bookmark.requests'
import bookmarkService from '~/services/bookmark.service'

export const bookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkTweetReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await bookmarkService.bookmarkTweet(user_id, req.body.tweet_id)
  return res.json({
    msg: 'Bookmark Success',
    result
  })
}
export const unBookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkTweetReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await bookmarkService.unBookmarkTweet(user_id, req.params.tweet_id)
  return res.json({
    msg: 'UnBookmark Success',
    result
  })
}
