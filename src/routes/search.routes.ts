import { Router, Application, Request, Response, NextFunction } from 'express'
import { searchController } from '~/controllers/search.controller'
import { paginationValidator } from '~/middleware/tweet.middlewares'

import { accessTokenValidator, isUserLoggedInValidator, verifiedUserValidator } from '~/middleware/users.middlewares'

import { wrapAsync, wrapRequestHandler, wrapRequest } from '~/utils/handlers'

const searchRouter = Router()
/**
 * Description: Search
 * Path: /
 * Method: GET
 * Header: {Authorization: Bearer <access_token>}
 * Query: {limit: number,page: number}
 */

searchRouter.get(
  '/',
  paginationValidator,
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(searchController)
)
export default searchRouter
