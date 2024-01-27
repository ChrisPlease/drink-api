import { Handler } from 'aws-lambda'

export const handler: Handler = async (e) => {
  console.log('authorizer event', e)
  return {}
}
