export class Logger {
  private static readonly isDev: boolean = ['development', 'test'].includes(process.env.NODE_ENV)
  private static readonly functionName: string = process.env.AWS_LAMBDA_FUNCTION_NAME

  private static logMessage(
    consoleFunc: (message?: any, ...optionalParams: any[]) => void,
    prefix: string,
    message: string | object,
  ): void {
    if (Logger.isDev) {
      const output = typeof message === 'object' ? JSON.stringify(message, null, 2) : message
      consoleFunc(`${prefix} - ${output}`)
    }
  }

  public static log(message: string | object): void {
    Logger.logMessage(console.log, `[${Logger.functionName}: LOG]`, message)
  }

  public static error(message: string | object): void {
    Logger.logMessage(console.error, `[${Logger.functionName}: ERROR]`, message)
  }
}
