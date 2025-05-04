import { OpenAPIObject } from 'openapi3-ts/oas30'
import { userPaths } from './user.swagger'
import { tweetPaths } from '~/swagger/tweet.swagger'
import { searchPaths } from '~/swagger/search.swagger'
import { bookmarkPaths } from '~/swagger/bookmark.swagger'
import { likePaths } from '~/swagger/like.swagger'
import { conversationPaths } from '~/swagger/conversation.swagger'
import { messagePaths } from '~/swagger/message.swagger'
import { mediaPaths } from '~/swagger/medias.swagger'

export const swaggerDocument: OpenAPIObject = {
  openapi: '3.0.0',
  info: {
    title: 'My API For Twitter Copy',
    version: '1.0.0',
    description: 'This is the API documentation'
  },
  servers: [
    {
      url: 'http://localhost:4000/api',
      description: 'Local server'
    },
    {
      url: 'http://3.26.97.252:4000/api',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  paths: {
    ...userPaths,
    ...tweetPaths,
    ...searchPaths,
    ...bookmarkPaths,
    ...likePaths,
    ...conversationPaths,
    ...messagePaths,
    ...mediaPaths
  }
}
