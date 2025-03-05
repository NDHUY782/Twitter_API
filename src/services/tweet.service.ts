import { config } from 'dotenv'
import { update } from 'lodash'
import { ObjectId, WithId } from 'mongodb'
import { TweetType } from '~/constants/enums'
import { TweetReqBody } from '~/models/requests/Tweet.requests'
import Hashtag from '~/models/schemas/Hashtags.Schema'
import Tweet from '~/models/schemas/Tweet.schema'
import databaseService from '~/services/database.service'

config()
class TweetService {
  async checkAndCreateHashtag(hashtags: string[]) {
    const hashtagDocuments = await Promise.all(
      hashtags.map((hashtag) => {
        //Tìm hashtag trong database không thì tạo mới
        return databaseService.hashtags.findOneAndUpdate(
          {
            name: hashtag
          },
          {
            $setOnInsert: { name: hashtag }
          },
          {
            upsert: true,
            returnDocument: 'after'
          }
        )
      })
    )
    // console.log(hashtagDocuments)
    return hashtagDocuments.map((hashtag) => (hashtag as WithId<Hashtag>)._id)
  }
  async createTweet(user_id: string, body: TweetReqBody) {
    const hashtags = await this.checkAndCreateHashtag(body.hashtags)
    const result = await databaseService.tweets.insertOne(
      new Tweet({
        audience: body.audience,
        content: body.content,
        hashtags,
        mentions: body.mentions,
        medias: body.medias,
        parent_id: body.parent_id,
        type: body.type,
        user_id: new ObjectId(user_id)
      })
    )
    const data = await databaseService.tweets.findOne({ _id: result.insertedId })
    return data
  }
  async increaseView(tweet_id: string, user_id?: string) {
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const result = await databaseService.tweets.findOneAndUpdate(
      { _id: new ObjectId(tweet_id) },
      {
        $inc: inc,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          guest_views: 1,
          user_views: 1,
          updated_at: 1
        }
      }
    )
    // if (!result) {
    //   throw new Error('Tweet not found')
    // }
    return result as WithId<{
      guest_views: number
      user_views: number
      updated_at: Date
    }>
  }
  async getTweetChildren({
    user_id,
    tweet_id,
    limit,
    page,
    tweet_type
  }: {
    user_id?: string
    tweet_id: string
    limit: number
    page: number
    tweet_type: TweetType
  }) {
    const tweets = await databaseService.tweets
      .aggregate<Tweet>([
        {
          $match: {
            parent_id: new ObjectId(tweet_id),
            type: tweet_type
          }
        },
        {
          $lookup: {
            from: 'hashtags',
            localField: 'hashtags',
            foreignField: '_id',
            as: 'hashtags'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'mentions',
            foreignField: '_id',
            as: 'mentions'
          }
        },
        {
          $addFields: {
            mentions: {
              $map: {
                input: '$mentions',
                as: 'mentions',
                in: {
                  _id: '$$mentions._id',
                  name: '$$mentions.name',
                  username: '$$mentions.username',
                  email: '$$mentions.email'
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: 'bookmarks',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'bookmarks'
          }
        },
        {
          $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'likes'
          }
        },
        {
          $lookup: {
            from: 'tweets',
            localField: '_id',
            foreignField: 'parent_id',
            as: 'tweet_children'
          }
        },
        {
          $addFields: {
            bookmarks: {
              $size: '$bookmarks'
            },
            likes: {
              $size: '$likes'
            },
            retweet_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', 1]
                  }
                }
              }
            },
            comment_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', 2]
                  }
                }
              }
            },
            quote_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', 3]
                  }
                }
              }
            }
          }
        },
        {
          $project: {
            tweet_children: 0
          }
        }
      ])
      .toArray()

    const ids = tweets.map((tweet) => tweet._id as ObjectId)
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const date = new Date()
    const [, total] = await Promise.all([
      databaseService.tweets.updateMany(
        {
          _id: {
            $in: ids
          }
        },
        {
          $inc: inc,
          $set: {
            updated_at: date
          }
        }
      ),
      databaseService.tweets.countDocuments({
        parent_id: new ObjectId(tweet_id),
        type: tweet_type
      })
    ])
    tweets.forEach((tweet) => {
      tweet.updated_at = date
      if (user_id) {
        tweet.user_views += 1
      } else {
        tweet.guest_views += 1
      }
    })
    return {
      tweets,
      total
    }
  }
}

const tweetService = new TweetService()
export default tweetService
