import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as middy from "middy";
import { cors, httpErrorHandler } from "middy/middlewares";
import { getTodoById } from "../../businessLayer/todosBusiness";
import { getToken, parseUserId } from "../../auth/utils";

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId;
    // Remove a TODO item by id
    const userId: string = parseUserId(getToken(event.headers.Authorization));
    const todoItem = getTodoById(todoId, userId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        item: todoItem,
      }),
    };
  }
);

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true,
  })
);
