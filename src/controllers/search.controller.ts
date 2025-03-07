import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { SearchQuery } from '~/models/requests/Search.requests'
import searchService from '~/services/search.service'
import { TokenPayload } from '~/models/requests/User.requests'

export const searchController = async (
  req: Request<ParamsDictionary, any, any, SearchQuery>,
  res: Response,
  next: NextFunction
) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const content = req.query.content
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await searchService.search({ limit, page, content, user_id })
  res.json({
    msg: 'Get new feed Success',
    result: {
      tweets: result.tweets,
      limit,
      page,
      total_page: Math.ceil(result.total / limit)
    }
  })
}
