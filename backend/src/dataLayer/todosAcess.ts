import { TodoState } from "./../models/TodoItem";
import * as AWS from "aws-sdk";
const AWSXRay = require("aws-xray-sdk");
import { createLogger } from "../utils/logger";
import { TodoItem } from "../models/TodoItem";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger("TodosAccess");

const todoTable = process.env.TODOS_TABLE;
const createdAtIndex = process.env.TODOS_CREATED_AT_INDEX;

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient()
  ) {}

  async getTodosByUserId(userId: string): Promise<TodoItem[]> {
    logger.info("getTodosByUserId running " + userId);

    const result = await this.docClient
      .query({
        TableName: todoTable,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      })
      .promise();

    logger.info(
      `getTodosByUserId completed ${userId} with ${result.Count} item(s)`
    );

    return result.Items as TodoItem[];
  }

  async createToDo(item: TodoItem): Promise<TodoItem> {
    logger.info("createToDo running " + JSON.stringify(item));

    await this.docClient
      .put({
        TableName: todoTable,
        Item: item,
      })
      .promise();

    logger.info("createToDo completed " + item.todoId);

    return item;
  }

  async updateTodo(item: TodoItem): Promise<TodoItem> {
    logger.info("updateTodo running " + JSON.stringify(item));

    await this.docClient
      .update({
        TableName: todoTable,
        Key: {
          todoId: item.todoId,
          userId: item.userId,
        },
        UpdateExpression:
          "set #name = :name, dueDate = :dueDate, done = :done, attachmentUrl = :attachmentUrl, email = :email, #state = :state, notified = :notified",
        ExpressionAttributeNames: {
          "#name": "name",
          "#state": "state",
        },
        ExpressionAttributeValues: {
          ":name": item.name,
          ":dueDate": item.dueDate,
          ":done": item.done,
          ":email": item.email,
          ":attachmentUrl": item.attachmentUrl,
          ":state": item.state,
          ":notified": item.notified
        },
      })
      .promise();

    logger.info("updateTodo completed " + item.todoId);

    return item;
  }

  async getTodoById(todoId: string, userId: string): Promise<TodoItem> {
    logger.info("getTodoById running " + todoId);

    const result = await this.docClient
      .get({
        TableName: todoTable,
        Key: {
          todoId,
          userId,
        },
      })
      .promise();

    logger.info("getTodoById completed " + JSON.stringify(result));

    return result.Item as TodoItem;
  }

  async deleteTodo(item: TodoItem): Promise<boolean> {
    logger.info("deleteTodo running " + JSON.stringify(item));

    const result = await this.docClient
      .delete({
        TableName: todoTable,
        Key: {
          todoId: item.todoId,
          userId: item.userId,
        },
      })
      .promise();

    logger.info("deleteTodo completed " + JSON.stringify(result));

    return true;
  }

  async getDueTodo(date: string): Promise<TodoItem[]> {
    logger.info("getDueTodo running " + date);

    const result = await this.docClient
      .query({
        TableName: todoTable,
        IndexName: createdAtIndex,
        KeyConditionExpression: "#state = :state and dueDate <= :dueDate",
        ExpressionAttributeNames: {
          "#state": "state",
        },
        FilterExpression: "notified = :notified",
        ExpressionAttributeValues: {
          ":notified": false,
          ":state": TodoState.INPROGRESS,
          ":dueDate": date,
        },
      })
      .promise();

    logger.info("getDueTodo completed " + JSON.stringify(result));

    return result.Items as TodoItem[];
  }
}
