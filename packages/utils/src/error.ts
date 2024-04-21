export class ApiError extends Error {
  status: number

  constructor(status: number, message?: string) {
    const defaultMessage = ApiError.getDefaultMessageForStatus(status)
    super(message || defaultMessage)
    this.status = status

    Object.setPrototypeOf(this, ApiError.prototype)
  }

  private static getDefaultMessageForStatus(status: number): string {
    switch (status) {
      case 400:
        return 'Bad Request'
      case 401:
        return 'Unauthorized'
      case 403:
        return 'Forbidden'
      case 404:
        return 'Not Founnd'
      case 500:
        return 'Internal Server Error'
      default:
        return 'An error occured'
    }
  }
}
