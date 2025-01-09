import dotenv from 'dotenv'

import argv from 'minimist'

dotenv.config()
const options = argv(process.argv.slice(2))

export const isProduction = Boolean(options.production)
