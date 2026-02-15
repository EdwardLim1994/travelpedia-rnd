export class UseCaseRollbackFailedException extends Error {
  constructor(message: string, trace?: ErrorOptions) {
    super(message, trace);
  }
}
