import { NextFunction, Request, Response } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { ppid } from 'process'
import { TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { TWEET_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { REGEX_USERNAME } from '~/constants/regex'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/User.requests'
import databaseService from '~/services/database.service'
import userService from '~/services/users.service'
import { numberEnumToArray } from '~/utils/commons'
import { hashPassword } from '~/utils/crypto'
import { verifyEmailToken, verifyForgotPasswordToken, verifyRefreshToken, verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

const tweetTypes = numberEnumToArray(TweetType)
const tweetAudience = numberEnumToArray(TweetAudience)
export const createTweetValidator = validate(
  checkSchema(
    {
      type: {
        isIn: {
          options: tweetTypes
        },
        errorMessage: TWEET_MESSAGES.INVALID_TYPE
      },
      audience: {
        isIn: {
          options: tweetAudience
        },
        errorMessage: TWEET_MESSAGES.INVALID_AUDIENCE
      },
      parent_id: {
        custom: {
          options: (value, { req }) => {
            const type = req.body.type as TweetType
            if (
              [TweetType.Retweet, TweetType.QuoteTweet, TweetType.Comment].includes(type) &&
              ObjectId.isValid(value)
            ) {
              throw new Error(TWEET_MESSAGES.INVALID_PARENT_ID)
            }
            if (type == TweetType.Tweet && value !== null) {
              throw new Error(TWEET_MESSAGES.PARENT_ID_MUST_BE_NULL)
            }
          }
        }
      },
      content: {
        isString: true,
        custom: {
          options: (value, { req }) => {
            const type = req.body.type as TweetType
            const hashtags = req.body.hashtags as string[]
            const mentions = req.body.mentions as string[]

            //Nếu type là comment, quote, tweet thì và không có mentions và hashtags thì 'content' phải là string không được rỗng
            if (
              [TweetType.Comment, TweetType.QuoteTweet, TweetType.Tweet].includes(type) &&
              isEmpty(hashtags) &&
              isEmpty(mentions) &&
              value == ''
            ) {
              throw new Error(TWEET_MESSAGES.CONTENT_MUST_BE_NON_EMPTY_STRING)
            }
            //Nếu type là retweet thì content phải là ""
            if (type == TweetType.Retweet && value !== '') {
              throw new Error(TWEET_MESSAGES.CONTENT_MUST_BE_EMPTY_STRING)
            }
          }
        }
      },
      hashtags: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            //Yêu cầu mỗi ptu trong array đều phải là string
            if (!value.every((item: any) => typeof item == 'string')) {
              throw new Error(TWEET_MESSAGES.HASHTAGS_MUST_BE_AN_ARRAY_OF_STRINGS)
            }
          }
        }
      },
      mentions: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            //Yêu cầu mỗi ptu trong array đều phải là user_id
            if (!value.every((item: any) => ObjectId.isValid(item))) {
              throw new Error(TWEET_MESSAGES.MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID)
            }
          }
        }
      }
    },
    ['body']
  )
)
