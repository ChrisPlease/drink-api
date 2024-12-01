import KeyvStore from 'keyv'
import KeyvRedis from '@keyv/redis'

let keyvClient: KeyvStore<Record<string, unknown>> | null = null

export const getKeyvClient = (): KeyvStore => {
  if (!keyvClient) {
    const redisHost = process.env.REDIS_HOST || 'redis'
    const redisPort = process.env.REDIS_PORT || '6379'
    const redisPassword = process.env.REDIS_PASSWORD

    const redisUri = redisPassword
      ? `redis://${redisPassword}@${redisHost}:${redisPort}`
      : `redis://${redisHost}:${redisPort}`

    const store = new KeyvRedis(redisUri)
    keyvClient = new KeyvStore({ store })

    keyvClient.on('error',(err) => {
      console.error('Keyv connection error:', err)
    })
  }

  return keyvClient
}
