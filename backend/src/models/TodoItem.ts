export class TodoItem {
  userId: string
  todoId: string
  createdAt: string
  name: string
  dueDate: string
  done: boolean
  email: string
  attachmentUrl?: string
  state: string = TodoState.INPROGRESS
  notified: boolean
}


export enum TodoState {
  INPROGRESS = "In-progress",
  COMPLETED = "Completed"
}