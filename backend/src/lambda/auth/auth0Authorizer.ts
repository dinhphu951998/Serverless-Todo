import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'
import { getToken } from '../../auth/utils'
import * as middy from 'middy'
import { secretsManager } from 'middy/middlewares'

const logger = createLogger('auth')

const secretId = process.env.AUTH_0_SECRET_ID
const secretField = process.env.AUTH_0_SECRET_FIELD

export const handler = middy(
  async (
    event: CustomAuthorizerEvent,
    context
  ): Promise<CustomAuthorizerResult> => {
    logger.info('Authorizing a user', event.authorizationToken)
    try {
      
      const decodedCert = new Buffer(context.AUTH0_SECRET[secretField], "base64").toString("ascii")

      const jwtToken = await verifyToken(
        event.authorizationToken,
        decodedCert
      )
      logger.info('User was authorized', jwtToken)

      return {
        principalId: jwtToken.sub,
        policyDocument: {
          Version: '2012-10-17',
          Statement: [
            {
              Action: 'execute-api:Invoke',
              Effect: 'Allow',
              Resource: '*'
            }
          ]
        }
      }
    } catch (e) {
      logger.error('User not authorized', { error: e.message })

      return {
        principalId: 'user',
        policyDocument: {
          Version: '2012-10-17',
          Statement: [
            {
              Action: 'execute-api:Invoke',
              Effect: 'Deny',
              Resource: '*'
            }
          ]
        }
      }
    }
  }
)

async function verifyToken(
  authHeader: string,
  cert: string
): Promise<JwtPayload> {
  const token = getToken(authHeader)
  logger.info('Token: ' + token)

  const payload = verify(token, cert, {
    algorithms: ['RS256']
  }) as JwtPayload

  logger.info('JwtPayload: ' + JSON.stringify(payload))
  return payload
}

handler.use(
  secretsManager({
    awsSdkOptions: { region: 'us-east-1' },
    cache: true,
    cacheExpiryInMillis: 60000,
    // Throw an error if can't read the secret
    throwOnFailedCall: true,
    secrets: {
      AUTH0_SECRET: secretId
    }
  })
)
