export class ErrorHandler extends Error {

  title?: string

  status: number

  constructor({ status, title, message }: { status: number; title?: string; message?: string }) {
    super(message)
    this.title = title
    this.status = status
  }
}
