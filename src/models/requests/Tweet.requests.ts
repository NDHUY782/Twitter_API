import { JwtPayload } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { TweetAudience, TweetType } from '~/constants/enums'
import { Media } from '~/models/Other'

export interface TweetReqBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | ObjectId
  hashtags: ObjectId[]
  mentions: ObjectId[]
  medias: Media[]
}
