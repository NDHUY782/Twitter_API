// async getNewFeeds({ user_id, limit, page }: { user_id: string; limit: number; page: number }) {
//   const user_id_object = new ObjectId(user_id)

//   const followed_user_ids = await databaseService.followers
//     .find(
//       {
//         user_id: user_id_object
//       },
//       {
//         projection: {
//           followed_user_id: 1,
//           _id: 0
//         }
//       }
//     )
//     .toArray()
//   const ids = followed_user_ids.map((item) => item.followed_user_id)

//   //Mong muốn newfeed sẽ lấy luôn tweet của mình
//   ids.push(user_id_object)

//   const [tweets, total] = await Promise.all([
//     databaseService.tweets
//       .aggregate([
//         // {
//         //   $match: {
//         //     user_id: {
//         //       $in: ids
//         //     }
//         //   }
//         // },
//         {
//           $lookup: {
//             from: 'users',
//             localField: 'user_id',
//             foreignField: '_id',
//             as: 'user'
//           }
//         },
//         {
//           $unwind: {
//             path: '$user'
//           }
//         },
//         {
//           $match: {
//             $or: [
//               {
//                 audience: 0
//               },
//               {
//                 $and: [
//                   {
//                     audience: 1
//                   },
//                   {
//                     'user.twitter_circle': {
//                       $in: [user_id_object]
//                     }
//                   }
//                 ]
//               }
//             ]
//           }
//         },
//         {
//           $skip: limit * (page - 1)
//         },
//         {
//           $limit: limit
//         },
//         {
//           $lookup: {
//             from: 'hashtags',
//             localField: 'hashtags',
//             foreignField: '_id',
//             as: 'hashtags'
//           }
//         },
//         {
//           $lookup: {
//             from: 'users',
//             localField: 'mentions',
//             foreignField: '_id',
//             as: 'mentions'
//           }
//         },
//         {
//           $addFields: {
//             mentions: {
//               $map: {
//                 input: '$mentions',
//                 as: 'mentions',
//                 in: {
//                   _id: '$$mentions._id',
//                   name: '$$mentions.name',
//                   username: '$$mentions.username',
//                   email: '$$mentions.email'
//                 }
//               }
//             }
//           }
//         },
//         {
//           $lookup: {
//             from: 'bookmarks',
//             localField: '_id',
//             foreignField: 'tweet_id',
//             as: 'bookmarks'
//           }
//         },
//         {
//           $lookup: {
//             from: 'likes',
//             localField: '_id',
//             foreignField: 'tweet_id',
//             as: 'likes'
//           }
//         },
//         {
//           $lookup: {
//             from: 'tweets',
//             localField: '_id',
//             foreignField: 'parent_id',
//             as: 'tweet_children'
//           }
//         },
//         {
//           $addFields: {
//             bookmarks: {
//               $size: '$bookmarks'
//             },
//             likes: {
//               $size: '$likes'
//             },
//             retweet_count: {
//               $size: {
//                 $filter: {
//                   input: '$tweet_children',
//                   as: 'item',
//                   cond: {
//                     $eq: ['$$item.type', TweetType.Retweet]
//                   }
//                 }
//               }
//             },
//             comment_count: {
//               $size: {
//                 $filter: {
//                   input: '$tweet_children',
//                   as: 'item',
//                   cond: {
//                     $eq: ['$$item.type', TweetType.Comment]
//                   }
//                 }
//               }
//             },
//             quote_count: {
//               $size: {
//                 $filter: {
//                   input: '$tweet_children',
//                   as: 'item',
//                   cond: {
//                     $eq: ['$$item.type', TweetType.QuoteTweet]
//                   }
//                 }
//               }
//             },
//             views: {
//               $add: ['$user_views', '$guest_views']
//             }
//           }
//         },
//         {
//           $project: {
//             tweet_children: 0,
//             user: {
//               password: 0,
//               email_verify_token: 0,
//               forgot_password_token: 0,
//               twitter_circle: 0,
//               data_of_birth: 0
//             }
//           }
//         }
//       ])
//       .toArray(),
//     databaseService.tweets
//       .aggregate([
//         {
//           $match: {
//             user_id: {
//               $in: ids
//             }
//           }
//         },
//         {
//           $lookup: {
//             from: 'users',
//             localField: 'user_id',
//             foreignField: '_id',
//             as: 'user'
//           }
//         },
//         {
//           $unwind: {
//             path: '$user'
//           }
//         },
//         {
//           $match: {
//             $or: [
//               {
//                 audience: 0
//               },
//               {
//                 $and: [
//                   {
//                     audience: 1
//                   },
//                   {
//                     'user.twitter_circle': {
//                       $in: [user_id_object]
//                     }
//                   }
//                 ]
//               }
//             ]
//           }
//         },
//         {
//           $count: 'total'
//         }
//       ])
//       .toArray()
//   ])
//   const tweet_ids = tweets.map((tweet) => tweet._id as ObjectId)
//   const date = new Date()
//   await databaseService.tweets.updateMany(
//     {
//       _id: {
//         $in: tweet_ids
//       }
//     },
//     {
//       $inc: { user_views: 1 },
//       $set: {
//         updated_at: date
//       }
//     }
//   )
//   tweets.forEach((tweet) => {
//     tweet.updated_at = date
//     tweet.user_views += 1
//   })
//   return {
//     tweets,
//     total: total.length > 0 ? total[0].total : 0
//   }
// }

// async register(payload: RegisterReqBody) {
//   const { email, password } = payload
//   /** cách 1: dùng chung check email exist cùng chung api register còn cách 2 là dùng custom trong middleware schema và tạo api check email exist */

//   // const existEmail = await databaseService.users.findOne({
//   //   email: email
//   // })
//   // if (existEmail) {
//   //   return false
//   // }

//   /**---------------------------------------------------------------------------- */

//   const result = await databaseService.users.insertOne(
//     new User({
//       ...payload,
//       data_of_birth: new Date(payload.date_of_birth),
//       password: hashPassword(payload.password)
//     })
//   )

//   const user_id = result.insertedId.toString()
//   const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)
//   await databaseService.refreshTokens.insertOne(
//     new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
//   )
//   const email_verify_token = await this.signEmailVerifyToken({
//     user_id: user_id.toString(),
//     verify: UserVerifyStatus.Unverified
//   })
//   console.log('email verify token là: ', email_verify_token)
//   // Cập nhật email_verify_token cho người dùng
//   await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, { $set: { email_verify_token } })
//   return {
//     access_token,
//     refresh_token
//   }
// }
