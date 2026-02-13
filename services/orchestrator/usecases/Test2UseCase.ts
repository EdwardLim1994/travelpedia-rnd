import type { UseCaseReversibleOperation } from "@travelpedia/libs/interfaces";

export class Test2UseCase implements UseCaseReversibleOperation {
  constructor() {}

  public async rollback(): Promise<void> {}

  public async execute(): Promise<void> {}
}
