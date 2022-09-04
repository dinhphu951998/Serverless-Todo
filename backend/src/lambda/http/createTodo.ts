import { createTodos } from '../../businessLayer/todosBusiness'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getToken, parseUserId } from '../../auth/utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)

    if (!newTodo.name.trim()) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Invalid request body'
        })
      }
    }

    const userId: string = parseUserId(getToken(event.headers.Authorization))
    const todoItem = await createTodos(newTodo, userId)

    return {
      statusCode: 200,
      body: JSON.stringify({
        item: todoItem
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
