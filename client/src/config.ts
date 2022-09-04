// Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = process.env.REACT_APP_API_ID || ""
const stage = process.env.REACT_APP_STAGE || ""
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/${stage}`

export const authConfig = {
  // Create an Auth0 application and copy values from it into this map. For example:
  domain: process.env.REACT_APP_AUTH_DOMAIN || "",            // Auth0 domain
  clientId: process.env.REACT_APP_AUTH_CLIENT_ID || "",          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
