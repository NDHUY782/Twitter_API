import { match } from 'assert'
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
        },
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
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

  async getNewFeeds({ user_id, limit, page }: { user_id: string; limit: number; page: number }) {
    const user_id_object = new ObjectId(user_id)

    const followed_user_ids = await databaseService.followers
      .find(
        {
          user_id: user_id_object
        },
        {
          projection: {
            followed_user_id: 1,
            _id: 0
          }
        }
      )
      .toArray()

    const ids = followed_user_ids.map((item) => item.followed_user_id)
    ids.push(user_id_object)

    const skip = limit * (page - 1)

    const enrichmentStages = [
      { $lookup: { from: 'hashtags', localField: 'hashtags', foreignField: '_id', as: 'hashtags' } },
      { $lookup: { from: 'users', localField: 'mentions', foreignField: '_id', as: 'mentions' } },
      {
        $addFields: {
          mentions: {
            $map: {
              input: '$mentions',
              as: 'm',
              in: {
                _id: '$$m._id',
                name: '$$m.name',
                username: '$$m.username',
                email: '$$m.email'
              }
            }
          }
        }
      },
      { $lookup: { from: 'bookmarks', localField: '_id', foreignField: 'tweet_id', as: 'bookmarks' } },
      { $lookup: { from: 'likes', localField: '_id', foreignField: 'tweet_id', as: 'likes' } },
      { $lookup: { from: 'tweets', localField: '_id', foreignField: 'parent_id', as: 'tweet_children' } },
      {
        $addFields: {
          bookmarks: { $size: '$bookmarks' },
          likes: { $size: '$likes' },
          retweet_count: {
            $size: { $filter: { input: '$tweet_children', as: 'c', cond: { $eq: ['$$c.type', TweetType.Retweet] } } }
          },
          comment_count: {
            $size: { $filter: { input: '$tweet_children', as: 'c', cond: { $eq: ['$$c.type', TweetType.Comment] } } }
          },
          quote_count: {
            $size: { $filter: { input: '$tweet_children', as: 'c', cond: { $eq: ['$$c.type', TweetType.QuoteTweet] } } }
          },
          views: { $add: ['$user_views', '$guest_views'] }
        }
      },
      {
        $project: {
          tweet_children: 0,
          'user.password': 0,
          'user.email_verify_token': 0,
          'user.forgot_password_token': 0,
          'user.twitter_circle': 0,
          'user.data_of_birth': 0
        }
      }
    ]

    const tweets_primary = await databaseService.tweets
      .aggregate([
        { $match: { user_id: { $in: ids } } },
        { $sort: { created_at: -1 } },
        { $skip: skip },
        { $limit: limit },
        ...enrichmentStages
      ])
      .toArray()

    const total_primary = await databaseService.tweets.countDocuments({ user_id: { $in: ids } })
    if (tweets_primary.length === limit) {
      const date = new Date()
      const tweet_ids_primary = tweets_primary.map((t) => t._id as ObjectId)
      await databaseService.tweets.updateMany(
        { _id: { $in: tweet_ids_primary } },
        { $inc: { user_views: 1 }, $set: { updated_at: date } }
      )
      tweets_primary.forEach((t) => {
        t.updated_at = date
        t.user_views += 1
      })
      return { tweets: tweets_primary, total: total_primary }
    }
    const needed = limit - tweets_primary.length
    const tweets_secondary = await databaseService.tweets
      .aggregate([
        { $match: { audience: 0, user_id: { $nin: ids } } },
        { $sample: { size: needed } },
        ...enrichmentStages
      ])
      .toArray()

    const total_secondary = await databaseService.tweets.countDocuments({ audience: 0, user_id: { $nin: ids } })

    const combinedTweets = [...tweets_primary, ...tweets_secondary]
    const tweet_ids_all = combinedTweets.map((t) => t._id as ObjectId)
    const date = new Date()
    await databaseService.tweets.updateMany(
      { _id: { $in: tweet_ids_all } },
      { $inc: { user_views: 1 }, $set: { updated_at: date } }
    )
    combinedTweets.forEach((t) => {
      t.updated_at = date
      t.user_views += 1
    })

    return {
      tweets: combinedTweets,
      total: total_primary + total_secondary
    }
  }
}

const tweetService = new TweetService()
export default tweetService
