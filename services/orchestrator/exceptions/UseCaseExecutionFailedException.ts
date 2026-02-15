export class UseCaseExecutionFailedException extends Error {
  constructor(message: string, trace?: ErrorOptions) {
    super(message, trace);
  }
}
