import { APIGatewayProxyEvent, Handler } from 'aws-lambda'
import { configDotenv } from 'dotenv'
import axios from 'axios'

configDotenv()

export const handler: Handler = async (event: APIGatewayProxyEvent) => {
  const code = event.queryStringParameters?.code
  const client_id = process.env.AUTH0_CLIENT_ID
  const client_secret = process.env.AUTH0_CLIENT_SECRET
  const redirect_uri = process.env.AUTH0_CALLBACK_URI
  const auth0Domain = process.env.AUTH0_DOMAIN

  try {
    const payload = {
      client_id,
      client_secret,
      redirect_uri,
      code,
      grant_type: 'authorization_code',
    }

    const response = await axios.post(
      `${auth0Domain}/oauth/token`,
      payload,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    )

    const { access_token, id_token, token_type, expires_in } = response.data

    return {
      statusCode: 302,
      headers: {
        'Location': `shortcuts://run-shortcut?name=Callback&input=text&text=${JSON.stringify({ access_token, id_token, token_type, expires_in })}`,
      },
      body: '',
    }
  } catch (error) {
    console.error('Error:', error)
    return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Error exchanging authorization code for token' }),
    }
  }
}
