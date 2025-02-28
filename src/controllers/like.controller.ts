import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TokenPayload } from '~/models/requests/User.requests'
import { LikeTweetReqBody } from '~/models/requests/Like.requests'
import likeService from '~/services/like.service'

export const likeTweet = async (
  req: Request<ParamsDictionary, any, LikeTweetReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await likeService.likeTweet(user_id, req.body.tweet_id)
  return res.json({
    msg: 'Like Success',
    result
  })
}
export const unlikeTweet = async (
  req: Request<ParamsDictionary, any, LikeTweetReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await likeService.unlikeTweet(user_id, req.params.tweet_id)
  return res.json({
    msg: 'unlike Success',
    result
  })
}
