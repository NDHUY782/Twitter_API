import { JwtPayload } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { TweetAudience, TweetType } from '~/constants/enums'
import { Media } from '~/models/Other'
import { ParamsDictionary, Query } from 'express-serve-static-core'
import { Pagination } from '~/models/requests/Tweet.requests'

export interface SearchQuery extends Pagination {
  content: string
}
