export class Logger {

  static log(message: string | object): void {
    console.log('in the loggers', process.env.NODE_ENV)
    const isDev = ['development', 'test'].includes(process.env.NODE_ENV)
    console.log(typeof message, message)
    if (isDev) {
      const output = typeof message === 'object' ? JSON.stringify(message, null, 2) : message
      console.log(`[LOG] - ${output}`)
    }
  }
}
