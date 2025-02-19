import { ObjectId } from 'mongodb'
import { TweetAudience, TweetType } from '~/constants/enums'
import { Media } from '~/models/Other'

interface TweetConstructor {
  _id?: ObjectId
  user_id: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | ObjectId
  hashtags: ObjectId[]
  mentions: ObjectId[]
  medias: Media[]
  guest_views: number
  user_views: number
  created_at?: Date
  updated_at?: Date
}

export default class Tweet {
  _id?: ObjectId
  user_id: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | ObjectId
  hashtags: ObjectId[]
  mentions: ObjectId[]
  medias: Media[]
  guest_views: number
  user_views: number
  created_at: Date
  updated_at: Date
  constructor({
    _id,
    audience,
    content,
    guest_views,
    hashtags,
    medias,
    mentions,
    parent_id,
    type,
    user_id,
    user_views,
    created_at,
    updated_at
  }: TweetConstructor) {
    this._id = _id
    this.user_id = user_id
    this.audience = audience
    this.content = content
    this.guest_views = guest_views
    this.user_views = user_views
    this.hashtags = hashtags
    this.medias = medias
    this.mentions = mentions
    this.parent_id = parent_id
    this.type = type
    this.created_at = created_at || new Date()
    this.updated_at = updated_at || new Date()
  }
}
