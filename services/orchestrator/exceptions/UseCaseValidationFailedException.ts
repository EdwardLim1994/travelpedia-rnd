export class UseCaseValidationFailedException extends Error {
  constructor(message: string, trace?: ErrorOptions) {
    super(message, trace);
  }
}
