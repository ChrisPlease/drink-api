import Keyv from 'keyv'
import KeyvRedis from '@keyv/redis'

let keyvClient: Keyv<Record<string, unknown>> | null = null

export const getKeyvClient = (): Keyv => {
  if (!keyvClient) {
    const redisHost = process.env.REDIS_HOST || 'redis'
    const redisPort = process.env.REDIS_PORT || '6379'
    const redisPassword = process.env.REDIS_PASSWORD

    const redisUri = redisPassword
      ? `redis://${redisPassword}@${redisHost}:${redisPort}`
      : `redis://${redisHost}:${redisPort}`

    const store = new KeyvRedis(redisUri)
    keyvClient = new Keyv({ store })

    keyvClient.on('error',(err) => {
      console.error('Keyv connection error:', err)
    })
  }

  return keyvClient
}
