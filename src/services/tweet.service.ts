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

    //Mong muốn newfeed sẽ lấy luôn tweet của mình
    ids.push(user_id_object)
    const [tweets, total] = await Promise.all([
      databaseService.tweets
        .aggregate([
          {
            $match: {
              user_id: {
                $in: ids
              }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: {
              path: '$user'
            }
          },
          {
            $match: {
              $or: [
                {
                  audience: 0
                },
                {
                  $and: [
                    {
                      audience: 1
                    },
                    {
                      'user.twitter_circle': {
                        $in: [user_id_object]
                      }
                    }
                  ]
                }
              ]
            }
          },
          {
            $skip: limit * (page - 1)
          },
          {
            $limit: limit
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
                      $eq: ['$$item.type', TweetType.Retweet]
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
                      $eq: ['$$item.type', TweetType.Comment]
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
                      $eq: ['$$item.type', TweetType.QuoteTweet]
                    }
                  }
                }
              },
              views: {
                $add: ['$user_views', '$guest_views']
              }
            }
          },
          {
            $project: {
              tweet_children: 0,
              user: {
                password: 0,
                email_verify_token: 0,
                forgot_password_token: 0,
                twitter_circle: 0,
                data_of_birth: 0
              }
            }
          }
        ])
        .toArray(),
      databaseService.tweets
        .aggregate([
          {
            $match: {
              user_id: {
                $in: ids
              }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: {
              path: '$user'
            }
          },
          {
            $match: {
              $or: [
                {
                  audience: 0
                },
                {
                  $and: [
                    {
                      audience: 1
                    },
                    {
                      'user.twitter_circle': {
                        $in: [user_id_object]
                      }
                    }
                  ]
                }
              ]
            }
          },
          {
            $count: 'total'
          }
        ])
        .toArray()
    ])
    const tweet_ids = tweets.map((tweet) => tweet._id as ObjectId)
    const date = new Date()
    await databaseService.tweets.updateMany(
      {
        _id: {
          $in: tweet_ids
        }
      },
      {
        $inc: { user_views: 1 },
        $set: {
          updated_at: date
        }
      }
    )
    tweets.forEach((tweet) => {
      tweet.updated_at = date
      tweet.user_views += 1
    })
    // const data = await databaseService.tweets
    //   .aggregate([
    //     {
    //       $match: {
    //         user_id: {
    //           $in: ids
    //         }
    //       }
    //     },
    //     {
    //       $lookup: {
    //         from: 'users',
    //         localField: 'user_id',
    //         foreignField: '_id',
    //         as: 'user'
    //       }
    //     },
    //     {
    //       $unwind: {
    //         path: '$user'
    //       }
    //     },
    //     {
    //       $match: {
    //         $or: [
    //           {
    //             audience: 0
    //           },
    //           {
    //             $and: [
    //               {
    //                 audience: 1
    //               },
    //               {
    //                 'user.twitter_circle': {
    //                   $in: [user_id_object]
    //                 }
    //               }
    //             ]
    //           }
    //         ]
    //       }
    //     },
    //     {
    //       $skip: limit * (page - 1)
    //     },
    //     {
    //       $limit: limit
    //     },
    //     {
    //       $lookup: {
    //         from: 'hashtags',
    //         localField: 'hashtags',
    //         foreignField: '_id',
    //         as: 'hashtags'
    //       }
    //     },
    //     {
    //       $lookup: {
    //         from: 'users',
    //         localField: 'mentions',
    //         foreignField: '_id',
    //         as: 'mentions'
    //       }
    //     },
    //     {
    //       $addFields: {
    //         mentions: {
    //           $map: {
    //             input: '$mentions',
    //             as: 'mentions',
    //             in: {
    //               _id: '$$mentions._id',
    //               name: '$$mentions.name',
    //               username: '$$mentions.username',
    //               email: '$$mentions.email'
    //             }
    //           }
    //         }
    //       }
    //     },
    //     {
    //       $lookup: {
    //         from: 'bookmarks',
    //         localField: '_id',
    //         foreignField: 'tweet_id',
    //         as: 'bookmarks'
    //       }
    //     },
    //     {
    //       $lookup: {
    //         from: 'likes',
    //         localField: '_id',
    //         foreignField: 'tweet_id',
    //         as: 'likes'
    //       }
    //     },
    //     {
    //       $lookup: {
    //         from: 'tweets',
    //         localField: '_id',
    //         foreignField: 'parent_id',
    //         as: 'tweet_children'
    //       }
    //     },
    //     {
    //       $addFields: {
    //         bookmarks: {
    //           $size: '$bookmarks'
    //         },
    //         likes: {
    //           $size: '$likes'
    //         },
    //         retweet_count: {
    //           $size: {
    //             $filter: {
    //               input: '$tweet_children',
    //               as: 'item',
    //               cond: {
    //                 $eq: ['$$item.type', TweetType.Retweet]
    //               }
    //             }
    //           }
    //         },
    //         comment_count: {
    //           $size: {
    //             $filter: {
    //               input: '$tweet_children',
    //               as: 'item',
    //               cond: {
    //                 $eq: ['$$item.type', TweetType.Comment]
    //               }
    //             }
    //           }
    //         },
    //         quote_count: {
    //           $size: {
    //             $filter: {
    //               input: '$tweet_children',
    //               as: 'item',
    //               cond: {
    //                 $eq: ['$$item.type', TweetType.QuoteTweet]
    //               }
    //             }
    //           }
    //         },
    //         views: {
    //           $add: ['$user_views', '$guest_views']
    //         }
    //       }
    //     },
    //     {
    //       $project: {
    //         tweet_children: 0,
    //         user: {
    //           password: 0,
    //           email_verify_token: 0,
    //           forgot_password_token: 0,
    //           twitter_circle: 0,
    //           data_of_birth: 0
    //         }
    //       }
    //     }
    //   ])
    //   .toArray()

    return {
      tweets,
      total: total.length > 0 ? total[0].total : 0
    }
  }
}

const tweetService = new TweetService()
export default tweetService
