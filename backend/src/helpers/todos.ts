import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'

// TODO: Implement businessLogic

const logger = createLogger('TodosBusinessLogic')

const bucketName = process.env.ATTACHMENT_S3_BUCKET

const todoAccess = new TodosAccess()

export const getTodosForUser = async (userId: string): Promise<TodoItem[]> => {
  return await todoAccess.getTodosByUserId(userId)
}

export const createTodos = async (
  newTodo: CreateTodoRequest,
  userId: string
): Promise<TodoItem> => {
  const todoItem = {
    todoId: uuid.v4(),
    userId: userId,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: null,
    ...newTodo
  } as TodoItem

  await todoAccess.createToDo(todoItem)

  return todoItem
}

export const updateTodos = async (
  todo: UpdateTodoRequest,
  todoId: string
): Promise<TodoItem> => {
  const oldTodo = await todoAccess.getTodoById(todoId)
  if (oldTodo) {
    const todoItem = {
      ...oldTodo,
      ...todo
    } as TodoItem

    await todoAccess.updateTodo(todoItem)

    return todoItem
  } else {
    throw new createError.NotFound('Todo not found')
  }
}

export const deleteTodo = async (todoId: string) => {
  const todoItem = await todoAccess.getTodoById(todoId)

  if (todoItem) {
    await todoAccess.deleteTodo(todoId)
  } else {
    throw new createError.NotFound('Todo not found')
  }
}

export const createAttachmentPresignedUrl = async (
  todoId: string
): Promise<string> => {
  logger.info('createAttachmentPresignedUrl running ' + todoId)
  const todoItem = await todoAccess.getTodoById(todoId)

  if (todoItem) {
    logger.info(
      'createAttachmentPresignedUrl found ' + JSON.stringify(todoItem)
    )
    const attachmentUtils = new AttachmentUtils()
    const presignedUrl = attachmentUtils.getUploadUrl(todoId)

    //update todo
    const newTodo = {
      ...todoItem,
      attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`
    } as TodoItem
    await todoAccess.updateTodo(newTodo)

    return presignedUrl
  } else {
    logger.info('todo not found: ' + todoId)
    throw new createError.NotFound("Todo not found")
  }
}
