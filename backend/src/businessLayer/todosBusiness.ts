import * as dateFormat from 'dateformat'
import { EmailBusiness } from "./emailBusiness";
import { User } from "./../models/User";
import { TodosAccess } from "../dataLayer/todosAcess";
import { AttachmentUtils } from "../fileLayer/attachmentUtils";
import { TodoItem, TodoState } from "../models/TodoItem";
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";
import { createLogger } from "../utils/logger";
import * as uuid from "uuid";
import * as createError from "http-errors";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";

const logger = createLogger("TodosBusinessLogic");

const bucketName = process.env.ATTACHMENT_S3_BUCKET;

const todoAccess = new TodosAccess();

export const getTodosForUser = async (userId: string): Promise<TodoItem[]> => {
  return await todoAccess.getTodosByUserId(userId);
};

export const createTodos = async (
  newTodo: CreateTodoRequest,
  user: User
): Promise<TodoItem> => {
  const todoItem = {
    todoId: uuid.v4(),
    userId: user.sub,
    email: user.email,
    createdAt: new Date().toISOString(),
    done: false,
    notified: false,
    state: TodoState.INPROGRESS,
    attachmentUrl: null,
    ...newTodo,
  } as TodoItem;

  await todoAccess.createToDo(todoItem);

  return todoItem;
};

export const updateTodos = async (
  todo: UpdateTodoRequest,
  todoId: string,
  user: User
): Promise<TodoItem> => {
  const oldTodo = await todoAccess.getTodoById(todoId, user.sub);
  if (oldTodo) {
    const todoItem = {
      ...oldTodo,
      ...todo,
      email: user.email,
    } as TodoItem;

    todoItem.state = todoItem.done ? TodoState.COMPLETED : TodoState.INPROGRESS

    await todoAccess.updateTodo(todoItem);

    return todoItem;
  } else {
    throw new createError.NotFound("Todo not found");
  }
};

export const deleteTodo = async (todoId: string, userId: string) => {
  const todoItem = await todoAccess.getTodoById(todoId, userId);

  if (todoItem) {
    await todoAccess.deleteTodo(todoItem);
  } else {
    throw new createError.NotFound("Todo not found");
  }
};

export const createAttachmentPresignedUrl = async (
  todoId: string,
  userId: string
): Promise<string> => {
  logger.info("createAttachmentPresignedUrl running " + todoId);
  const todoItem = await todoAccess.getTodoById(todoId, userId);

  if (todoItem) {
    logger.info(
      "createAttachmentPresignedUrl found " + JSON.stringify(todoItem)
    );
    const attachmentUtils = new AttachmentUtils();
    const presignedUrl = attachmentUtils.getUploadUrl(todoId);

    //update todo
    const newTodo = {
      ...todoItem,
      attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`,
    } as TodoItem;
    await todoAccess.updateTodo(newTodo);

    return presignedUrl;
  } else {
    logger.info("todo not found: " + todoId);
    throw new createError.NotFound("Todo not found");
  }
};

export const getTodoById = async (todoId: string, userId: string) => {
  return await todoAccess.getTodoById(todoId, userId);
};

export const processDueTodo = async () => {
  try {
    const date = dateFormat(new Date(), 'yyyy-mm-dd');
    const todosList: TodoItem[] = await todoAccess.getDueTodo(date);
    if (todosList && todosList.length) {
      const emails = [...new Set(todosList.map((t) => t.email))];
      logger.info("Distinct email: " + emails);

      const emailBusiness = new EmailBusiness();

      for (const email of emails) {
        const todos = todosList.filter((t) => t.email === email);
        todos.map(t => t.notified = true)
        await emailBusiness.sendEmail(email, todos);
      }

      for (const todo of todosList) {
        await todoAccess.updateTodo(todo)
      }
    }
  } catch (e) {
    logger.info("Error happen while process due todo: " + JSON.stringify(e));
    throw new createError.InternalServerError("Exception occured!");
  }
};
