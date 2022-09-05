import dateFormat from 'dateformat'

export const calculateDueDate = (): string => {
  const date = new Date()
  date.setDate(date.getDate() + 7)

  return dateFormat(date, 'yyyy-mm-dd') as string
}
