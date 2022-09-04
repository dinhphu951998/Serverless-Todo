import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

const todoTable = process.env.TODOS_TABLE
// const createdByIndex = process.env.TODOS_CREATED_BY_INDEX

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient()
  ) {}

  async getTodosByUserId(userId: string): Promise<TodoItem[]> {
    logger.info('getTodosByUserId running ' + userId)

    const result = await this.docClient
      .query({
        TableName: todoTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    logger.info(
      `getTodosByUserId completed ${userId} with ${result.Count} item(s)`
    )

    return result.Items as TodoItem[]
  }

  async createToDo(item: TodoItem): Promise<TodoItem> {
    logger.info('createToDo running ' + JSON.stringify(item))

    await this.docClient
      .put({
        TableName: todoTable,
        Item: item
      })
      .promise()

    logger.info('createToDo completed ' + item.todoId)

    return item
  }

  async updateTodo(item: TodoItem): Promise<TodoItem> {
    logger.info('updateTodo running ' + JSON.stringify(item))

    await this.docClient
      .update({
        TableName: todoTable,
        Key: {
          todoId: item.todoId,
          userId: item.userId
        },
        UpdateExpression:
          'set #name = :name, dueDate = :dueDate, done = :done, attachmentUrl = :attachmentUrl',
        ExpressionAttributeNames: {
          '#name': 'name'
        },
        ExpressionAttributeValues: {
          ':name': item.name,
          ':dueDate': item.dueDate,
          ':done': item.done,
          ':attachmentUrl': item.attachmentUrl
        }
      })
      .promise()

    logger.info('updateTodo completed ' + item.todoId)

    return item
  }

  async getTodoById(todoId: string, userId: string): Promise<TodoItem> {
    logger.info('getTodoById running ' + todoId)

    const result = await this.docClient
      .get({
        TableName: todoTable,
        Key: {
          todoId,
          userId
        }
      })
      .promise()

    logger.info('getTodoById completed ' + JSON.stringify(result))

    return result.Item as TodoItem
  }

  async deleteTodo(item: TodoItem): Promise<boolean> {
    logger.info('deleteTodo running ' + JSON.stringify(item))

    const result = await this.docClient
      .delete({
        TableName: todoTable,
        Key: {
          todoId: item.todoId,
          userId: item.userId
        }
      })
      .promise()

    logger.info('deleteTodo completed ' + JSON.stringify(result))

    return true
  }
}
