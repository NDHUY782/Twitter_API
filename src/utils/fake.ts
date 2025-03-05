import { faker } from '@faker-js/faker'
import { ObjectId } from 'mongodb'
import { TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enums'
import { TweetReqBody } from '~/models/requests/Tweet.requests'
import { RegisterReqBody } from '~/models/requests/User.requests'
import Follower from '~/models/schemas/Followers.Schema'
import User from '~/models/schemas/Users.Schema'
import databaseService from '~/services/database.service'
import tweetService from '~/services/tweet.service'
import { hashPassword } from '~/utils/crypto'

const PASSWORD = 'Huy1234@'
const MYID = new ObjectId('67c54910b54c61164dc42cf2')

//sỐ LƯỢNG USER FAKE ĐƯỢC TẠO, mỗi user sẽ mặc định tweet 2 cái
const USER_COUNT = 20

export function createRandomUser() {
  const user: RegisterReqBody = {
    name: faker.internet.username(),
    email: faker.internet.email(),
    password: PASSWORD,
    confirm_password: PASSWORD,
    date_of_birth: faker.date.past().toISOString()
  }
  return user
}
export function createRandomTweet() {
  const tweet: TweetReqBody = {
    type: TweetType.Tweet,
    audience: TweetAudience.Everyone,
    content: faker.lorem.paragraph({
      min: 10,
      max: 160
    }),
    hashtags: [],
    medias: [],
    mentions: [],
    parent_id: null
  }
  return tweet
}

export const users: RegisterReqBody[] = faker.helpers.multiple(createRandomUser, {
  count: USER_COUNT
})

const insertMultipleUsers = async (users: RegisterReqBody[]) => {
  console.log('Creating users.....')
  const result = await Promise.all(
    users.map(async (user) => {
      const user_id = new ObjectId()
      await databaseService.users.insertOne(
        new User({
          ...user,
          username: `user${user_id.toString()}`,
          password: hashPassword(user.password),
          date_of_birth: new Date(user.date_of_birth),
          verify: UserVerifyStatus.Verified
        })
      )
      return user_id
    })
  )
  console.log(`Created ${result.length} users`)
  return result
}

const followMultipleUsers = async (user_id: ObjectId, followed_user_ids: ObjectId[]) => {
  console.log('Creating following.....')
  const result = await Promise.all(
    followed_user_ids.map(async (followed_user_id) => {
      await databaseService.followers.insertOne(
        new Follower({
          user_id,
          followed_user_id: new ObjectId(followed_user_id)
        })
      )
    })
  )
  console.log(`Followed ${result.length} users`)
}

const insertMultipleTweet = async (ids: ObjectId[]) => {
  console.log('Creating tweets.....')
  console.log('Counting........')
  let count = 0
  const result = await Promise.all(
    ids.map(async (id, index) => {
      await Promise.all([
        tweetService.createTweet(id.toString(), createRandomTweet()),
        tweetService.createTweet(id.toString(), createRandomTweet())
      ])
      count += 2
      console.log(`Created ${count} tweets`)
    })
  )
  return result
}

insertMultipleUsers(users).then((ids) => {
  followMultipleUsers(new ObjectId(MYID), ids)
  insertMultipleTweet(ids)
})
