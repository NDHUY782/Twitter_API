import { Request, Response, NextFunction } from 'express'
import User from '~/models/schemas/Users.Schema'
import databaseService from '~/services/database.service'
import userService from '~/services/users.service'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  ChangePasswordReqBody,
  FollowReqBody,
  ForgotPasswordReqBody,
  GetProfileReqParams,
  LoginReqBody,
  LogoutReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
  TokenPayload,
  UnFollowReqParams,
  UpdateMeReqBody,
  VerifyEmailReqBody,
  VerifyForgotPasswordReqBody
} from '~/models/requests/User.requests'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { TweetType, UserVerifyStatus } from '~/constants/enums'
import { Pagination, TweetParams, TweetQuery, TweetReqBody } from '~/models/requests/Tweet.requests'
import tweetService from '~/services/tweet.service'
import { update } from 'lodash'
import { resolveSoa } from 'dns'

export const createTweetController = async (
  req: Request<ParamsDictionary, any, TweetReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetService.createTweet(user_id, req.body)
  return res.json({
    msg: 'Create Success',
    result
  })
}
export const getTweetController = async (
  req: Request<ParamsDictionary, any, TweetReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetService.increaseView(req.params.tweet_id, user_id)
  const tweet = {
    ...req.tweet,
    guest_views: result.guest_views,
    user_views: result.user_views,
    views: result.guest_views + result.user_views,
    updated_at: result.updated_at
  }

  return res.json({
    msg: 'Get tweet detail',
    result: tweet
  })
}
export const getTweetChildrenController = async (
  req: Request<TweetParams, any, any, TweetQuery>,
  res: Response,
  next: NextFunction
) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const tweet_type = Number(req.query.tweet_type) as TweetType
  const user_id = req.decoded_authorization?.user_id
  const { total, tweets } = await tweetService.getTweetChildren({
    tweet_id: req.params.tweet_id,
    limit,
    page,
    tweet_type,
    user_id
  })
  return res.json({
    msg: 'Get tweet children Success',
    result: {
      tweets,
      tweet_type,
      limit,
      page,
      total_page: Math.ceil(total / limit)
    }
  })
}
export const getNewFeedController = async (
  req: Request<ParamsDictionary, any, any, Pagination>,
  res: Response,
  next: NextFunction
) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const user_id = req.decoded_authorization?.user_id as string
  const result = await tweetService.getNewFeeds({
    user_id,
    limit,
    page
  })
  res.json({
    msg: 'Get new feed Success',
    result: {
      tweets: result.tweets,
      limit,
      page,
      total_page: Math.ceil(result.total / limit)
    }
  })
}
