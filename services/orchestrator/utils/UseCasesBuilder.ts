import type { UseCaseReversibleOperation } from "../libs/interfaces";

export class UseCasesBuilder {
  private tasks: Map<string, UseCaseReversibleOperation> = new Map<
    string,
    UseCaseReversibleOperation
  >();

  private constructor() {}

  public static init() {
    return new UseCasesBuilder();
  }

  public prepare(name: string, useCase: UseCaseReversibleOperation): this {
    this.tasks.set(name, useCase);
    return this;
  }

  public build(): Map<string, UseCaseReversibleOperation> {
    return this.tasks;
  }
}
