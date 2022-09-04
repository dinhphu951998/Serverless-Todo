import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'
import { getToken } from '../../auth/utils'

const logger = createLogger('auth')

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJUNromp5dI/56MA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1tcDlrZXQ2dy51cy5hdXRoMC5jb20wHhcNMjIwODI1MDIyMzAyWhcN
MzYwNTAzMDIyMzAyWjAkMSIwIAYDVQQDExlkZXYtbXA5a2V0NncudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0XAtk9kj/PGRVqxo
GMgqhvGlvQSAIplpjPbZygbaXkrq8HTdRpFrjVp9XBby/IDhC6+t7I30LX/LtJ7x
OIFXeguO4bJoFIaaddPPkP4JOa3yMLbLLHGUhs/olrcnGmQGKXcK0uytqFBT3ow9
ksMUR4Nz8VbvNbb0LhGa+JFfnNBUt1tl+3Swh+91g3Stkprcp5GcXfzpX1ZnOb31
e/zGKEVaOlgXRBbCH3/27XB4anmNelUCqWSh8tHgje0ILXooXl0hDRNvYdU20d8l
a6vyeVDdFyAQ78gqYQd0XrMrFdBbDy8J+h+LBmKy9O/8UfGaGzcKC/baYUgochfP
rzleQwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQ9ua+tGbLl
t4XivOB8EDTR7fwSXDAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AMkoEvm/J+txEiX2xd2YykDzB5Bj2vYTbfmM/+1NlohlJjLfESd4Yrt7PQSzSsos
xSIb5qgkjv3Y7eh+wypXsTQ11rSTNU+6GEJBBnWzuEuD1S6GTjS1/eOVn06DXY+y
4LpxS8ZC+mjIshsjijJqjO438Efc31UiNS2td8EXL4oubPdH7XsujxhcFe6UMXwR
xSrffzlOb+95c212qbCtmfkQjsTWd2snXTpUbgxiIllwN9f6k5UE45bIsEBl+jnr
c0VGSrsWJlniWH8LqJ7FpsGULqa77MKCeOzdZAwcpIhhbaCU5x5T+jtHRjyajzdr
+EEOltkCFeAy7Lo+b83Bmlo=
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
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

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  logger.info('Token: ' + token)
  // const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  const payload = verify(token, cert, {
    algorithms: ['RS256']
  }) as JwtPayload

  logger.info('JwtPayload: ' + JSON.stringify(payload))
  return payload
}

